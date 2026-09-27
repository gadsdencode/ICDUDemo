# ICDU reference library

Ask ICDU retrieves approved reference passages from the existing PostgreSQL database before each model invocation. The existing Mac model writes the answer. Exact term/alias matches, PostgreSQL keyword search, and pgvector cosine search are combined; retrieved text includes source links and is labeled data, not instructions. Source context is bounded to 4,200 characters within the existing 8,000-character instruction budget.

## Installed content

The initial corpus contains 127 entries: 16 glossary definitions, 7 approved explanations, and 104 published-site sections. Canonical entries are in `server/icdu/knowledge/seed.json`; page sections come from `shared/siteKnowledge.ts`. The PDF and DOCX download bodies are **not** indexed. Catalog descriptions do not count as reading those documents. Scripted demo scores and default thresholds remain labeled as demonstration values, not measured production results or universal requirements.

## Storage and model

`icdu_knowledge_entries` stores text, aliases, source, revision, publication status, content hash, and a 768-dimensional pgvector embedding. Only published rows for the expected embedding model are searched. Exact vector scanning is appropriate for this small corpus; an approximate vector index is unnecessary at this size.

The Mac's authenticated gateway adds `/v1/embeddings` using `icdu-embed-v1`, a local copy of `embeddinggemma:300m`. This uses the same server-side API key and base URL as chat. It accepts at most 16 texts per request, bounds text/body size, fixes the model, limits request rate, and shares the existing model concurrency guard. No API key or database URL is sent to browsers. Keep this model's weights and dimensions unchanged for this index; a model change requires a new version and a complete reindex.

Replit production database usage is billed under the existing plan. There is no separate vector database subscription or paid embedding provider in this implementation.

## Indexing and updates

With `DATABASE_URL`, `ICDU_API_KEY`, and `ICDU_API_BASE_URL` set for the intended environment:

```sh
npm run knowledge:index
```

The command checks pgvector availability, generates vectors on the Mac, and then performs an additive migration and atomic corpus update in one transaction. It does not modify visitor sessions or quota tables. Removed corpus entries are retired, not deleted. An advisory lock serializes concurrent imports. Reindexing intentionally republishes the approved repository corpus; edit the seed/registry before running it. Do not use it to overwrite unpublished database edits.

There is no public or anonymous knowledge editing endpoint. Updates go through source review and the indexing command. A separately authenticated owner editor can be added later.

## Availability

If embeddings are unavailable, retrieval falls back to exact/keyword results. If the knowledge database is unavailable, existing glossary and site tools remain available. There is no paid-provider fallback. Queries and answers are not logged by this retrieval code. Database queries and embedding requests have timeouts; retrieved text never replaces the system instructions.

## Validation

Run `npm run test:knowledge`, `npm test`, `npm run check`, and `npm run build`. The knowledge tests cover aliases, input and source bounds, model/dimension validation, ranking, prompt budget, and unavailable services. Live retrieval and answer smoke tests are recorded separately during deployment; automated tests do not guarantee every generated answer is correct.

For rollback, revert the agent integration and glossary change and republish. The additive knowledge table can remain safely unused. The original gateway is backed up on the Mac before deployment.
