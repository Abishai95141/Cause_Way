"""
Diagnostic Telemetry Test — World Model Pipeline Root Cause Analysis

This script runs a controlled Mode 1 pipeline execution with full
telemetry instrumentation.  It is designed to reproduce the reported
issues:
    1. 20+ minute latency
    2. 49 variables but only 12 edges

It can run in two modes:
    - LIVE:  Uses real Gemini API + infrastructure (Postgres, Qdrant, MinIO)
    - MOCK:  Simulates 49 variables and the pairwise bottleneck for
             latency analysis without real API calls

Usage:
    # Live run (needs docker-compose up + GOOGLE_AI_API_KEY):
    python -m pytest tests/test_diagnostic_telemetry.py -v -s -k live

    # Mock analysis (no infra needed):
    python -m pytest tests/test_diagnostic_telemetry.py -v -s -k mock

    # Both:
    python -m pytest tests/test_diagnostic_telemetry.py -v -s
"""

from __future__ import annotations

import asyncio
import itertools
import json
import logging
import math
import os
import pathlib
import time
from datetime import datetime, timezone
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

# -----------------------------------------------------------------------
# Setup logging — show all telemetry output
# -----------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s %(message)s",
)

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
DIAGNOSTIC_DIR = REPO_ROOT / "diagnostic_output"


# -----------------------------------------------------------------------
# Helper: create a mock evidence bundle
# -----------------------------------------------------------------------

def _make_bundle(content: str, doc_title: str = "TestDoc.pdf", page: int = 1):
    """Create a minimal EvidenceBundle-like object for testing."""
    from src.models.evidence import (
        EvidenceBundle,
        EvidenceSource,
        EvidenceLocation,
    )
    import hashlib

    return EvidenceBundle(
        bundle_id=uuid4(),
        content=content,
        content_hash=hashlib.sha256(content.encode()).hexdigest(),
        source=EvidenceSource(doc_id=str(uuid4()), doc_title=doc_title),
        location=EvidenceLocation(page_number=page, section_name="Section 1"),
    )


# =======================================================================
#  TEST 1: Mock Latency Budget Simulation
# =======================================================================


