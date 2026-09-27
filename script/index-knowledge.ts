import { Pool } from "pg";
import { readFileSync } from "node:fs";
import { resolveModelConfig } from "../server/icdu/config.ts";
import { documentText, entryHash, knowledgeEntries, EMBEDDING_MODEL } from "../server/icdu/knowledge/corpus.ts";
import { embedTexts } from "../server/icdu/knowledge/embeddings.ts";

const model = resolveModelConfig();
if (!model || !process.env.DATABASE_URL) throw new Error('Database and model server configuration required');
const pool = new Pool({connectionString:process.env.DATABASE_URL,max:2,connectionTimeoutMillis:8000});
try {
  const available = await pool.query("SELECT name FROM pg_available_extensions WHERE name='vector'");
  if (!available.rowCount) throw new Error('This database does not offer pgvector');
  // Embed first, then publish all records in one transaction. A failed import never leaves a partial corpus.
  const records = [];
  for (let i=0;i<knowledgeEntries.length;i+=8) {
    const batch=knowledgeEntries.slice(i,i+8);
    const vectors=await embedTexts(model,batch.map(documentText));
    records.push(...batch.map((entry,j)=>({entry,vector:vectors[j]})));
    console.log(`Embedded ${records.length}/${knowledgeEntries.length} references`);
  }
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(172941610)");
    await client.query(readFileSync(new URL('../server/icdu/knowledge/schema.sql',import.meta.url),'utf8'));
    for (const {entry:e,vector} of records) {
      await client.query(`INSERT INTO icdu_knowledge_entries
        (id,title,body,aliases,source_url,source_file,kind,revision,status,embedding_model,embedding,content_hash)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'published',$9,$10::vector,$11)
        ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title,body=EXCLUDED.body,aliases=EXCLUDED.aliases,
        source_url=EXCLUDED.source_url,source_file=EXCLUDED.source_file,kind=EXCLUDED.kind,revision=EXCLUDED.revision,
        status='published',embedding_model=EXCLUDED.embedding_model,embedding=EXCLUDED.embedding,
        content_hash=EXCLUDED.content_hash,updated_at=now()`,
        [e.id,e.title,e.body,JSON.stringify(e.aliases),e.sourceUrl,e.sourceFile,e.kind,e.revision,
          EMBEDDING_MODEL,JSON.stringify(vector),entryHash(e)]);
    }
    await client.query("UPDATE icdu_knowledge_entries SET status='retired',updated_at=now() WHERE NOT (id=ANY($1::text[])) AND status='published'",
      [knowledgeEntries.map(e=>e.id)]);
    await client.query('COMMIT');
    console.log(`Published ${records.length} references with ${EMBEDDING_MODEL}`);
  } catch (error) {await client.query('ROLLBACK');throw error;} finally {client.release();}
} finally {await pool.end();}
