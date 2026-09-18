import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const artifacts=path.join(root,'test-artifacts');
await mkdir(artifacts,{recursive:true});
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=9333','--remote-allow-origins=*','--user-data-dir='+path.join(artifacts,'chrome-profile'),'about:blank'],{windowsHide:true,stdio:'ignore',env:{...process.env,TEMP:artifacts,TMP:artifacts}});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let socket;
try {
 let targets;
 for(let i=0;i<60;i++){try{targets=await(await fetch('http://127.0.0.1:9333/json')).json();break;}catch{await delay(250);}}
 if(!targets)throw new Error('Chrome debugging endpoint did not start');
 socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j});
 let seq=0;const pending=new Map();const errors=[];
 socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p?.reject(new Error(m.error.message)):p?.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text+' '+(m.params.exceptionDetails.exception?.description||''));};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
 await send('Runtime.enable');await send('Page.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:'http://localhost:5173/login'});await delay(1200);
 const login=await evaluate("(async()=>{const credentials={email:'ui-smoke@dandenonghyundai.test',password:'ui-smoke-password',role:'dealership'};await fetch('/api/auth/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...credentials,name:'UI Smoke Test'})});const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(credentials)});const d=await r.json();if(!r.ok)throw new Error(d.error||'Login failed');localStorage.setItem('token',d.token);localStorage.setItem('user',JSON.stringify(d.user));return {ok:r.ok};})()");
 console.log('Demo authentication',login);
 const report=[];
 for(const route of ['/','/ap','/bank','/inventory','/gl']){
   await send('Page.navigate',{url:'http://localhost:5173'+route});
   for(let i=0;i<150;i++){await delay(200);if(await evaluate("!!document.querySelector('h1') && !document.body.innerText.includes('Loading records') && !document.body.innerText.includes('Loading…')"))break;}
   await delay(500);
   const result=await evaluate("({title:document.querySelector('h1')?.innerText,rows:document.querySelectorAll('.data-table tbody tr').length,alerts:[...document.querySelectorAll('[role=alert]')].map(e=>e.innerText),badNumbers:/NaN|undefined/.test(document.body.innerText),overflow:document.documentElement.scrollWidth>innerWidth})");
   const shot=await send('Page.captureScreenshot',{format:'png'});
   const name=route==='/'?'dashboard':route.slice(1);
   await writeFile(path.join(artifacts,name+'.png'),Buffer.from(shot.data,'base64'));
   report.push({route,...result});
 }

 console.log('Page checks',JSON.stringify(report));
 const adapters=await evaluate(`(async()=>{
   const gl=await import('/src/api/gl.ts'), ap=await import('/src/api/ap.ts'), bank=await import('/src/api/bank.ts'), inv=await import('/src/api/inventory.ts'), dash=await import('/src/api/dashboard.ts');
   const [accounts,invoices,vehicles,transactions,ageing,evidence,floorplan]=await Promise.all([gl.getAccountsApi(),ap.getInvoicesApi({limit:10}),inv.getVehiclesApi({limit:10}),bank.getBankTransactionsApi({limit:10}),ap.getApAgeingApi(),gl.exportEvidencePackApi(),inv.getFloorplanApi()]);
   const [drill,invoice,vehicle,matches,kpi]=await Promise.all([gl.drillAccountApi(accounts.accounts[0]._id,{}),ap.getInvoiceApi(invoices.invoices[0]._id),inv.getVehicleApi(vehicles.vehicles[0]._id),bank.getSuggestedMatchesApi(transactions.transactions[0]._id),dash.drillKPIApi('daysSupply')]);
   return {accounts:accounts.accounts.length,invoice:!!invoice.invoice._id,vehicle:!!vehicle.vehicle._id,drillEntries:drill.entries.length,candidates:matches.matches.length,kpiItems:kpi.items.length,ageing:Array.isArray(ageing.buckets)&&Number.isFinite(ageing.varianceCents),evidence:Array.isArray(evidence.controlRecs),floorplan:Number.isFinite(floorplan.headroomCents)};
 })()`);
 console.log('API adapters',JSON.stringify(adapters));
 const interactions=[];
 const go=async route=>{await send('Page.navigate',{url:'http://localhost:5173'+route});for(let i=0;i<150;i++){await delay(100);if(await evaluate("!!document.querySelector('h1') && !document.body.innerText.includes('Loading records') && !document.body.innerText.includes('Loading') && location.pathname==="+JSON.stringify(route))){await delay(400);return;}}throw new Error('Page timeout '+route);};
 const clickText=async text=>evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(text)});if(!b)throw new Error('Missing button '+${JSON.stringify(text)});b.click();return true;})()`);
 const close=async()=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await delay(200);};
 await go('/ap');await clickText('Exception');await delay(350);
 interactions.push({test:'AP exception filter',pass:await evaluate("[...document.querySelectorAll('.data-table tbody tr')].every(r=>r.innerText.includes('EXCEPTION'))")});
 await clickText('All');await delay(250);await clickText('Review extraction');await delay(800);
 interactions.push({test:'Invoice review loads GL accounts and suppliers',pass:await evaluate("document.querySelectorAll('[role=dialog] select option').length>3")});await close();
 await go('/inventory');await clickText('used');await delay(350);
 interactions.push({test:'Used vehicle filter',pass:await evaluate("[...document.querySelectorAll('.data-table tbody tr')].every(r=>r.innerText.includes('used')) && document.querySelectorAll('.data-table tbody tr').length>0")});
 await evaluate("document.querySelector('.data-table .text-link').click()");await delay(600);
 interactions.push({test:'VIN detail opens',pass:await evaluate("!!document.querySelector('[role=dialog]')")});await close();
 await go('/gl');await evaluate("document.querySelector('.data-table .text-link').click()");for(let i=0;i<100;i++){await delay(150);if(await evaluate("!!document.querySelector('[role=dialog]') && !document.body.innerText.includes('Loading account postings')"))break;}
 interactions.push({test:'Account drill loads',pass:await evaluate("!!document.querySelector('[role=dialog]') && !document.body.innerText.includes('Loading account postings')")});await close();
 await go('/bank');await clickText('upside');await delay(250);
 interactions.push({test:'Cash scenario changes',pass:await evaluate("document.querySelector('.scenario-buttons .selected')?.textContent==='upside'")});
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
 for(const route of ['/','/ap','/bank','/inventory','/gl']){await go(route);const pass=await evaluate("document.querySelector('.app-content').scrollWidth<=document.querySelector('.app-content').clientWidth");if(!pass)console.log('Overflow '+route,await evaluate("[...document.querySelectorAll('.app-content *')].filter(e=>e.getBoundingClientRect().right>innerWidth&&getComputedStyle(e.parentElement).overflowX!=='auto').slice(0,10).map(e=>({tag:e.tagName,class:e.className,right:e.getBoundingClientRect().right}))"));interactions.push({test:'Mobile layout '+route,pass});}
 const mobile=await send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(artifacts,'mobile.png'),Buffer.from(mobile.data,'base64'));
 console.log(JSON.stringify({report,adapters,interactions,errors},null,2));
 if(interactions.some(i=>!i.pass))process.exitCode=1;

 await writeFile(path.join(artifacts,'smoke-report.json'),JSON.stringify({report,adapters,interactions,errors},null,2));
 if(errors.length||report.some(r=>!r.title||r.alerts.length||r.badNumbers))process.exitCode=1;
 await send('Browser.close');
} finally {socket?.close();browser.kill();}