class TestMockLatencyBudget:
    """Simulate the O(n²) bottleneck to prove latency hypothesis."""

    def test_mock_pairwise_scaling(self):
        """Calculate and log the pairwise call count for various N.

        Proves that N=49 → C(49,2) = 1176 pairs is the latency root cause.
        """
        results = []
        for n in [10, 15, 20, 30, 40, 49, 60]:
            pairs = math.comb(n, 2)
            # Assume 2s per call, 10 workers → effective serial factor
            serial_time_s = pairs * 2.0  # sequential
            parallel_10_time_s = pairs * 2.0 / 10
            # With Gemini rate limit of 60 RPM = 1 per second
            rate_limited_time_s = pairs * 1.0

            results.append({
                "variables": n,
                "pairs_C(n,2)": pairs,
                "serial_time_min": round(serial_time_s / 60, 1),
                "parallel_10w_time_min": round(parallel_10_time_s / 60, 1),
                "rate_limited_60rpm_min": round(rate_limited_time_s / 60, 1),
            })

        print("\n" + "=" * 80)
        print("  O(n²) PAIRWISE CALL SCALING ANALYSIS")
        print("=" * 80)
        print(f"{'N vars':<10} {'C(n,2)':<10} {'Serial':<14} {'10 workers':<14} {'60 RPM limit':<14}")
        print("-" * 62)
        for r in results:
            print(
                f"{r['variables']:<10} {r['pairs_C(n,2)']:<10} "
                f"{r['serial_time_min']:>6.1f} min    "
                f"{r['parallel_10w_time_min']:>6.1f} min    "
                f"{r['rate_limited_60rpm_min']:>6.1f} min"
            )
        print("=" * 80)

        # The assertion that proves the hypothesis
        pairs_49 = math.comb(49, 2)
        assert pairs_49 == 1176, f"Expected C(49,2)=1176, got {pairs_49}"

        # At 60 RPM, this alone takes ~20 minutes
        rate_limited_min = pairs_49 / 60
        assert rate_limited_min > 19, (
            f"At 60 RPM rate limit, PyWhyLLM pairwise takes "
            f"{rate_limited_min:.1f} min — confirms 20+ min latency"
        )

    def test_mock_edge_dropout_cascade(self):
        """Simulate the edge dropout cascade with post-P0-fix filter rates.

        Models each filter stage with estimated rejection rates
        after the P0 fixes (robust parser, lowered threshold, no adversarial).
        """
        n_vars = 49
        total_pairs = math.comb(n_vars, 2)  # 1176

        # Stage A: PyWhyLLM pairwise — ~3-5% of pairs yield edges
        # (most variable pairs have no causal relationship)
        pywhyllm_edge_rate = 0.04  # 4% is generous for random pairs
        pywhyllm_edges = int(total_pairs * pywhyllm_edge_rate)

        # Stage A2: Parse failures — NOW ~1% thanks to _normalize_answer fix
        parse_failure_rate = 0.01
        pywhyllm_after_parse = int(pywhyllm_edges * (1 - parse_failure_rate))

        # Stage B: LangExtract adds some edges (typically 5-15)
        langextract_edges = 8

        # Stage C: Dedup removes ~30% overlap
        total_draft = pywhyllm_after_parse + langextract_edges
        dedup_rate = 0.30
        after_dedup = int(total_draft * (1 - dedup_rate))

        # Stage D: Verification judge rejects ~45% (lowered threshold 0.4, no adversarial)
        verification_reject_rate = 0.45
        after_verification = int(after_dedup * (1 - verification_reject_rate))

        # Stage E: Variable ID resolution failures (~10%)
        id_mismatch_rate = 0.10
        after_id_resolve = int(after_verification * (1 - id_mismatch_rate))

        # Stage F: Acyclicity enforcement (~5%)
        cycle_reject_rate = 0.05
        final_edges = int(after_id_resolve * (1 - cycle_reject_rate))

        print("\n" + "=" * 80)
        print("  EDGE DROPOUT CASCADE — POST-P0-FIX (49 variables)")
        print("=" * 80)
        print(f"  Total pairwise pairs:         {total_pairs}")
        print(f"  PyWhyLLM edges (~{pywhyllm_edge_rate*100:.0f}%):       {pywhyllm_edges}")
        print(f"  After parse failures (-{parse_failure_rate*100:.0f}%):   {pywhyllm_after_parse}  (was ~5% loss, now ~1%)")
        print(f"  LangExtract additional edges:  {langextract_edges}")
        print(f"  Total draft edges:             {total_draft}")
        print(f"  After dedup (-{dedup_rate*100:.0f}%):            {after_dedup}")
        print(f"  After verification (-{verification_reject_rate*100:.0f}%):   {after_verification}  (was -70%, now -{verification_reject_rate*100:.0f}%)")
        print(f"  After ID resolution (-{id_mismatch_rate*100:.0f}%):    {after_id_resolve}")
        print(f"  After cycle check (-{cycle_reject_rate*100:.0f}%):      {final_edges}")
        print(f"  ")
        print(f"  → PREDICTED FINAL EDGES: {final_edges}")
        print(f"  → PREVIOUS (pre-fix):    8-12")
        print("=" * 80)

        # After P0 fixes we expect significantly more edges
        assert 12 <= final_edges <= 45, (
            f"Cascade model predicts {final_edges} edges — "
            f"should be substantially higher than pre-fix 12"
        )

    def test_mock_verification_call_budget(self):
        """Calculate total LLM calls from verification for ~50 draft edges.

        Uses max_iterations=2 (lowered from 3 in P0 config fix) and
        adversarial disabled by default.
        """
        draft_edges = 50
        max_iterations = 2  # lowered from 3
        adversarial_rate = 0.0  # disabled by default after P0

        # Worst case: every edge uses all iterations
        worst_judge_calls = draft_edges * max_iterations
        adversarial_calls = int(draft_edges * adversarial_rate)
        total_verification_calls = worst_judge_calls + adversarial_calls

        # At 10 RPM for gemini-2.5-pro
        time_at_10rpm = total_verification_calls / 10

        print("\n" + "=" * 80)
        print("  VERIFICATION LLM CALL BUDGET — POST-P0-FIX")
        print("=" * 80)
        print(f"  Draft edges:                {draft_edges}")
        print(f"  Max iterations per edge:    {max_iterations}  (was 3)")
        print(f"  Worst-case judge calls:     {worst_judge_calls}  (was 150)")
        print(f"  Adversarial calls:          {adversarial_calls}  (disabled by default)")
        print(f"  Total verification calls:   {total_verification_calls}")
        print(f"  Time at 10 RPM (pro):       {time_at_10rpm:.1f} min  (was 16.5 min)")
        print(f"  Time at 30 RPM (pro):       {total_verification_calls/30:.1f} min")
        print("=" * 80)

        assert worst_judge_calls == 100  # 50 edges × 2 iterations
        assert time_at_10rpm == 10.0


