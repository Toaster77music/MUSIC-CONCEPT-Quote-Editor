export const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const money=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n);
export function analyse(text,projects){
 const n=norm(text), grab=r=>text.match(r)?.[1]?.trim()||'';
 const dates=[...text.matchAll(/\b(?:\d{1,2}(?:er)?(?:\s+ou\s+(?:le\s+)?\d{1,2})?\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)(?:\s+\d{4})?|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})\b/gi)].map(m=>m[0]);
 const ranked=projects.map(p=>({id:p.id,score:(n.includes(norm(p.name))?100:0)+p.keywords.split(',').filter(k=>k.trim()&&n.includes(norm(k.trim()))).length*10})).filter(p=>p.score).sort((a,b)=>b.score-a.score);
 return {client:grab(/(?:client|contact|nom)\s*:\s*([^\n]+)/i),company:grab(/(?:société|entreprise)\s*:\s*([^\n]+)/i),email:grab(/([\w.+-]+@[\w.-]+\.[a-z]{2,})/i),phone:grab(/((?:\+33|0)[1-9](?:[ .-]?\d{2}){4})/),date:[...new Set(dates)].join(' ou '),place:grab(/(?:lieu|adresse|ville)\s*:\s*([^\n]+)/i)||grab(/\b(?:à|sur)\s+([A-ZÀ-Ý][\p{L}-]+(?:\s+ou\s+ses\s+environs)?)/u),participants:grab(/(\d+)\s*(?:participants|personnes|collaborateurs|invités)/i),budget:grab(/budget\s*(?:de|:|maximum|max\.?|environ)?\s*([\d .,]+)\s*(?:€|euros)/i).replace(/\s/g,'').replace(',','.'),context:grab(/(?:contexte|événement)\s*:\s*([^\n]+)/i)||(/team.?building|cohesion|seminaire/.test(n)?'Team building / séminaire':''),duration:grab(/(?:durée|horaires)\s*:\s*([^\n]+)/i),ranked};
}
export function calculate(p,d,r){
 const artists=Math.max(Number(p.artists)||0,p.ratio>0?Math.ceil((Number(d.participants)||0)/p.ratio):0);
 const cars=Math.max(Number(p.minCars)||0,Math.ceil(artists/Math.max(1,Number(r.seats)||1)));
 const km=d.km===''?null:Number(d.km);
 const travel=km===null?null:Math.round((km*2*cars*Number(r.kmRate)+Number(r.tolls)*cars+Number(r.meal)*artists)*100)/100;
 const fee=p.base===''?null:Math.round((Number(p.base)+(Number(p.perArtist)||0)*artists+(Number(p.perPerson)||0)*(Number(d.participants)||0))*100)/100;
 const hotel=p.formulaName?(r.hotel===''||r.hotel===undefined?null:Number(r.hotel)):0;
 const total=fee===null||travel===null||hotel===null?null:Math.round((fee+travel+hotel)*100)/100;
 return {artists,cars,travel,fee,total,deposit:total===null?null:Math.round(total*Number(r.deposit))/100};
}

export function validTechnicalSheet(f){
 return !!f&&typeof f.name==='string'&&/\.pdf$/i.test(f.name)&&Number.isInteger(f.size)&&f.size>0&&f.size<=2*1024*1024&&typeof f.data==='string'&&f.data.length<=2800000&&/^[A-Za-z0-9+/]*={0,2}$/.test(f.data)&&f.data.startsWith('JVBERi0');
}
export function buildEml(subject,body,to,files=[]){
 const encode=s=>btoa(Array.from(new TextEncoder().encode(s),b=>String.fromCharCode(b)).join(''));
 const wrap=s=>s.match(/.{1,76}/g)?.join('\r\n')||'';
 const boundary='mc_'+crypto.randomUUID();
 const safeTo=/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(to||'')?to:'';
 const lines=['X-Unsent: 1','MIME-Version: 1.0',...(safeTo?['To: '+safeTo]:[]),'Subject: =?UTF-8?B?'+encode(subject.replace(/[\r\n]/g,' '))+'?=','Content-Type: multipart/mixed; boundary="'+boundary+'"','','--'+boundary,'Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: base64','',wrap(encode(body))];
 for(const f of files){if(!validTechnicalSheet(f))throw Error('Fiche technique invalide');const name=encodeURIComponent(f.name).replace(/'/g,'%27');lines.push('--'+boundary,'Content-Type: application/pdf',"Content-Disposition: attachment; filename=\"fiche-technique.pdf\"; filename*=UTF-8''"+name,'Content-Transfer-Encoding: base64','',wrap(f.data));}
 lines.push('--'+boundary+'--','');return lines.join('\r\n');
}
