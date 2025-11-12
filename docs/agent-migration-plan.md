# Agent Migration Plan

## 1. Current OpenRouter Touchpoints
- **Enhancement merge (`/api/enhance-prompt`)**  
  - Server: `server/lib/openrouter.ts:133` (`enhancePromptWithAI`).  
  - Client triggers: selecting an enhancement card (`EnhancementGrid`), removing/replacing enhancements, and presets (`PresetSelector`) which loop through multiple enhancements.  
  - Payload: `currentPrompt`, `enhancement { title, description, category }`.  
  - Output: single enhanced prompt string injected back into the editor and history stack.
- **Category refresh (`/api/generate-suggestions`)**  
  - Server: `generateSuggestions` in `server/lib/openrouter.ts:259`.  
  - Client triggers: clicking “Refresh” in simple mode, per-category refresh from advanced mode, and potential auto-refresh hooks.  
  - Payload: `category`, `count`, optional `currentPrompt`.  
  - Output: JSON array of `{ title, description }` suggestion cards rendered in the grid.
- **Auto-generate (`/api/auto-generate-prompt`)**  
  - Server: `autoGeneratePrompt` in `server/lib/openrouter.ts:183`.  
  - Client triggers: the “Enhance Prompt” (`AutoGenerateButton`) once user text has ≥3 words.  
  - Payload: `basicPrompt` (current free-form text).  
  - Output: detailed cinematic prompt shown in editor + history.
- **Structure prompt (`/api/structure-prompt`)**  
  - Server: `structurePromptWithAI` in `server/lib/openrouter.ts:207`.  
  - Client triggers: “Structure Prompt” button in `ActionBar`.  
  - Payload: `currentPrompt`.  
  - Output: formatted prompt matching the template from `docs/prompt-guide.md`.

## 2. Candidate Agent Responsibilities & Required Inputs
### Prompt Enhancement Agent
- **Purpose**: Replace `enhancePromptWithAI` with an agent that can inspect the current prompt, applied enhancements, and history, then decide how to integrate a new cinematic element (or remove one).
- **Inputs to capture**:
  - Current prompt text and/or baseline prompt before the category was last modified (`promptBeforeCategory` already tracked on the client).
  - Enhancement metadata: id, category, title, description, preset provenance.
  - Editor context: mode (simple/advanced), word count, history index, preset in use.
  - Optional: user creative preferences, project metadata, prior agent reasoning traces.
- **Tools the agent could use**:
  - Prompt style guide lookup (link to `docs/prompt-guide.md` or embed key bullet points).
  - Diff/highlight tool to ensure only relevant sections change.
  - Validation tool to enforce word count / banned terms.
- **Considerations**: Agent may need ability to decline when insufficient base prompt exists; also handle removal flows by rolling back to stored baseline without API calls when possible.

### Suggestion Curator Agent
- **Purpose**: Replace `generateSuggestions`; dynamically tailors enhancement cards per category, optionally referencing the active prompt for context.
- **Inputs to capture**:
  - Target category id + human-readable label, desired count.
  - Current prompt (if available) plus list of already applied enhancement categories to avoid duplicates.
  - Usage analytics (which cards are selected) to steer diversity.
- **Tools**:
  - Style taxonomy service (to ensure category wording remains consistent).
  - RAG tool that surfaces real cinematography techniques from a curated knowledge base.
- **Outputs**: JSON suggestions enriched with metadata (difficulty, tags) for richer UI filtering.

### Auto-Author Agent
- **Purpose**: Replace `autoGeneratePrompt`; acts as a brainstorming agent that can ask clarifying questions or call helpers before finalizing a cinematic prompt.
- **Inputs**:
  - The user’s raw text (`basicPrompt`), detected subjects, mood, and constraints (duration, aspect ratio if available).
  - Optionally the project brief or persona to ground tone.
- **Tools**:
  - Critic helper that scores prompt coverage against the Sora guidelines.
  - Memory store so subsequent enhancements remember initial intent.
- **Outputs**: Structured object (prompt, rationale, suggested follow-up enhancements) rather than a string, so UI can display reasoning or suggested next steps.

