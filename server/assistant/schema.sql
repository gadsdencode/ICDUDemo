-- Additive assistant knowledge overlays, retrieval cache and review inbox.
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS assistant_documents (
 id text PRIMARY KEY, title text NOT NULL, content text NOT NULL, source_url text NOT NULL,
 replaces text[] NOT NULL DEFAULT '{}', status text NOT NULL CHECK(status IN ('published','retired')),
 revision integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS assistant_document_chunks (
 id text PRIMARY KEY, document_id text NOT NULL REFERENCES assistant_documents(id),
 content text NOT NULL, embedding vector(768) NOT NULL, embedding_model text NOT NULL
);
CREATE TABLE IF NOT EXISTS assistant_retrieval_cache (
 key text PRIMARY KEY, revision text NOT NULL, value jsonb NOT NULL, expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS assistant_feedback (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, fingerprint text UNIQUE NOT NULL,
 question text NOT NULL, answer text NOT NULL DEFAULT '', reason text NOT NULL, sources jsonb NOT NULL DEFAULT '[]',
 status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved')),
 occurrences integer NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS assistant_feedback_status ON assistant_feedback(status,updated_at DESC);
CREATE INDEX IF NOT EXISTS assistant_cache_expiration ON assistant_retrieval_cache(expires_at);
CREATE OR REPLACE FUNCTION assistant_publish_document(payload jsonb, expected_revision integer)
RETURNS integer LANGUAGE plpgsql AS $$
DECLARE current_revision integer; next_revision integer; item jsonb; doc_id text;
BEGIN
 doc_id:=payload->>'id';
 PERFORM pg_advisory_xact_lock(hashtextextended('assistant-document:'||doc_id,0));
 SELECT revision INTO current_revision FROM assistant_documents WHERE id=doc_id FOR UPDATE;
 IF COALESCE(current_revision,0) <> expected_revision THEN
  RAISE EXCEPTION 'Document changed; reload before publishing' USING ERRCODE='40001';
 END IF;
 next_revision:=COALESCE(current_revision,0)+1;
 INSERT INTO assistant_documents(id,title,content,source_url,replaces,status,revision)
 VALUES(doc_id,payload->>'title',payload->>'content',payload->>'sourceUrl',
  ARRAY(SELECT jsonb_array_elements_text(payload->'replaces')),payload->>'status',next_revision)
 ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,content=EXCLUDED.content,source_url=EXCLUDED.source_url,
  replaces=EXCLUDED.replaces,status=EXCLUDED.status,revision=next_revision,updated_at=now();
 DELETE FROM assistant_document_chunks WHERE document_id=doc_id;
 IF payload->>'status'='published' THEN
  FOR item IN SELECT value FROM jsonb_array_elements(payload->'chunks') LOOP
   INSERT INTO assistant_document_chunks VALUES(doc_id||':'||(item->>'index'),doc_id,item->>'content',
    (item->>'embedding')::vector,'icdu-embed-v1');
  END LOOP;
 END IF;
 DELETE FROM assistant_retrieval_cache;
 RETURN next_revision;
END;
$$;
