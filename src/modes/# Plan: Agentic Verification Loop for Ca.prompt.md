# Plan: Agentic Verification Loop for Causal Edge Grounding

Replace the current naive evidence-mapping (keyword substring + token-overlap heuristics in `_ground_edge_in_evidence` and `_validate_citation`) with a multi-turn agentic loop where each drafted edge is autonomously **retrieved against, judged, optionally re-queried, and either grounded or pruned** — using the existing orchestrator tool-loop pattern rather than a bespoke single-pass pipeline.

## Steps

### 1. Harden `LLMClient` with proactive rate-limiting and native schema enforcement

The current `src/agent/llm_client.py` has three gaps that will cause cascading failures under concurrent judge calls:

- **No jitter on backoff** — `_get_retry_delay` returns flat `2^attempt` or a flat `30s` for 429s. Under concurrency, all retrying threads will slam the API at the same instant (thundering herd). Add jitter: `delay * (0.5 + random.random())`.
- **`tenacity` installed but unused** — replace the manual `for attempt in range(self.max_retries)` loops in both `generate` and `generate_structured` with `@retry(wait=wait_exponential_jitter(...), stop=stop_after_attempt(...), retry=retry_if_exception_type(...))`. This is cleaner and already a listed dependency in `pyproject.toml`.
- **Structured output is prompt-injection + regex** — `generate_structured` injects the JSON schema into the prompt text and then regex-parses the response. The design doc in `lowlevel-systemdoc.md` already specifies using `response_mime_type: "application/json"` and `response_schema`, but it's not implemented. Add a new `generate_structured_native` method that passes `response_mime_type="application/json"` and `response_schema` (converted via the existing `_json_schema_to_gemini` helper) directly to the Gemini `GenerateContentConfig`. Keep the old method as fallback. The verification judge **must** use the native path — a parsing error mid-loop is unrecoverable.

Add an `asyncio.Semaphore` to `LLMClient.__init__` (configurable, default 8) that wraps every `asyncio.to_thread(client.models.generate_content, ...)` call. This provides proactive concurrency capping rather than the current "fire-and-hope" approach.

### 2. Decouple extraction from citation in `ExtractionService`

Strip `grounded_evidence_keys` population from `src/extraction/extractor.py`'s `_extract_with_langextract` and `_validate_citation`. The initial LLM call should return only `ExtractedEdge` with `from_var`, `to_var`, `mechanism`, `strength`, and `chain_of_thought` — no evidence mapping. Add an `edge_status` field (literal `"draft" | "grounded" | "rejected"`) to `EdgeMetadata` in `src/models/causal.py`.

### 3. Create `src/verification/` module with three components

- **`grounding_retriever.py`** — wraps `RetrievalRouter.hypothesis_aware_retrieval` (already in `src/retrieval/router.py`) to build targeted support + refutation queries from an edge's `mechanism_description`. Returns top-K chunks per side. Falls back to `HaystackService.evidence_triangulation` (already in `src/haystack_svc/service.py`) if PageIndex is unavailable.

- **`judge.py`** — calls `LLMClient.generate_structured_native` (the new native-schema method from Step 1) with a Pydantic `VerificationVerdict` schema:
  ```
  is_grounded: bool
  support_type: "direct_causal" | "correlation_only" | "irrelevant"
  supporting_quote: str | None
  rejection_reason: str | None
  confidence: float
  suggested_refinement_query: str | None
  ```
  The `suggested_refinement_query` field is what makes this truly agentic — the judge can request a better search if the initial retrieval was off-target.

- **`loop.py` (the `VerificationAgent`)** — orchestrates the multi-turn loop per edge with a `LoopState` tracker:
  ```
  attempted_queries: set[str]   # dedup set for loop-breaking
  iteration: int
  max_iterations: int           # from config, default 3
  verdicts: list[VerificationVerdict]
  ```
  Flow: retrieve → judge → if judge returns `suggested_refinement_query`:
    - **Hash-check** the query against `attempted_queries`. If already seen → force `is_grounded: false` with `rejection_reason: "exhausted_refinements"` and break immediately.
    - Otherwise, add to set, re-retrieve, re-judge.

  Emits `Span` traces via `src/training/spans.py` for every iteration including the `attempted_queries` set in span attributes for debuggability.

