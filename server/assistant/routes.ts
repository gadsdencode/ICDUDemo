import express, {type Express} from "express";
import {Pool} from "pg";
import {authorized,management,recordFeedback,type Query} from "./library";
export function mountAssistantLibrary(app:Express){
 const pool=process.env.DATABASE_URL?new Pool({connectionString:process.env.DATABASE_URL,max:2,connectionTimeoutMillis:3000,statement_timeout:15000}):null;
 pool?.on('error',()=>console.warn('assistant library database unavailable'));
 const query:Query=async(text,values)=>(await pool!.query(text,values)).rows;
 app.post('/api/assistant-management',(req,res,next)=>{
  if(!authorized(req.headers.authorization,process.env.ICDU_API_KEY))return res.sendStatus(401);
  next();
 },express.json({limit:'4mb'}),async(req,res)=>{
  res.set('Cache-Control','no-store');
  if(!pool)return res.status(503).json({error:'Database unavailable'});
  try{return res.json(await management(query,'icdu',req.body));}
  catch(error){return res.status(409).json({error:error instanceof Error&&/Document|Invalid|Unknown|HTTPS|chunks/.test(error.message)?error.message:'Library operation failed'});}
 });
 app.post('/api/assistant-feedback',express.json({limit:'12kb'}),async(req,res)=>{
  if(!pool)return res.sendStatus(503);
  try{return res.json(await recordFeedback(query,req.body));}catch{return res.status(400).json({error:'Could not save review request'});}
 });
 app.get('/api/knowledge/:id',async(req,res)=>{
  if(!pool)return res.sendStatus(503);
  try{const rows=await query("SELECT id,title,content,source_url,revision,updated_at FROM assistant_documents WHERE id=$1 AND status='published'",[req.params.id]);
   res.set('Cache-Control','no-store');return rows[0]?res.json(rows[0]):res.sendStatus(404);
  }catch{return res.sendStatus(503);}
 });
}
