"use client";
import {useState} from 'react';
export function FeedbackReview({question,answer}:{question:string;answer:string}){
 const [open,setOpen]=useState(false),[reason,setReason]=useState('missing-detail'),[state,setState]=useState('');
 if(!question||!answer)return null;
 async function send(){setState('Sending…');try{const response=await fetch('/api/assistant-feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:question.slice(0,1800),answer:answer.slice(0,6000),reason})});if(!response.ok)throw Error();setState('Sent for review. Thank you.');setOpen(false)}catch{setState('Could not send. Please try again.')}}
 return <div className="mt-2 text-xs"><button type="button" className="underline" onClick={()=>setOpen(!open)}>Suggest an improvement</button>{open?<div className="mt-2 rounded border p-3"><p>Send this question and answer to the team for review.</p><label>What needs attention? <select aria-label="Review reason" value={reason} onChange={e=>setReason(e.target.value)} className="bg-background text-foreground"><option value="missing-detail">Missing detail</option><option value="incorrect">A fact looks incorrect</option><option value="not-helpful">Not helpful</option></select></label><div className="mt-2 flex gap-3"><button type="button" disabled={state==='Sending…'} onClick={send} className="underline">Send for review</button><button type="button" onClick={()=>setOpen(false)}>Cancel</button></div></div>:null}<span role="status" className="block">{state}</span></div>;
}
