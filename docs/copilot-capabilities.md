# ICDU website assistant

The public assistant answers from published site copy, reports the page the visitor is on, and can operate a small set of existing controls. It uses the same local ICDU model configuration as the rest of the site (`ICDU_API_BASE_URL`, `ICDU_API_KEY`, `ICDU_MODEL` on the server). The browser talks only to `/api/copilotkit`. There is no paid fallback and `/v1` is not exposed to the client.

Conversation state is held by an in-memory agent runner on one server process (`conversationDurability = "in-memory-per-process"`). A new Autoscale instance does not keep the thread. The chat is one inline `CopilotChat` mounted for the whole public app, not a popup and not a separate instance per page. Route changes, Back, and Forward keep the same provider and thread. `/fine-tune` unmounts the chat, page context, and visitor tools so private fine-tuning data is not ingested.

On `/` the introduction, composer, and role chooser are one section. The chooser is open on arrival at `#chooser` and `#funnel`. Its visible role paths are Executive, Administrator, Developer, and Manager, in that order. Choosing a path updates the shared audience selection and opens workflow choices in the conversation. It does not send a chat message or leave `/`. The same conversation can then open a guided walkthrough, its simulated results, the value model, FAQ answers, resource cards, and the developer path, including the public Advanced Lab. Those views use the same guided progress, calculator, and audience state as the legacy pages. After a message, the transcript, the active workspace, and the composer stay in that homepage section and the same role paths remain outside the transcript. “New conversation” stops the active turn, clears the transcript and workspace artifact history, and starts a fresh client thread. It does not clear the selected role, workflow, guided progress, calculator values, or the server quota. Conversation history is in memory for this page session and is not durable across reloads.

On other public pages the routed page and the conversation share the screen. Wide layouts keep a content column and an inline conversation around 360–420px, labeled with the page being viewed. Narrow layouts use a Page / Conversation switch. Both stay mounted. A tool that opens another route shows that page; if a confirmation is still pending, the page view says so and can return to it. Approved source links in assistant messages use client-side navigation unless the click asks for a new tab, an external site, or a download.

## Features by page

| Page | What the assistant can use |
| --- | --- |
| All public pages except `/fine-tune` | Current-page snapshot, `navigate_site`, `set_visitor_audience`, glossary lookup, site search, section read, resource recommendations. Suggestions change with the route and do not call the model. |
| `/` | Homepage introduction, composer, and the open role chooser (`#chooser` / `#funnel`): Executive, Administrator, Developer, and Manager. `show_workspace` opens roles, workflows, the guided walkthrough, results, the value model, a contract draft, example evidence, readiness exploration, human review, scenario comparison, a pilot draft, a takeaway brief, FAQ, resources, or the developer lab without changing the pathname. `read_workspace` returns one bounded section. `propose_workspace_edit` stores a contract or pilot suggestion until the visitor applies it. |
| `/journey` and `/journey/:persona` | Role list and the selected role tab. A journey section id such as `developer-situation` opens that role and tab. |
| `/demos` | Guided or lab mode. Guided: select a published scenario and continue, go back, or revisit a stage already reached. Run and evaluate follow the same gates as the buttons. Lab: select `icdu`, `judge`, `hitl`, or `stress`. Scores are included only after evaluate, and they are marked simulated. |
| `/business-case` | Explain the current calculator inputs and modeled results. Apply a requested input change inside the published ranges. Reset waits for the visitor to confirm. |
| `/faq` | Filter a category and expand a question by stable id (`commercial-use` is the licensing question). |
| `/resources` | Recommend catalog entries. The card is a link the visitor clicks. Downloads are not started automatically. |
| `/research`, `/licensing`, `/developers`, `/investor` | Section text from the registry, with anchors the visitor can open. |

`/ask` redirects home and is not a knowledge page. Unknown page, persona, scenario, section, FAQ, and lab ids return an error and do not navigate.

## Tools and validation

Server tools always win a name collision. Browser tools are accepted only when the name is in this list and the parameter schema matches the published contract. Duplicates, extra properties, widened types, and `additionalProperties: true` are rejected. At most seven frontend tools are forwarded. `navigate_site`, `set_visitor_audience`, and `show_workspace` are always available on public pages. `read_workspace` is added while a workspace view or the demos or business-case page is open. `propose_workspace_edit` is added on the contract and pilot views. Guided, value-model, FAQ, and lab tools are added only while that view or its legacy page is active, and the function stops at seven.

Server tools:

- `lookup_icdu_term` — one glossary term.
- `search_site_content` — up to four excerpts with title and internal link, or an explicit miss.
- `get_site_section` — one registry section, or `found: false`.
- `recommend_site_resources` — catalog title, purpose, and link. `fileBodyRead` is always false.

Frontend tools:

- `show_workspace` — one view: `roles`, `workflows`, `guided`, `results`, `value`, `faq`, `resources`, `developer`, `lab`, `contract`, `evidence`, `readiness`, `review`, `compare`, `pilot`, or `brief`. Optional published persona, scenario, stage, FAQ, resource, lab tab, developer section, and a focus target (`focusKind`, `focusId`). Opening or focusing does not mutate the result.
- `read_workspace` — one section: `active`, `evidence`, `scores`, `contract`, `roi`, `review`, or `pilot`.
- `propose_workspace_edit` — one bounded contract or pilot text change. The visitor applies or cancels it.
- `navigate_site` — `pageId` from the registry. Optional `sectionId`, `personaId`, `industryId`, and `demoMode` (`guided` or `lab`, demos only). Used when the visitor asks to open a separate page. The result includes the path that was actually opened and whether the section element mounted.
- `set_visitor_audience` — persona and industry ids from the data modules.
- `set_demo_mode` — `/demos` only.
- `select_guided_scenario` — published scenario id. A different scenario while guided work exists asks the visitor to confirm before progress is cleared.
- `set_guided_stage` — `continue`, `back`, or `revisit` of a stage at or before the furthest reached step. It does not invent completion, evidence, or scores.
- `select_lab_tab` — `icdu`, `judge`, `hitl`, `stress`.
- `open_faq` — stable question id and optional category. Filtering cannot hide the question, because the category is switched to the question's category.
- `set_roi_inputs` — whole numbers inside `roiCalculatorRanges`, then `calculateRoi`. The summary keeps the modeled-estimate wording.
- `confirm_reset_roi` and `confirm_discard_guided_progress` — human approval. The calculator reset or progress clear runs in the confirm button, not from a model argument.

