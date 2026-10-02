require('dotenv').config();
const { DataSource } = require('typeorm');
const m = require('./demo-borrow-data.manifest.json');
(async()=>{
const ds=new DataSource({type:'postgres',host:process.env.DB_HOST,port:Number(process.env.DB_PORT),username:process.env.DB_USERNAME,password:process.env.DB_PASSWORD,database:process.env.DB_NAME});
await ds.initialize();
const ids=a=>a.length?a.join(','):'NULL';
await ds.query('DELETE FROM fines WHERE fine_id IN ('+ids(m.fine_ids)+')');
await ds.query('DELETE FROM returns WHERE borrow_id IN ('+ids(m.borrow_ids)+')');
await ds.query('DELETE FROM borrows WHERE borrow_id IN ('+ids(m.borrow_ids)+')');
await ds.query("UPDATE copies SET status='AVAILABLE' WHERE copy_id IN ("+ids(m.copy_ids)+")");
console.log('ROLLBACK COMPLETE borrows='+m.borrow_ids.length+' fines='+m.fine_ids.length);
await ds.destroy();
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