### 4. Wire the loop into Mode 1 with concurrent execution

In `src/modes/mode1.py`, replace the existing `_triangulate_evidence` block (~L630) with `VerificationAgent.verify_all_edges(drafted_edges, evidence_cache)`. This method:

- Uses `asyncio.gather` with the `LLMClient`-level semaphore (from Step 1) controlling actual API concurrency. No separate `ThreadPoolExecutor` needed — the semaphore inside `LLMClient` is the single chokepoint, which means both the bridge and the verifier share the same rate budget.
- Edges returning `is_grounded: false` after all iterations are **soft-pruned**: kept in the model with `edge_status: "rejected"` and full rejection metadata, but excluded from `DAGEngine.add_edge`. Users can inspect why an edge was removed.
- Edges returning `true` get their `EvidenceBundle` built from the judge's `supporting_quote` with full `RetrievalTrace` provenance.

### 5. Add an adversarial "devil's advocate" pass for high-stakes edges

After the initial grounding pass, edges marked `evidence_strength: strong` get a second judge call with an inverted prompt: *"Assume this relationship is spurious. What alternative explanations could account for this evidence?"* Response schema adds `alternative_explanations: list[str]` and `still_grounded: bool`. Populate `EdgeMetadata.assumptions` and `EdgeMetadata.conditions` from the alternatives. This pass also runs through the same semaphore-guarded `LLMClient`.

### 6. Register `verify_edge` as an orchestrator tool for Mode 2 (interactive) use

Use `Orchestrator.register_tool` (`src/agent/orchestrator.py`) to expose a `verify_edge` tool so the conversational agent can trigger on-demand re-verification when a user questions a specific ed ge.

### 7. Add `VerificationConfig` to `src/config.py` and expose audit trail

New config dataclass centralizing all the currently-hardcoded values:

| Setting | Default | Purpose |
|---|---|---|
| `max_judge_iterations` | 3 | Loop cap per edge |
| `grounding_confidence_threshold` | 0.6 | Minimum judge confidence to accept |
| `enable_adversarial_pass` | True | Toggle devil's advocate |
| `judge_model` | `gemini-2.5-pro` | Stronger model for reasoning |
| `llm_semaphore_limit` | 8 | Max concurrent Gemini API calls |
| `max_retries` | 5 | Tenacity stop condition |
| `backoff_base` | 2 | Tenacity exponential base |
| `backoff_jitter_max` | 5 | Tenacity jitter ceiling (seconds) |

Log every `VerificationVerdict` to `AuditEntry` in `src/models/audit.py` — including rejected edges with their full loop trace.

## Further Considerations

1. **Shared semaphore vs. per-component semaphore?** The plan uses a single `LLMClient`-level semaphore shared by all callers (bridge, verifier, orchestrator). This is simpler but means the bridge and verifier compete for the same budget. Alternative: per-caller semaphores with a global token bucket. Recommend starting with the shared semaphore and splitting only if profiling shows starvation.

2. **Query dedup: exact match vs. fuzzy?** The `attempted_queries` set uses exact string matching. An LLM could rephrase the same useless query slightly ("effect of X on Y" → "impact of X on Y"). Consider normalizing queries (lowercase + stopword removal) or using embedding cosine similarity with a 0.9 threshold. Recommend starting with normalized exact match and upgrading if loops are observed in practice.

3. **`gemini-2.5-pro` for the judge vs. `flash` for extraction?** The judge needs stronger reasoning; recommend `pro` for judging and adversarial passes, `flash` for the initial extraction — configurable via `VerificationConfig.judge_model`.
