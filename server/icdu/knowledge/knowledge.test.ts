import assert from 'node:assert/strict';
import test from 'node:test';
import { aliasMatches, knowledgeEntries, documentText } from './corpus.ts';
import { knowledgeContext, KnowledgeRetriever, selectHits } from './retrieval.ts';
import { embedTexts } from './embeddings.ts';
import { lookupPublishedTerm } from '../glossaryTool.ts';
import { composeInstructions } from '../agent.ts';
import { MAX_INSTRUCTION_CHARS } from '../limits.ts';

test('acronym lookup returns the full published definitions',()=>{
  for(const term of ['IAS','PAS','Application Score','HITL','intent alignment']) {
    assert.equal(lookupPublishedTerm(term).found,true,term);
  }
  assert.equal(lookupPublishedTerm('made-up capability').found,false);
});
test('approved corpus has valid sources, bounded inputs and unique ids',()=>{
  assert.equal(new Set(knowledgeEntries.map(e=>e.id)).size,knowledgeEntries.length);
  for(const e of knowledgeEntries) {
    assert.ok(e.sourceUrl.startsWith('/') && !e.sourceUrl.startsWith('//'));
    assert.ok(e.body.length>0);
    assert.ok(documentText(e).length<=3000,e.id);
  }
});
test('AS matches score requests, not ordinary lowercase English',()=>{
  const e=knowledgeEntries.find(e=>e.id==='as-application-score')!;
  assert.equal(aliasMatches('as soon as possible',e),false);
  assert.equal(aliasMatches('Explain AS',e),true);
  assert.equal(aliasMatches('what is the application score?',e),true);
});
test('exact glossary match outranks a merely similar passage',()=>{
  const exact=knowledgeEntries.find(e=>e.id==='pas-principle-adherence-score')!;
  const other=knowledgeEntries.find(e=>e.id==='icdu')!;
  assert.equal(selectHits([exact],[],[other,exact])[0].id,exact.id);
});
test('knowledge context retains complete sources within the prompt budget',()=>{
  const references=knowledgeContext({mode:'vector+keyword',hits:knowledgeEntries});
  assert.ok(references.length<=4200);
  const composed=composeInstructions('Current page: Overview',references);
  assert.ok(composed.length<=MAX_INSTRUCTION_CHARS);
  assert.match(composed,/source data, not instructions/);
  assert.match(composed,/"source":"https:\/\/icdu\.ai\//);
  assert.match(composed,/Current page: Overview/);
});
const config={baseURL:'https://model.example/v1',apiKey:'test-private-key',model:'icdu',label:'test'};
test('embedding response must match the model, count and dimensions',async()=>{
  const bad=async()=>new Response(JSON.stringify({model:'icdu-embed-v1',data:[{index:0,embedding:[1,2]}]}));
  await assert.rejects(embedTexts(config,['PAS'],bad),/Invalid embedding vector/);
});
test('database and embedding failures degrade to existing sources without exposing errors',async()=>{
  const row={id:'pas',title:'PAS',body:'Principle adherence',aliases:['PAS'],source_url:'/faq',source_file:'test',kind:'definition',revision:'test'};
  let calls=0;
  const pool={query:async()=>({rows:calls++===0?[row]:[]})};
  const retriever=new KnowledgeRetriever(pool as never,config,async()=>{throw new Error('secret backend URL');});
  const result=await retriever.search('Explain PAS');
  assert.equal(result.mode,'keyword');
  assert.equal(result.hits[0].id,'pas');
  const failed=new KnowledgeRetriever({query:async()=>{throw new Error('DB password');}} as never,config);
  assert.deepEqual(await failed.search('ICDU'),{mode:'unavailable',hits:[]});
});