An industry change, scenario change, or page navigation that would drop guided progress returns `needsConfirmation` and waits for `confirm_discard_guided_progress`. Resetting the calculator waits for `confirm_reset_roi`. Applying an earlier calculator snapshot waits for the same confirmation path. Cancel leaves the current values in place. The confirmation is bound to that operation and the workspace state version; a newer edit makes the old card stale.

## Context sources and budgets

The only browser context the model receives is the entry named `Current page`. Its value is parsed as JSON, extra fields are dropped, long text is shortened, and the result is re-serialized. Invalid JSON is dropped. The block is labeled untrusted. Trusted instructions are not sliced to make room; if the combined text would pass 8,000 characters, the untrusted block is omitted.

The snapshot includes the real route, title, summary, section ids, persona, industry, the tools available for the active view, `workspace.view`, `workspace.artifactId`, and an `active` block for the open feature. When an evaluated example is on screen, `active.scores` carries the displayed IAS, PAS, and AS values, the decision, and the exact names Intent-Alignment Score, Principle-Adherence Score, and Application Score. If those details cannot fit, `active.detail` is `read_workspace` and `active.missing` says what was shortened. The snapshot is not taken from `document.body`, the artifact list, or the chat transcript. A visitor draft does not inherit scripted scores.

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
| Visitor messages | 25 per hour per session (`USER_MESSAGES_PER_HOUR`) |
| Runs | 30 per session, 80 per IP, as an abuse backstop |
| Concurrent turns | 1 per session |

A frontend-tool continuation is a run, not another visitor message. A third continuation in the same turn is rejected before it consumes a run. Stopping a run or leaving the page releases the active-turn lock. `agent/suggest` stays closed; suggestions are static.

## Adding a page

1. Add the route, title, summary, and sections to `shared/siteKnowledge.ts`, using text that already exists in a data module or page. Set `anchor: false` when the section is searchable but has no element id.
2. Put `data-assistant-page="<page id>"` on the page root and matching `id` attributes on the sections.
3. If the page has a control, add the action to the shared workspace controller and render that state from both the page and the conversation stage. Register each frontend tool once from `AssistantSurface`.
4. Add the tool name and Zod schema to `shared/assistantContract.ts`, and include it from `frontendToolsForSurface` only while that capability is active. Keep the simultaneous set at or below seven.
5. Add a drift anchor when the source sentence lives in JSX, and extend the route or tool tests.

## Test evidence

`npm run check`, `npm test`, and `npm run build` are the verification commands for this presentation. A live model call is not required for the layout, starter-prompt, or quota-disabled checks.

Covered in automated tests:

- Registry routes include the public pages and exclude `/ask` and `/fine-tune`.
- Search and resource recommendations return links and do not claim a file body was read.
- JSX drift anchors still match the page source.
- Navigation rejects unknown pages, roles, workflows, and non-anchor sections, and preserves persona and industry query state.
- Guided continue follows the run and evaluate gates. Scenario changes discard stored work only when progress exists and the scenario id differs.
- ROI edits reject values outside the published step and range.
- Frontend schemas match the Zod tools, including `show_workspace`. Unknown names, server-name collisions, duplicates, and widened schemas are rejected. Overview workspace surfaces stay within seven tools.
- Guided gates, cancelled scenario changes, navigate confirmation, ROI bounds, stale reset confirmation, and artifact reopen snapshots are covered in `workspaceActions.test.ts`.
- A mocked `show_workspace` call returns through the gateway, the tool result continues the same turn, and the active workspace snapshot is present in the model request. The visitor message count drops by one.
- History keeps tool-call pairs and clips tool results. Oversized current-page JSON is shrunk into valid JSON. Untrusted context cannot replace the trusted instructions.
- A mocked frontend tool call returns to the client, the tool-result request produces the next model sentence, the hourly message count drops by one, and a third continuation is rejected.
- Session ownership, hourly quota, busy turns, and cancellation still hold.

With the documented local server configuration, `/api/chat/status` reported the assistant enabled. One live homepage request asked for an explanation of the visible lab and the licensing FAQ. The reply stayed on `/`, opened the FAQ view on `commercial-use`, and the hourly remaining count dropped by one. The model paraphrased the score names instead of repeating the on-screen definitions word for word, and it said it could not see a specific result list. Stop-during-stream, quota exhaustion, and reduced-motion animation were not exercised against the live model.

Browser checks confirmed the four homepage role paths, an Executive choice that opens workflows without a model run, the healthcare walkthrough from Define through Evidence on `/`, before/after text, the scripted PROMOTE record, calculator changes with the chart updating, a cancelled scenario change, the Advanced Lab judge tab, shared evidence on `/demos`, New conversation clearing the transcript while keeping the calculator and quota, and no assistant on `/fine-tune`.
