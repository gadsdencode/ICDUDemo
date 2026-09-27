# ICDU website assistant

The public assistant answers from published site copy, reports the page the visitor is on, and can operate a small set of existing controls. It uses the same local ICDU model configuration as the rest of the site (`ICDU_API_BASE_URL`, `ICDU_API_KEY`, `ICDU_MODEL` on the server). The browser talks only to `/api/copilotkit`. There is no paid fallback and `/v1` is not exposed to the client.

Conversation state is held by an in-memory agent runner on one server process (`conversationDurability = "in-memory-per-process"`). A new Autoscale instance does not keep the thread. Hiding the chat popup does not clear it, because the provider stays mounted. `/fine-tune` unmounts the chat, page context, and visitor tools so private fine-tuning data is not ingested.

## Features by page

| Page | What the assistant can use |
| --- | --- |
| All public pages except `/fine-tune` | Current-page snapshot, `navigate_site`, `set_visitor_audience`, glossary lookup, site search, section read, resource recommendations. Suggestions change with the route and do not call the model. |
| `/` | Overview copy and the workflow chooser (`#funnel`). |
| `/journey` and `/journey/:persona` | Role list and the selected role tab. A journey section id such as `developer-situation` opens that role and tab. |
| `/demos` | Guided or lab mode. Guided: select a published scenario and continue, go back, or revisit a stage already reached. Run and evaluate follow the same gates as the buttons. Lab: select `icdu`, `judge`, `hitl`, or `stress`. Scores are included only after evaluate, and they are marked simulated. |
| `/business-case` | Explain the current calculator inputs and modeled results. Apply a requested input change inside the published ranges. Reset waits for the visitor to confirm. |
| `/faq` | Filter a category and expand a question by stable id (`commercial-use` is the licensing question). |
| `/resources` | Recommend catalog entries. The card is a link the visitor clicks. Downloads are not started automatically. |
| `/research`, `/licensing`, `/developers`, `/investor` | Section text from the registry, with anchors the visitor can open. |

`/ask` redirects home and is not a knowledge page. Unknown page, persona, scenario, section, FAQ, and lab ids return an error and do not navigate.

## Tools and validation

Server tools always win a name collision. Browser tools are accepted only when the name is in this list and the parameter schema matches the published contract. Duplicates, extra properties, widened types, and `additionalProperties: true` are rejected. At most seven frontend tools are forwarded. The largest page surface currently registers six.

Server tools:

- `lookup_icdu_term` — one glossary term.
- `search_site_content` — up to four excerpts with title and internal link, or an explicit miss.
- `get_site_section` — one registry section, or `found: false`.
- `recommend_site_resources` — catalog title, purpose, and link. `fileBodyRead` is always false.

Frontend tools:

- `navigate_site` — `pageId` from the registry. Optional `sectionId`, `personaId`, `industryId`, and `demoMode` (`guided` or `lab`, demos only). The result includes the path that was actually opened and whether the section element mounted.
- `set_visitor_audience` — persona and industry ids from the data modules.
- `set_demo_mode` — `/demos` only.
- `select_guided_scenario` — published scenario id. A different scenario while guided work exists asks the visitor to confirm before progress is cleared.
- `set_guided_stage` — `continue`, `back`, or `revisit` of a stage at or before the furthest reached step. It does not invent completion, evidence, or scores.
- `select_lab_tab` — `icdu`, `judge`, `hitl`, `stress`.
- `open_faq` — stable question id and optional category. Filtering cannot hide the question, because the category is switched to the question's category.
- `set_roi_inputs` — whole numbers inside `roiCalculatorRanges`, then `calculateRoi`. The summary keeps the modeled-estimate wording.
- `confirm_reset_roi` and `confirm_discard_guided_progress` — human approval. The calculator reset or progress clear runs in the confirm button, not from a model argument.

An industry change or scenario change that would drop guided progress returns `needsConfirmation` and waits for `confirm_discard_guided_progress`. Cancel leaves the current values in place. Manual buttons stay direct.

## Context sources and budgets

The only browser context the model receives is the entry named `Current page`. Its value is parsed as JSON, extra fields are dropped, long text is shortened, and the result is re-serialized. Invalid JSON is dropped. The block is labeled untrusted. Trusted instructions are not sliced to make room; if the combined text would pass 8,000 characters, the untrusted block is omitted.

The snapshot includes route, title, summary, section ids, persona, industry, demo mode, guided stage, lab tab, FAQ selection, calculator inputs, and the tools available on that page. Page-specific slots are attached only while that page is current, so a lab tab or calculator result does not remain after navigation. The snapshot is not taken from `document.body`, storage, or the chat transcript.

| Limit | Value |
| --- | --- |
| Current-page context | 1,500 characters, valid JSON |
| Combined instructions | 8,000 characters |
| History | last 40 messages, repaired so tool calls keep their results |
| User or assistant text | 4,000 characters |
| Tool result text | 1,500 characters |
| Frontend tools | 7 |
| Model steps in one invocation | 3 |
| Frontend-tool continuations after one visitor message | 2 |
| Visitor messages | 10 per hour per session |
| Runs | 30 per session, 80 per IP, as an abuse backstop |
| Concurrent turns | 1 per session |

A frontend-tool continuation is a run, not another visitor message. A third continuation in the same turn is rejected before it consumes a run. Stopping a run or leaving the page releases the active-turn lock. `agent/suggest` stays closed; suggestions are static.

## Adding a page

1. Add the route, title, summary, and sections to `shared/siteKnowledge.ts`, using text that already exists in a data module or page. Set `anchor: false` when the section is searchable but has no element id.
2. Put `data-assistant-page="<page id>"` on the page root and matching `id` attributes on the sections.
3. If the page has a control, register it with `useAssistantHandlers` and publish only the visible state with `useAssistantSlot`.
4. Add the tool name and Zod schema to `shared/assistantContract.ts`, and include it from `frontendToolsForSurface` only on that page. Keep the simultaneous set at or below seven.
5. Add a drift anchor when the source sentence lives in JSX, and extend the route or tool tests.

## Test evidence

`npm run check`, `npm test`, and `npm run build` completed successfully on this implementation.

Covered in automated tests:

- Registry routes include the public pages and exclude `/ask` and `/fine-tune`.
- Search and resource recommendations return links and do not claim a file body was read.
- JSX drift anchors still match the page source.
- Navigation rejects unknown pages, roles, workflows, and non-anchor sections, and preserves persona and industry query state.
- Guided continue follows the run and evaluate gates. Scenario changes discard stored work only when progress exists and the scenario id differs.
- ROI edits reject values outside the published step and range.
- Frontend schemas match the Zod tools. Unknown names, server-name collisions, duplicates, and widened schemas are rejected. Every current page surface stays within seven tools.
- History keeps tool-call pairs and clips tool results. Oversized current-page JSON is shrunk into valid JSON. Untrusted context cannot replace the trusted instructions.
- A mocked frontend tool call returns to the client, the tool-result request produces the next model sentence, the hourly message count drops by one, and a third continuation is rejected.
- Session ownership, hourly quota, busy turns, and cancellation still hold.

A live-model browser smoke test was not run. This environment has no `ICDU_API_KEY`, and the process already serving the site reported that the session secret is not configured, so `/api/chat/status` returns unavailable. In the browser, Research and Developers showed different published copy and different static suggestions, Back restored Research with the chat still open, the licensing FAQ opened after a category filter, the value-model slider updated the modeled sentence and Reset restored it, the HITL tab selected the rubric, and `/fine-tune` showed no assistant control. Those checks did not execute model tool calls.
