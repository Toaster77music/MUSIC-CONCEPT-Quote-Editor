// Resolve the release before loading app code. Deployment versions also bust module imports.
async function release(){const r=await fetch('./version.json?t='+Date.now(),{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error();const v=(await r.json()).version;if(typeof v!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(v))throw Error();return v;}
let loaded;try{loaded=await release()}catch{loaded='multi1'}
await import('./app.js?v='+loaded);
let lastEdit=0,checking=false;
document.addEventListener('input',()=>lastEdit=Date.now());
async function check(){
 if(checking||document.hidden)return;checking=true;
 try{const next=await release();if(next===loaded)return;
 const status=document.getElementById('update-status');status.textContent='Nouvelle version disponible. Actualisation automatique après votre saisie…';
 if(Date.now()-lastEdit<5000)return;
 if(!window.dispatchEvent(new Event('mc-before-update',{cancelable:true}))){status.textContent='Actualisation suspendue : exportez vos données pour les conserver.';return;}
 const url=new URL(location.href);url.searchParams.set('v',next);location.replace(url.href);
 }catch{/* Offline: keep the current app and draft. */}finally{checking=false;}
}
setInterval(check,30000);document.addEventListener('visibilitychange',check);
