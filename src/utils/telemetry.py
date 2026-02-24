"""
Pipeline Telemetry

Lightweight, non-destructive telemetry for the world-model building
pipeline.  Records timestamped events, LLM call metrics, edge dropout
statistics, and raw outputs so that a post-hoc root-cause analysis can
identify exactly where time is spent and where edges are lost.

Usage::

    from src.utils.telemetry import get_telemetry

    tel = get_telemetry()
    tel.reset()                       # start of a pipeline run
    tel.stage_start("dag_drafting")
    tel.record("dag_drafting", "pywhyllm_pair_result", {...})
    tel.stage_end("dag_drafting")
    tel.dump("diagnostic_output/telemetry.json")
"""

from __future__ import annotations

import json
import logging
import os
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any, Optional

_logger = logging.getLogger(__name__)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Event record
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@dataclass
class TelemetryEvent:
    """Single telemetry data-point."""
    stage: str
    event: str
    timestamp: float          # time.monotonic() for latency math
    wall_clock: str           # ISO-8601 for human readability
    data: dict[str, Any] = field(default_factory=dict)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Counters
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@dataclass
class LLMCallCounter:
    """Accumulated stats for LLM calls."""
    total_calls: int = 0
    total_prompt_chars: int = 0
    total_completion_chars: int = 0
    total_prompt_tokens_est: int = 0   # len(text) // 4
    total_retries: int = 0
    total_errors: int = 0
    total_quota_errors: int = 0
    total_fallbacks: int = 0           # native → prompt-injection
    calls_by_model: dict[str, int] = field(default_factory=dict)
    latency_samples_ms: list[float] = field(default_factory=list)


@dataclass
class PyWhyLLMCounter:
    """Stats specifically for the O(n²) pairwise stage."""
    total_pairs: int = 0
    pairs_a: int = 0       # var1 → var2
    pairs_b: int = 0       # var2 → var1
    pairs_c: int = 0       # no relationship
    pairs_normalized: int = 0  # answers recovered via _normalize_answer (were not exact A/B/C before normalization)
    pairs_parse_fail: int = 0
    pairs_exception: int = 0
    raw_outputs: list[dict[str, Any]] = field(default_factory=list)
    per_call_latency_ms: list[float] = field(default_factory=list)


@dataclass
class VerificationCounter:
    """Stats for the verification loop."""
    total_edges_submitted: int = 0
    total_judge_calls: int = 0
    total_adversarial_calls: int = 0
    grounded_count: int = 0
    rejected_count: int = 0
    no_evidence_count: int = 0
    exhausted_iterations_count: int = 0
    duplicate_query_breaks: int = 0
    adversarial_rejections: int = 0
    rejection_reasons: list[dict[str, str]] = field(default_factory=list)
    verdict_confidences: list[float] = field(default_factory=list)