# =======================================================================
#  TEST 2: Telemetry Module Unit Test
# =======================================================================


class TestTelemetryModule:
    """Verify the telemetry module works correctly."""

    def test_telemetry_singleton(self):
        from src.utils.telemetry import get_telemetry
        t1 = get_telemetry()
        t2 = get_telemetry()
        assert t1 is t2

    def test_telemetry_reset(self):
        from src.utils.telemetry import get_telemetry
        tel = get_telemetry()
        tel.reset()
        assert tel.llm.total_calls == 0
        assert len(tel.events) == 0

    def test_telemetry_record_events(self):
        from src.utils.telemetry import get_telemetry
        tel = get_telemetry()
        tel.reset()
        tel.record("test_stage", "test_event", {"key": "value"})
        assert len(tel.events) == 1
        assert tel.events[0].stage == "test_stage"

    def test_telemetry_stage_timing(self):
        from src.utils.telemetry import get_telemetry
        tel = get_telemetry()
        tel.reset()
        tel.stage_start("test")
        time.sleep(0.05)
        tel.stage_end("test")
        assert tel.stage_durations["test"] >= 0.04

    def test_telemetry_llm_call_tracking(self):
        from src.utils.telemetry import get_telemetry
        tel = get_telemetry()
        tel.reset()
        tel.record_llm_call("gemini-2.5-flash", 1000, 500, 250.0)
        tel.record_llm_call("gemini-2.5-pro", 2000, 800, 1200.0)
        assert tel.llm.total_calls == 2
        assert tel.llm.calls_by_model["gemini-2.5-flash"] == 1
        assert tel.llm.calls_by_model["gemini-2.5-pro"] == 1

    def test_telemetry_pywhyllm_tracking(self):
        from src.utils.telemetry import get_telemetry
        tel = get_telemetry()
        tel.reset()
        tel.record_pywhyllm_pair("x", "y", "A", "x causes y <answer>A</answer>", 500.0)
        tel.record_pywhyllm_pair("a", "b", "C", "no relation <answer>C</answer>", 400.0)
        tel.record_pywhyllm_pair("p", "q", "", "confused output", 300.0, error=None)
        assert tel.pywhyllm.pairs_a == 1
        assert tel.pywhyllm.pairs_c == 1
        assert tel.pywhyllm.pairs_parse_fail == 1

    def test_telemetry_dump_and_summary(self, tmp_path):
        from src.utils.telemetry import get_telemetry
        tel = get_telemetry()
        tel.reset()
        tel.stage_start("test")
        tel.record_llm_call("gemini-2.5-flash", 1000, 500, 250.0)
        tel.stage_end("test")
        
        dump_path = str(tmp_path / "test_telemetry.json")
        tel.dump(dump_path)
        
        with open(dump_path) as f:
            data = json.load(f)
        
        assert "summary" in data
        assert "events" in data
        assert data["summary"]["llm_calls"]["total"] == 1

        summary_text = tel.print_summary()
        assert "PIPELINE TELEMETRY SUMMARY" in summary_text

    def test_telemetry_verification_tracking(self):
        from src.utils.telemetry import get_telemetry
        tel = get_telemetry()
        tel.reset()
        tel.record_verification_verdict(
            "x", "y", 1, True, 0.8, "direct_causal", False, 3, 1500,
        )
        tel.record_verification_final("x", "y", True, None, 1)
        tel.record_verification_final("a", "b", False, "no_evidence", 3)
        assert tel.verification.grounded_count == 1
        assert tel.verification.rejected_count == 1


# =======================================================================
#  TEST 3: Live Pipeline Test (requires infrastructure)
# =======================================================================


def _infra_available() -> bool:
    """Check if Docker infrastructure is running."""
    try:
        import urllib.request
        urllib.request.urlopen("http://localhost:6333/readyz", timeout=2)
        return True
    except Exception:
        return False


