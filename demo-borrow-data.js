require('dotenv').config();
const { DataSource } = require('typeorm');
const fs = require('fs');
const DAY = 86400000, TAG = '[demo-borrow-data]';
function rng(a){return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
(async()=>{
const ds=new DataSource({type:'postgres',host:process.env.DB_HOST,port:Number(process.env.DB_PORT),username:process.env.DB_USERNAME,password:process.env.DB_PASSWORD,database:process.env.DB_NAME});
await ds.initialize();
const R=rng(20261002), now=Date.now(), iso=t=>new Date(t).toISOString();
const maxB=(await ds.query('SELECT max(borrow_id) m FROM borrows'))[0].m||0;
const maxF=(await ds.query('SELECT max(fine_id) m FROM fines'))[0].m||0;
const copies=(await ds.query("SELECT copy_id FROM copies WHERE status='AVAILABLE' AND copy_id<>1 ORDER BY copy_id LIMIT 120")).map(r=>r.copy_id);
const mem=[];for(let i=4;i<=45;i++)mem.push('L'+String(i).padStart(3,'0'));
for(let i=mem.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[mem[i],mem[j]]=[mem[j],mem[i]]}
const kinds=[...Array(29).fill('A'),...Array(10).fill('O'),...Array(29).fill('R'),...Array(5).fill('L')];
for(let i=kinds.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[kinds[i],kinds[j]]=[kinds[j],kinds[i]]}
const users=['L001','L002','L002','L002','L003','L003','L003'];
const two=mem.slice(0,24),one=mem.slice(24,42);
const slots=[...two.flatMap(u=>[u,u]),...one];
for(let i=slots.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[slots[i],slots[j]]=[slots[j],slots[i]]}
const all=[...users,...slots];
for(let i=all.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[all[i],all[j]]=[all[j],all[i]]}
const oi=[];kinds.forEach((k,i)=>{if(k==='O')oi.push(i)});
all[oi[0]]=two[0];all[oi[1]]=two[0];
const ODs=[2,3,5,7,9,12,15,18,23,28],LAGs=[2,4,6,9,14];
let op=0,lp=0;const created=[];
for(let i=0;i<kinds.length;i++){
const k=kinds[i],u=all[i],c=copies[i];
const ins=await ds.query("INSERT INTO borrows (user_id,copy_id,borrowed_at,due_at,returned_at) VALUES ($1,$2,NOW(),NOW()+INTERVAL '14 days',NULL) RETURNING borrow_id",[u,c]);
const bid=ins[0].borrow_id;
await ds.query('UPDATE copies SET status=$1 WHERE copy_id=$2',['BORROWED',c]);
let b,d,r=null;
if(k==='A'){const a=1+Math.floor(R()*12);b=now-a*DAY-Math.floor(R()*20)*3600000;d=b+14*DAY}
else if(k==='O'){const od=ODs[op++];b=now-(14+od)*DAY-2*3600000;d=b+14*DAY}
else if(k==='R'){b=now-(20+Math.floor(R()*70))*DAY-Math.floor(R()*20)*3600000;d=b+14*DAY;r=b+(5+Math.floor(R()*9))*DAY}
else{const lag=LAGs[lp++];b=now-(25+Math.floor(R()*50))*DAY;d=b+14*DAY;r=d+lag*DAY+3*3600000}
await ds.query('UPDATE borrows SET borrowed_at=$1,due_at=$2 WHERE borrow_id=$3',[iso(b),iso(d),bid]);
if(r){const cond=R()<0.85?'GOOD':'FAIR';await ds.query('INSERT INTO returns (borrow_id,returned_at,condition,notes) VALUES ($1,$2,$3,$4)',[bid,iso(r),cond,TAG]);await ds.query('UPDATE borrows SET returned_at=$1 WHERE borrow_id=$2',[iso(r),bid]);await ds.query('UPDATE copies SET status=$1 WHERE copy_id=$2',['AVAILABLE',c])}
created.push({bid,k,u,c,b:iso(b),d:iso(d),r:r?iso(r):null});
}
const odOf=(due,at)=>Math.floor((new Date(at)-new Date(due))/DAY);
const nowIso=iso(now),fids=[];
for(const t of created.filter(x=>x.k==='O').slice(0,7)){const od=odOf(t.d,t.r||nowIso);const f=await ds.query("INSERT INTO fines (borrow_id,amount,overdue_days,reason,status,paid_at,paid_by) VALUES ($1,$2,$3,$4,'UNPAID',NULL,NULL) RETURNING fine_id",[t.bid,(od*2).toFixed(2),od,'Overdue return - '+od+' days '+TAG]);fids.push(f[0].fine_id)}
for(const t of created.filter(x=>x.k==='L').slice(0,3)){const od=odOf(t.d,t.r);const f=await ds.query("INSERT INTO fines (borrow_id,amount,overdue_days,reason,status,paid_at,paid_by) VALUES ($1,$2,$3,$4,'PAID',$5,'L001') RETURNING fine_id",[t.bid,(od*2).toFixed(2),od,'Overdue return - '+od+' days '+TAG,iso(new Date(t.r).getTime()+5*3600000)]);fids.push(f[0].fine_id)}
const m={tag:TAG,created_at:nowIso,prev_max_borrow_id:maxB,prev_max_fine_id:maxF,borrow_ids:created.map(x=>x.bid),fine_ids:fids,copy_ids:created.map(x=>x.c),multi_fine_user:two[0]};
fs.writeFileSync('demo-borrow-data.manifest.json',JSON.stringify(m,null,2));
console.log(JSON.stringify({borrows:created.length,fines:fids.length,multi:m.multi_fine_user}));
await ds.destroy();
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
