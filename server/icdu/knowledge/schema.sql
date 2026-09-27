-- Additive migration; never replaces the existing production database.
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS icdu_knowledge_entries (
  id text PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL,
  aliases jsonb NOT NULL DEFAULT '[]',
  source_url text NOT NULL,
  source_file text NOT NULL,
  kind text NOT NULL,
  revision text NOT NULL,
  status text NOT NULL CHECK (status IN ('published', 'draft', 'retired')),
  embedding_model text NOT NULL,
  embedding vector(768) NOT NULL,
  content_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS icdu_knowledge_text_idx ON icdu_knowledge_entries
  USING gin (to_tsvector('english', title || ' ' || body));
-- Exact vector search is sufficient for this small corpus; no approximate index needed.