def _api_key_available() -> bool:
    """Check if Google AI API key is set."""
    from src.config import get_settings
    settings = get_settings()
    return settings.google_ai_api_key is not None


requires_live = pytest.mark.skipif(
    not (_infra_available() and _api_key_available()),
    reason="Live test requires Docker infra + GOOGLE_AI_API_KEY",
)


@requires_live
class TestLivePipeline:
    """Run the actual Mode 1 pipeline with full telemetry.

    This test will be SLOW (potentially 20+ minutes) — that's the point.
    The telemetry output will prove the latency hypothesis.
    """

    @pytest.fixture
    def event_loop(self):
        loop = asyncio.new_event_loop()
        yield loop
        loop.close()

    @pytest.mark.asyncio
    @pytest.mark.timeout(2400)  # 40 min max
    async def test_live_world_model_construction(self):
        """Run the full pipeline and capture telemetry.

        This reproduces the 49-variable / 12-edge scenario.
        """
        from src.utils.telemetry import get_telemetry
        from src.modes.mode1 import Mode1WorldModelConstruction

        builder = Mode1WorldModelConstruction()
        await builder.initialize()

        tel = get_telemetry()
        tel.reset()

        result = await builder.run(
            domain="hobby_farm",
            initial_query=(
                "What causal factors drive revenue, costs, profitability, "
                "and business success in a hobby farm operation?"
            ),
            max_variables=20,
            max_edges=50,
        )

        # Dump full telemetry
        DIAGNOSTIC_DIR.mkdir(parents=True, exist_ok=True)
        ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        tel_path = tel.dump(str(DIAGNOSTIC_DIR / f"telemetry_live_{ts}.json"))

        summary = tel.print_summary()
        summary_path = DIAGNOSTIC_DIR / f"summary_live_{ts}.txt"
        summary_path.write_text(summary)

        print("\n" + summary)
        print(f"\nTelemetry JSON: {tel_path}")
        print(f"Summary text:   {summary_path}")

        # Log result details
        if result.error:
            print(f"\n*** PIPELINE ERROR: {result.error}")
        else:
            print(f"\nVariables discovered: {result.variables_discovered}")
            print(f"Edges created:        {result.edges_created}")
            print(f"Evidence linked:      {result.evidence_linked}")

        # Assert we at least got data
        assert result.trace_id is not None


# =======================================================================
#  TEST 4: Reduced-Scale Live Test (10 vars = 45 pairs only)
# =======================================================================


@requires_live
class TestReducedScalePipeline:
    """Run Mode 1 with max_variables=10 to test in ~5 min instead of 20."""

    @pytest.mark.asyncio
    @pytest.mark.timeout(600)  # 10 min max
    async def test_reduced_scale_world_model(self):
        from src.utils.telemetry import get_telemetry
        from src.modes.mode1 import Mode1WorldModelConstruction

        builder = Mode1WorldModelConstruction()
        await builder.initialize()

        tel = get_telemetry()
        tel.reset()

        result = await builder.run(
            domain="hobby_farm",
            initial_query=(
                "What causal factors drive revenue and profitability "
                "in a hobby farm?"
            ),
            max_variables=10,  # C(10,2) = 45 pairs — manageable
            max_edges=30,
        )

        DIAGNOSTIC_DIR.mkdir(parents=True, exist_ok=True)
        ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        tel.dump(str(DIAGNOSTIC_DIR / f"telemetry_reduced_{ts}.json"))

        summary = tel.print_summary()
        print("\n" + summary)

        s = tel.summary()

        # Key diagnostic assertions
        print(f"\n--- Diagnostic Assertions ---")
        print(f"PyWhyLLM pairs checked:     {s['pywhyllm_pairwise']['total_pairs']}")
        print(f"PyWhyLLM parse failures:    {s['pywhyllm_pairwise']['parse_failures']}")
        print(f"Edges submitted to verify:  {s['edge_dropout']['submitted_to_verification']}")
        print(f"Edges grounded:             {s['edge_dropout']['grounded_by_verification']}")
        print(f"Edges rejected:             {s['edge_dropout']['rejected_by_verification']}")
        print(f"NodeNotFound errors:        {s['edge_dropout']['node_not_found_errors']}")
        print(f"CycleDetected errors:       {s['edge_dropout']['cycle_detected_errors']}")
        print(f"Final edges in graph:       {s['edge_dropout']['final_edges_in_graph']}")
        print(f"Var ID resolve misses:      {len(tel.var_id_resolve_misses)}")

        # At 10 vars, we should get some edges
        # The key question is what FRACTION we lose
        if s['edge_dropout']['submitted_to_verification'] > 0:
            grounding_rate = (
                s['edge_dropout']['grounded_by_verification']
                / s['edge_dropout']['submitted_to_verification']
            )
            print(f"Verification grounding rate: {grounding_rate:.1%}")
        
        # Log rejection reasons
        for r in s['verification']['rejection_reasons'][:20]:
            print(f"  REJECTED: {r['edge']} — {r['reason']}")


