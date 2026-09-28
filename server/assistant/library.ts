import { schemaStatements } from "./schema";
import { createHash, timingSafeEqual } from 'node:crypto';
export type Query = (text: string, values?: unknown[]) => Promise<Record<string, unknown>[]>;
const stringList=(value:unknown):string[]=>Array.isArray(value)?value.filter((x):x is string=>typeof x==='string'):[];
const record=(value:unknown):Record<string,unknown>=>value&&typeof value==='object'?value as Record<string,unknown>:{};
export type Site = 'icdu' | 'overture';
export type LibraryDocument = {id:string;title:string;content:string;sourceUrl:string;status:string;revision:number;replaces:string[];nativeRevision?:string};
export function authorized(value:string|null|undefined,key:string|undefined):boolean {
 if(!key)return false;
 const a=Buffer.from(value??''),b=Buffer.from(`Bearer ${key}`);
 return a.length===b.length && timingSafeEqual(a,b);
}
export const hash=(text:string)=>createHash('sha256').update(text).digest('hex');
export function chunkText(text:string,max=2000):string[]{
 const chunks:string[]=[];let rest=Array.from(text.replace(/\r\n/g,'\n').trim());
 while(rest.length){let end=Math.min(max,rest.length);if(end<rest.length){const split=rest.slice(0,end+1).lastIndexOf(' ');if(split>max/2)end=split;}chunks.push(rest.slice(0,end).join(''));rest=Array.from(rest.slice(end).join('').trimStart());}
 return chunks;
}
export function documentUrl(site:Site,id:string){return `${site==='icdu'?'https://icdu.ai':'https://overture-systems.com'}/knowledge/${encodeURIComponent(id)}`;}
export async function listDocuments(query:Query,site:Site):Promise<LibraryDocument[]>{
 const managed=await query('SELECT * FROM assistant_documents ORDER BY updated_at DESC');
 const replaced=new Set(managed.flatMap(d=>stringList(d.replaces)));
 const native=site==='icdu'
  ? await query("SELECT id,title,body AS content,source_url,status,content_hash FROM icdu_knowledge_entries WHERE status='published' ORDER BY title")
  : await query("SELECT d.document_id AS id,d.title,d.source_url,d.publication_status AS status,d.content_hash,string_agg(c.content,E'\\n\\n' ORDER BY c.chunk_id) AS content FROM overture_knowledge_documents d JOIN overture_knowledge_chunks c ON c.document_id=d.document_id WHERE d.publication_status='published' AND c.publication_status='published' GROUP BY d.document_id ORDER BY d.title");
 return [...managed.map(d=>({id:String(d.id),title:String(d.title),content:String(d.content),sourceUrl:String(d.source_url),status:String(d.status),revision:Number(d.revision),replaces:stringList(d.replaces)})),
  ...native.filter(d=>!replaced.has(String(d.id))).map(d=>({id:`base:${d.id}`,title:String(d.title),content:String(d.content??''),sourceUrl:String(d.source_url),status:'published',revision:0,replaces:[String(d.id)],nativeRevision:String(d.content_hash)}))];
}
export async function publishDocument(query:Query,site:Site,raw:unknown){
 const input=record(raw);
 if(!input||typeof input.id!=='string'||!/^[a-zA-Z0-9:_./#-]{1,180}$/.test(input.id)||typeof input.title!=='string'||!input.title.trim()||input.title.length>200||typeof input.content!=='string'||input.content.length>180000||typeof input.revision!=='number'||!Number.isInteger(input.revision)||input.revision<0||typeof input.status!=='string'||!['published','retired'].includes(input.status))throw new Error('Invalid document');
 const current=(await listDocuments(query,site)).find(d=>d.id===input.id);
 if(input.revision===0 && input.id.startsWith('base:') && (!current||input.nativeRevision!==current.nativeRevision))throw new Error('Document changed; reload it first');
 const replaces=current?.replaces??[];
 if(input.revision>0 && !current)throw new Error('Document not found');
 const chunks=input.status==='published'?chunkText(input.content):[];
 if(input.status==='published'&&(!chunks.length||chunks.length>100))throw new Error('Provide 1 to 100 chunks');
 if(!Array.isArray(input.vectors)||input.vectors.length!==chunks.length||input.vectors.some((v:unknown)=>!Array.isArray(v)||v.length!==768||!v.every((n:unknown)=>typeof n==='number'&&Number.isFinite(n))))throw new Error('Invalid embeddings');
 let sourceUrl=current?.sourceUrl??'';
 if(typeof input.sourceUrl==='string'&&input.sourceUrl.length<=2000){
  if(input.sourceUrl==='')sourceUrl='';
  else {const url=new URL(input.sourceUrl,site==='icdu'?'https://icdu.ai':'https://overture-systems.com');if(url.protocol!=='https:')throw new Error('Use an HTTPS source URL');sourceUrl=url.href;}
 }
 const vectors=input.vectors as number[][];
 const payload={id:input.id,title:input.title.trim(),content:input.content,sourceUrl,replaces,status:input.status,chunks:chunks.map((content,index)=>({index,content,embedding:vectors[index]}))};
 const rows=await query('SELECT assistant_publish_document($1::jsonb,$2) AS revision',[JSON.stringify(payload),input.revision]);
 return {ok:true,revision:rows[0].revision,url:documentUrl(site,input.id)};
}
export async function overlayData(query:Query,site:Site,text:string,vector?:number[]){
 const docs=await query('SELECT id,title,source_url,replaces,status FROM assistant_documents');
 const exclude=docs.flatMap(d=>stringList(d.replaces));
 const rows=vector
 ? await query("SELECT c.id,c.document_id,c.content,d.title,1-(c.embedding <=> $1::vector) AS score FROM assistant_document_chunks c JOIN assistant_documents d ON d.id=c.document_id WHERE d.status='published' AND c.embedding_model='icdu-embed-v1' AND 1-(c.embedding <=> $1::vector)>=0.35 ORDER BY c.embedding <=> $1::vector LIMIT 4",[JSON.stringify(vector)])
 : await query("SELECT c.id,c.document_id,c.content,d.title,ts_rank(to_tsvector('english',d.title||' '||c.content),plainto_tsquery('english',$1)) AS score FROM assistant_document_chunks c JOIN assistant_documents d ON d.id=c.document_id WHERE d.status='published' AND to_tsvector('english',d.title||' '||c.content) @@ plainto_tsquery('english',$1) ORDER BY score DESC LIMIT 4",[text]);
 return {exclude,hits:rows.map(r=>({id:String(r.id),document_id:String(r.document_id),title:String(r.title),content:String(r.content),score:Number(r.score),sourceUrl:documentUrl(site,String(r.document_id))}))};
}
export async function libraryRevision(query:Query,site:Site):Promise<string>{
 const table=site==='icdu'?'icdu_knowledge_entries':'overture_knowledge_chunks';
 const rows=await query(`SELECT (SELECT count(*)::text||':'||COALESCE(max(updated_at)::text,'') FROM ${table})||':'||(SELECT count(*)::text||':'||COALESCE(max(updated_at)::text,'') FROM assistant_documents) AS revision`);
 return String(rows[0].revision);
}
export async function cachedRetrieval<T>(query:Query,site:Site,text:string,load:()=>Promise<T>,eligible:(value:T)=>boolean):Promise<T>{
 let revision:string|undefined;const key=hash(`${site}:retrieval-v2:icdu-embed-v1:${text.trim().toLowerCase()}`);
 try{revision=await libraryRevision(query,site);const rows=await query('SELECT value FROM assistant_retrieval_cache WHERE key=$1 AND revision=$2 AND expires_at>now()',[key,revision]);if(rows[0])return rows[0].value as T;}catch{}
 const value=await load();
 if(revision&&eligible(value))try{
  if(await libraryRevision(query,site)===revision){
   await query("INSERT INTO assistant_retrieval_cache VALUES($1,$2,$3::jsonb,now()+interval '15 minutes') ON CONFLICT(key) DO UPDATE SET revision=EXCLUDED.revision,value=EXCLUDED.value,expires_at=EXCLUDED.expires_at",[key,revision,JSON.stringify(value)]);
   await query('DELETE FROM assistant_retrieval_cache WHERE expires_at<now() OR key IN (SELECT key FROM assistant_retrieval_cache ORDER BY expires_at DESC OFFSET 2000)');
  }
 }catch{}
 return value;
}
export async function recordFeedback(query:Query,raw:unknown){
 const input=record(raw);
 const question=typeof input?.question==='string'?input.question.trim().slice(0,1800):'';
 const answer=typeof input?.answer==='string'?input.answer.slice(0,6000):'';
 const reason=['not-helpful','incorrect','missing-detail','no-matching-reference'].includes(String(input?.reason))?String(input.reason):'not-helpful';
 if(question.length<4)throw new Error('Include the question');
 const sources=Array.isArray(input?.sources)?input.sources.filter((x:unknown)=>typeof x==='string').slice(0,8).map((x:string)=>x.slice(0,2000)):[];
 const fingerprint=hash(JSON.stringify([question.toLowerCase(),answer,reason]));
 await query("INSERT INTO assistant_feedback(fingerprint,question,answer,reason,sources) VALUES($1,$2,$3,$4,$5::jsonb) ON CONFLICT(fingerprint) DO UPDATE SET occurrences=assistant_feedback.occurrences+1,updated_at=now(),status='open'",[fingerprint,question,answer,reason,JSON.stringify(sources)]);
 return {ok:true};
}
export async function management(query:Query,site:Site,raw:unknown){
 const input=record(raw);
 if(input?.action==='setup'){for(const statement of schemaStatements)await query(statement);return {ok:true};}
 if(input?.action==='list')return {documents:await listDocuments(query,site)};
 if(input?.action==='publish')return publishDocument(query,site,input.document);
 if(input?.action==='feedback')return {items:await query('SELECT * FROM assistant_feedback ORDER BY updated_at DESC LIMIT 200')};
 if(input?.action==='resolve'&&/^\d+$/.test(String(input.id))){await query("UPDATE assistant_feedback SET status=$2,updated_at=now() WHERE id=$1",[String(input.id),input.resolved===false?'open':'resolved']);return {ok:true};}
 throw new Error('Unknown action');
}