### Prompt Structuring Agent
- **Purpose**: Replace `structurePromptWithAI`; ensures output matches template with validation.
- **Inputs**:
  - Current prompt text plus flags indicating which sections are mandatory.
  - Template definition (possibly versioned) so the agent can adapt when we change formatting.
- **Tools**:
  - Schema validator tool to confirm the response matches required sections.
  - Formatter tool that can emit Markdown vs plain text depending on downstream needs.
- **Outputs**: Structured JSON (scene, cinematography, actions, dialogue) that server can format into Markdown/plain text for the editor.

## 3. Agent-Building Data Checklist
1. **Prompt context**: raw text, history snapshots, enhancement provenance, user mode, word count.  
2. **Enhancement catalog metadata**: canonical descriptions, tags, relationships, default order.  
3. **User/session info**: persona, project title, any saved preferences (color palettes, genres).  
4. **Style guide content**: key bullets from `docs/prompt-guide.md`, banned phrases, required sections.  
5. **Telemetry hooks**: which agent outputs get accepted/edited to fine-tune prompts.  
6. **Tool endpoints**: e.g., Langflow flow URLs or OpenAI tool definitions (retrieval, formatting, validation).  
7. **Response schema definitions**: so the client knows how to render richer agent responses (JSON vs plain text).

## 4. Proposed Directory Restructure
- `server/agents/`
  - `promptEnhancerAgent.ts`, `suggestionAgent.ts`, `autoAuthorAgent.ts`, `structuringAgent.ts`.
  - Each exports an interface (`run(input: AgentInput): Promise<AgentOutput>`) plus tool registration.
- `server/services/llm/`
  - `client.ts`: shared OpenRouter/OpenAI API wrapper, replaces `server/lib/openrouter.ts`.
  - `langflowClient.ts`: handles flow execution, auth, retries.
  - `tools/`: reusable helpers (style guide fetcher, schema validators, telemetry).
- `server/routes/`
  - Keep HTTP handlers but thin controllers that call agents; consider splitting per concern (`promptRoutes.ts`, `suggestionRoutes.ts`).
- `shared/agents/`
  - Type definitions for agent inputs/outputs so client can narrow types (e.g., structured prompt schema).
- `docs/flows/`
  - Langflow diagrams, agent prompt specs, tool descriptions for collaboration.

Client-side updates can stay in `client/src/pages/Home.tsx` initially, but once agents return richer payloads we may add dedicated hooks under `client/src/hooks/agents/` to deserialize responses.

## 5. Next Steps (in progress)
1. [x] **Select orchestration stack:** We’re standardizing on LangChain/Langflow. Capture creds via `LANGFLOW_API_KEY`, `LANGFLOW_BASE_URL`, and per-flow ids such as `LANGFLOW_SUGGESTION_FLOW_ID`.
2. [x] **Define shared response schemas:** Added `shared/agents/schemas.ts` so every agent (enhancer, suggestion curator, auto-author, structurer) has typed inputs/outputs that both the API and client can depend on.
3. [x] **Extract prompt specs:** Core system prompts now live under `server/agents/prompts/` with version tags, making it easy to reuse or upgrade prompts independently of transport.
4. [~] **Shared LLM client + pilot agent:** Introduced `server/services/llm/langflowClient.ts` and a fallback-aware `server/agents/suggestionAgent.ts` (wired into `/api/generate-suggestions`). Next up: add Langflow flows for the other agents, plus provider selection logic for OpenRouter vs Langflow per task.
5. [ ] **Telemetry + acceptance tracking:** Need a lightweight telemetry module (latency, provider, fallback reason, user acceptance) before expanding traffic; hooks are partially in place via logging inside `SuggestionAgent` but still require structured reporting/export.

## 6. Implementation Task Board
### Foundations
- [x] Configure Langflow decision and document required env vars (`LANGFLOW_BASE_URL`, `LANGFLOW_API_KEY`, `LANGFLOW_SUGGESTION_FLOW_ID`).  
- [x] Create shared agent schema module (`shared/agents/`) exporting typed inputs/outputs for all agents.  
- [x] Extract existing OpenRouter system prompts into versioned specs under `server/agents/prompts/`.  
- [x] Build `LangflowClient` wrapper with JSON helper and wire it to env-driven configuration.  
- [~] Introduce central telemetry/logger util recording provider, latency, fallback reasons, and acceptance metrics (logs exist, needs structured sink + helper).  
- [ ] Add feature flags/config toggles so each agent can target Langflow vs OpenRouter independently (e.g., `SUGGESTION_AGENT_PROVIDER=openrouter|langflow`).  
- [ ] Document Langflow deployment requirements (`docs/flows/`) including flow IDs, input schema, and troubleshooting guide.