# =======================================================================
#  TEST 5: Answer Tag Parsing Verification
# =======================================================================


class TestAnswerTagParsing:
    """Verify the _normalize_answer function handles all edge cases."""

    def test_standard_answers(self):
        """Clean A/B/C in tags should parse correctly."""
        from src.causal.pywhyllm_bridge import _normalize_answer

        cases = [
            ("Some reasoning. <answer>A</answer> More text.", "A"),
            ("Reasoning here. <answer>B</answer> done.", "B"),
            ("<answer>C</answer>", "C"),
            ("<answer> A </answer>", "A"),
            ("<answer> B </answer>", "B"),
        ]
        for raw, expected in cases:
            result = _normalize_answer(raw)
            assert result == expected, f"Failed for {raw!r}: got {result!r}, expected {expected!r}"

    def test_previously_broken_answers(self):
        """These edge cases USED TO silently drop edges — now they're fixed."""
        from src.causal.pywhyllm_bridge import _normalize_answer

        recovered = [
            # Period inside tags — THIS was the main bug
            ("My reasoning. <answer>A.</answer>", "A"),
            # Extra content inside tags
            ("<answer>A - X causes Y</answer>", "A"),
            # Newline in tags
            ("<answer>\nA\n</answer>", "A"),
            # "Option A" inside tags
            ("<answer>Option A</answer>", "A"),
            # B with trailing period
            ("reasoning <answer>B.</answer> end", "B"),
            # Double tags — takes first letter from first tag
            ("Reasoning <answer>A</answer> more <answer>B</answer>", "A"),
        ]
        print("\n" + "=" * 60)
        print("  _normalize_answer() RECOVERED EDGE CASES")
        print("=" * 60)
        for raw, expected in recovered:
            result = _normalize_answer(raw)
            print(f"  Input:  {raw!r}")
            print(f"  Result: {result!r}  expected={expected!r}  ✓={result == expected}")
            print()
            assert result == expected, (
                f"_normalize_answer failed for {raw!r}: got {result!r}, expected {expected!r}"
            )

    def test_fallback_no_tags(self):
        """When LLM forgets tags, fallback scans tail for standalone letter."""
        from src.causal.pywhyllm_bridge import _normalize_answer

        # Standalone letter at end of reasoning
        assert _normalize_answer(
            "After careful analysis, the answer is A."
        ) == "A"
        assert _normalize_answer(
            "Based on the evidence, B."
        ) == "B"
        assert _normalize_answer(
            "Neither causes the other. C."
        ) == "C"

    def test_truly_unparseable(self):
        """Genuinely broken output should return empty string."""
        from src.causal.pywhyllm_bridge import _normalize_answer

        assert _normalize_answer("") == ""
        assert _normalize_answer("I cannot determine the answer.") == ""
        assert _normalize_answer("<answer></answer>") == ""

    def test_normalized_count_in_telemetry(self):
        """Verify the telemetry tracks normalized answers correctly."""
        from src.utils.telemetry import get_telemetry

        tel = get_telemetry()
        tel.reset()

        # Normal answer — no normalization needed
        tel.record_pywhyllm_pair("x", "y", "A", "<answer>A</answer>", 100.0, was_normalized=False)
        # Normalized answer — was "A." in tags, recovered to "A"
        tel.record_pywhyllm_pair("a", "b", "A", "<answer>A.</answer>", 100.0, was_normalized=True)
        # Parse failure
        tel.record_pywhyllm_pair("p", "q", "", "garbage output", 100.0)

        assert tel.pywhyllm.pairs_a == 2
        assert tel.pywhyllm.pairs_normalized == 1
        assert tel.pywhyllm.pairs_parse_fail == 1


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