@dataclass
class EdgeDropoutTracker:
    """Tracks where edges are lost across stages."""
    pywhyllm_proposed: int = 0
    langextract_proposed: int = 0
    total_after_dedup: int = 0
    after_mechanism_synthesis: int = 0
    submitted_to_verification: int = 0
    grounded_by_verification: int = 0
    rejected_by_verification: int = 0
    node_not_found_errors: int = 0
    cycle_detected_errors: int = 0
    other_add_errors: int = 0
    final_edges_in_graph: int = 0


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Main telemetry singleton
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class PipelineTelemetry:
    """Lightweight in-process telemetry for the Mode 1 pipeline."""

    def __init__(self) -> None:
        self._lock = Lock()
        self.reset()

    def reset(self) -> None:
        """Clear all counters and events for a fresh run."""
        with self._lock:
            self.run_start: float = time.monotonic()
            self.run_start_wall: str = datetime.now(timezone.utc).isoformat()
            self.events: list[TelemetryEvent] = []
            self.stage_starts: dict[str, float] = {}
            self.stage_durations: dict[str, float] = {}
            self.llm = LLMCallCounter()
            self.pywhyllm = PyWhyLLMCounter()
            self.verification = VerificationCounter()
            self.edge_dropout = EdgeDropoutTracker()
            self.variable_count_raw: int = 0
            self.variable_count_canonical: int = 0
            self.variable_count_added: int = 0
            self.evidence_cache_size: int = 0
            self.var_id_resolve_misses: list[dict[str, str]] = []

    # ── Stage timing ──────────────────────────────────────────────────

    def stage_start(self, stage: str) -> None:
        with self._lock:
            self.stage_starts[stage] = time.monotonic()
        self.record(stage, "stage_start", {})

    def stage_end(self, stage: str, extra: dict[str, Any] | None = None) -> None:
        with self._lock:
            t0 = self.stage_starts.get(stage)
            elapsed = (time.monotonic() - t0) if t0 else 0.0
            self.stage_durations[stage] = elapsed
        payload = {"elapsed_seconds": round(elapsed, 3)}
        if extra:
            payload.update(extra)
        self.record(stage, "stage_end", payload)
        _logger.info(
            "[TELEMETRY] Stage '%s' completed in %.2fs | %s",
            stage, elapsed, json.dumps(extra or {}, default=str)[:300],
        )

    # ── Generic event recorder ────────────────────────────────────────

    def record(self, stage: str, event: str, data: dict[str, Any]) -> None:
        ev = TelemetryEvent(
            stage=stage,
            event=event,
            timestamp=time.monotonic(),
            wall_clock=datetime.now(timezone.utc).isoformat(),
            data=data,
        )
        with self._lock:
            self.events.append(ev)

    # ── LLM call tracking ────────────────────────────────────────────

    def record_llm_call(
        self,
        model: str,
        prompt_chars: int,
        completion_chars: int,
        latency_ms: float,
        prompt_tokens: int = 0,
        completion_tokens: int = 0,
    ) -> None:
        with self._lock:
            self.llm.total_calls += 1
            self.llm.total_prompt_chars += prompt_chars
            self.llm.total_completion_chars += completion_chars
            self.llm.total_prompt_tokens_est += prompt_chars // 4
            self.llm.latency_samples_ms.append(latency_ms)
            self.llm.calls_by_model[model] = self.llm.calls_by_model.get(model, 0) + 1
            if prompt_tokens:
                self.llm.total_prompt_tokens_est = max(
                    self.llm.total_prompt_tokens_est,
                    prompt_tokens,
                )

    def record_llm_retry(self, model: str, attempt: int, error: str) -> None:
        with self._lock:
            self.llm.total_retries += 1
        self.record("llm", "retry", {
            "model": model, "attempt": attempt, "error": error[:300],
        })

    def record_llm_error(self, model: str, error: str, is_quota: bool = False) -> None:
        with self._lock:
            self.llm.total_errors += 1
            if is_quota:
                self.llm.total_quota_errors += 1
        self.record("llm", "error", {
            "model": model, "error": error[:500], "is_quota": is_quota,
        })

    def record_llm_fallback(self, model: str) -> None:
        with self._lock:
            self.llm.total_fallbacks += 1
        self.record("llm", "native_to_prompt_fallback", {"model": model})

    # ── PyWhyLLM pairwise tracking ───────────────────────────────────

    def record_pywhyllm_pair(
        self,
        var1: str,
        var2: str,
        answer: str,
        raw_description: str,
        latency_ms: float,
        error: str | None = None,
        *,
        was_normalized: bool = False,
    ) -> None:
        with self._lock:
            self.pywhyllm.total_pairs += 1
            self.pywhyllm.per_call_latency_ms.append(latency_ms)
            if error:
                self.pywhyllm.pairs_exception += 1
            elif answer == "A":
                self.pywhyllm.pairs_a += 1
            elif answer == "B":
                self.pywhyllm.pairs_b += 1
            elif answer == "C":
                self.pywhyllm.pairs_c += 1
            else:
                self.pywhyllm.pairs_parse_fail += 1
            if was_normalized:
                self.pywhyllm.pairs_normalized += 1
            # Store raw output for forensic analysis (limit to 200 samples)
            if len(self.pywhyllm.raw_outputs) < 200:
                self.pywhyllm.raw_outputs.append({
                    "var1": var1,
                    "var2": var2,
                    "answer_parsed": answer,
                    "raw_description": raw_description[:500] if raw_description else "",
                    "latency_ms": round(latency_ms, 1),
                    "error": error,
                })

    # ── Verification tracking ────────────────────────────────────────

    def record_verification_verdict(
        self,
        from_var: str,
        to_var: str,
        iteration: int,
        is_grounded: bool,
        confidence: float,
        support_type: str,
        has_refinement: bool,
        evidence_chunk_count: int,
        evidence_block_chars: int,
    ) -> None:
        with self._lock:
            self.verification.total_judge_calls += 1
            self.verification.verdict_confidences.append(confidence)
        self.record("verification", "judge_verdict", {
            "edge": f"{from_var}->{to_var}",
            "iteration": iteration,
            "is_grounded": is_grounded,
            "confidence": confidence,
            "support_type": support_type,
            "has_refinement": has_refinement,
            "evidence_chunk_count": evidence_chunk_count,
            "evidence_block_chars": evidence_block_chars,
        })

    def record_verification_final(
        self,
        from_var: str,
        to_var: str,
        grounded: bool,
        rejection_reason: str | None,
        iterations_used: int,
    ) -> None:
        with self._lock:
            if grounded:
                self.verification.grounded_count += 1
            else:
                self.verification.rejected_count += 1
                self.verification.rejection_reasons.append({
                    "edge": f"{from_var}->{to_var}",
                    "reason": rejection_reason or "unknown",
                    "iterations": iterations_used,
                })

    def record_var_id_resolve_miss(
        self,
        raw_id: str,
        resolved_id: str,
        match_type: str,
    ) -> None:
        with self._lock:
            self.var_id_resolve_misses.append({
                "raw_id": raw_id,
                "resolved_id": resolved_id,
                "match_type": match_type,
            })

    # ── Dump to file ─────────────────────────────────────────────────

    def summary(self) -> dict[str, Any]:
        """Return a serialisable summary of the entire run."""
        total_run_time = time.monotonic() - self.run_start
        avg_pywhyllm = (
            sum(self.pywhyllm.per_call_latency_ms)
            / max(len(self.pywhyllm.per_call_latency_ms), 1)
        )
        avg_llm = (
            sum(self.llm.latency_samples_ms)
            / max(len(self.llm.latency_samples_ms), 1)
        )
        return {
            "run_start_utc": self.run_start_wall,
            "total_run_seconds": round(total_run_time, 2),
            "stage_durations_seconds": {
                k: round(v, 2) for k, v in self.stage_durations.items()
            },
            "variables": {
                "raw_discovered": self.variable_count_raw,
                "after_canonicalization": self.variable_count_canonical,
                "added_to_engine": self.variable_count_added,
            },
            "llm_calls": {
                "total": self.llm.total_calls,
                "by_model": self.llm.calls_by_model,
                "total_prompt_chars": self.llm.total_prompt_chars,
                "total_completion_chars": self.llm.total_completion_chars,
                "est_total_prompt_tokens": self.llm.total_prompt_tokens_est,
                "avg_latency_ms": round(avg_llm, 1),
                "retries": self.llm.total_retries,
                "errors": self.llm.total_errors,
                "quota_errors": self.llm.total_quota_errors,
                "fallbacks_to_prompt_injection": self.llm.total_fallbacks,
            },
            "pywhyllm_pairwise": {
                "total_pairs": self.pywhyllm.total_pairs,
                "theoretical_pairs_formula": "C(n,2) = n*(n-1)/2",
                "edges_found_A": self.pywhyllm.pairs_a,
                "edges_found_B": self.pywhyllm.pairs_b,
                "no_relationship_C": self.pywhyllm.pairs_c,
                "answers_recovered_via_normalization": self.pywhyllm.pairs_normalized,
                "parse_failures": self.pywhyllm.pairs_parse_fail,
                "exceptions": self.pywhyllm.pairs_exception,
                "avg_latency_ms": round(avg_pywhyllm, 1),
            },
            "edge_dropout": asdict(self.edge_dropout),
            "verification": {
                "edges_submitted": self.verification.total_edges_submitted,
                "judge_calls": self.verification.total_judge_calls,
                "adversarial_calls": self.verification.total_adversarial_calls,
                "grounded": self.verification.grounded_count,
                "rejected": self.verification.rejected_count,
                "no_evidence_retrievals": self.verification.no_evidence_count,
                "exhausted_iterations": self.verification.exhausted_iterations_count,
                "duplicate_query_breaks": self.verification.duplicate_query_breaks,
                "adversarial_rejections": self.verification.adversarial_rejections,
                "avg_verdict_confidence": round(
                    sum(self.verification.verdict_confidences)
                    / max(len(self.verification.verdict_confidences), 1),
                    3,
                ),
                "rejection_reasons": self.verification.rejection_reasons[:50],
            },
            "var_id_resolve_misses": self.var_id_resolve_misses[:30],
            "evidence_cache_size": self.evidence_cache_size,
        }

    def dump(self, path: str) -> str:
        """Dump the full telemetry to a JSON file.

        Returns the absolute path written.
        """
        out = Path(path)
        out.parent.mkdir(parents=True, exist_ok=True)

        payload = {
            "summary": self.summary(),
            "pywhyllm_raw_outputs": self.pywhyllm.raw_outputs,
            "events": [
                {
                    "stage": ev.stage,
                    "event": ev.event,
                    "wall_clock": ev.wall_clock,
                    "elapsed_since_start": round(ev.timestamp - self.run_start, 3),
                    "data": ev.data,
                }
                for ev in self.events
            ],
        }

        abs_path = str(out.resolve())
        with open(abs_path, "w") as f:
            json.dump(payload, f, indent=2, default=str)

        _logger.info("[TELEMETRY] Full telemetry dumped to %s", abs_path)
        return abs_path

    def print_summary(self) -> str:
        """Return a human-readable summary string."""
        s = self.summary()
        lines = [
            "=" * 72,
            " PIPELINE TELEMETRY SUMMARY",
            "=" * 72,
            f"Total run time:    {s['total_run_seconds']:.1f}s",
            "",
            "── Stage Durations ──",
        ]
        for stage, dur in s["stage_durations_seconds"].items():
            pct = (dur / max(s["total_run_seconds"], 0.001)) * 100
            lines.append(f"  {stage:30s}  {dur:8.1f}s  ({pct:5.1f}%)")

        lines += [
            "",
            "── Variables ──",
            f"  Raw discovered:          {s['variables']['raw_discovered']}",
            f"  After canonicalization:  {s['variables']['after_canonicalization']}",
            f"  Added to engine:         {s['variables']['added_to_engine']}",
            "",
            "── LLM Calls ──",
            f"  Total calls:     {s['llm_calls']['total']}",
            f"  By model:        {s['llm_calls']['by_model']}",
            f"  Avg latency:     {s['llm_calls']['avg_latency_ms']:.0f}ms",
            f"  Retries:         {s['llm_calls']['retries']}",
            f"  Errors:          {s['llm_calls']['errors']}",
            f"  Quota errors:    {s['llm_calls']['quota_errors']}",
            f"  Fallbacks:       {s['llm_calls']['fallbacks_to_prompt_injection']}",
            "",
            "── PyWhyLLM Pairwise ──",
            f"  Total pairs:     {s['pywhyllm_pairwise']['total_pairs']}",
            f"  A (var1→var2):   {s['pywhyllm_pairwise']['edges_found_A']}",
            f"  B (var2→var1):   {s['pywhyllm_pairwise']['edges_found_B']}",
            f"  C (no relation): {s['pywhyllm_pairwise']['no_relationship_C']}",
            f"  Parse failures:  {s['pywhyllm_pairwise']['parse_failures']}",
            f"  Exceptions:      {s['pywhyllm_pairwise']['exceptions']}",
            f"  Avg latency:     {s['pywhyllm_pairwise']['avg_latency_ms']:.0f}ms",
            "",
            "── Edge Dropout Cascade ──",
            f"  PyWhyLLM proposed:           {s['edge_dropout']['pywhyllm_proposed']}",
            f"  LangExtract proposed:        {s['edge_dropout']['langextract_proposed']}",
            f"  After dedup:                 {s['edge_dropout']['total_after_dedup']}",
            f"  Submitted to verification:   {s['edge_dropout']['submitted_to_verification']}",
            f"  Grounded by verification:    {s['edge_dropout']['grounded_by_verification']}",
            f"  Rejected by verification:    {s['edge_dropout']['rejected_by_verification']}",
            f"  NodeNotFound errors:         {s['edge_dropout']['node_not_found_errors']}",
            f"  CycleDetected errors:        {s['edge_dropout']['cycle_detected_errors']}",
            f"  Other add errors:            {s['edge_dropout']['other_add_errors']}",
            f"  Final edges in graph:        {s['edge_dropout']['final_edges_in_graph']}",
            "",
            "── Verification ──",
            f"  Judge calls:             {s['verification']['judge_calls']}",
            f"  Adversarial calls:       {s['verification']['adversarial_calls']}",
            f"  Grounded:                {s['verification']['grounded']}",
            f"  Rejected:                {s['verification']['rejected']}",
            f"  No evidence:             {s['verification']['no_evidence_retrievals']}",
            f"  Exhausted iterations:    {s['verification']['exhausted_iterations']}",
            f"  Avg verdict confidence:  {s['verification']['avg_verdict_confidence']:.3f}",
            "",
            "── Var ID Resolve Misses ──",
            f"  Total: {len(self.var_id_resolve_misses)}",
        ]
        for miss in self.var_id_resolve_misses[:10]:
            lines.append(f"    {miss['raw_id']} → {miss['resolved_id']} ({miss['match_type']})")

        lines.append("=" * 72)
        return "\n".join(lines)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Module-level singleton
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

_instance: PipelineTelemetry | None = None
_instance_lock = Lock()


def get_telemetry() -> PipelineTelemetry:
    """Return the process-wide telemetry singleton."""
    global _instance
    if _instance is None:
        with _instance_lock:
            if _instance is None:
                _instance = PipelineTelemetry()
    return _instance