### Suggestion Agent (pilot)
- [x] Implement `server/agents/suggestionAgent.ts` using Langflow first with OpenRouter fallback.  
- [x] Update `/api/generate-suggestions` route to call the agent instead of `lib/openrouter`.  
- [x] Ensure `.env` includes Langflow-specific keys for suggestions.  
- [~] Define Langflow flow schema for suggestions (input/output spec) and check it into `docs/flows/suggestion.json` (placeholder).  
- [ ] Expose provider + latency metadata in API response so the client can experiment with UI hints/tooltips.  
- [ ] Add automated tests/mocks to validate fallback logic (simulate Langflow error, ensure OpenRouter path works).  
- [ ] Gather UX feedback: capture whether refreshed suggestions were applied to inform agent tuning.

### Prompt Enhancement Agent
- [x] Capture enhancement workflow requirements in plan.  
- [ ] Create `server/agents/promptEnhancerAgent.ts` mirroring suggestion agent scaffolding.  
- [ ] Define Langflow flow for enhancement merges (requires context: current prompt, baseline, enhancement metadata, history pointer).  
- [ ] Update `/api/enhance-prompt` to call the agent and return richer payload (prompt + rationale/diff).  
- [ ] Update client `Home.tsx` to accept structured enhancements (e.g., show rationale tooltip, optionally display diff).  
- [ ] Add regression tests ensuring enhancer agent preserves history/undo behavior.

### Auto-Author Agent
- [x] Documented feature goals + schema.  
- [ ] Implement `server/agents/autoAuthorAgent.ts` with Langflow fallback to OpenRouter.  
- [ ] Extend `AutoGeneratePromptResponse` to optionally include suggested enhancements for immediate chips in the UI.  
- [ ] Update `AutoGenerateButton` flow to handle structured payload (prompt + metadata).  
- [ ] Provide Langflow flow definition / instructions for capturing persona + constraints.  
- [ ] Add telemetry storing whether the auto-generated prompt was edited within N seconds (quality signal).

### Prompt Structuring Agent
- [x] System prompt now imported from `server/agents/prompts`.  
- [ ] Create `server/agents/promptStructuringAgent.ts` using Langflow flows that emit structured sections.  
- [ ] Update `/api/structure-prompt` response schema to include structured JSON plus formatted string.  
- [ ] Teach `ActionBar`/editor to display structured sections (possibly collapsed view) before flattening to text.  
- [ ] Validate outputs against `promptStructuringAgentOutputSchema` and fallback to OpenRouter if invalid.  
- [ ] Document template versioning strategy so Langflow flow stays aligned with `docs/prompt-guide.md`.

### Client/UX Work
- [x] `Home.tsx` already tracks prompt history, category baselines, and would benefit from improved agent outputs (noted in requirements).  
- [~] Plan client adapters (`client/src/hooks/agents/`) to normalize agent responses (prompt text, rationale, metadata).  
- [ ] Surface provider badges (Langflow vs OpenRouter) and latency indicators to help QA agent quality.  
- [ ] Create a developer-only diagnostics panel showing raw agent payloads for debugging.  
- [ ] Update preset workflow to batch agent calls efficiently (potential multi-call orchestration).  
- [ ] Add error toasts specific to agent failures with actionable copy (“Langflow flow unavailable, please retry.”).

### Telemetry & QA
- [~] Define telemetry payload (`provider`, `latencyMs`, `fallbackUsed`, `userAction`) and expose helper functions for agents/routes.  
- [ ] Wire telemetry to persistent storage or logging service (e.g., PostHog, console JSON).  
- [ ] Add health-check endpoints for Langflow connectivity (ping default flow).  
- [ ] Build integration tests covering both Langflow success and fallback scenarios per endpoint.  
- [ ] Establish rollback checklist documenting how to switch endpoints back to OpenRouter-only if Langflow degrades.
