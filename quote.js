import {blockCost,commonLabels} from './builder.js?v=builder1';
import {effectiveProject} from './catalog.js?v=builder1';
import {calculate,money} from './core.js?v=builder1';
export const optionKey=(p,f='')=>p+':'+f;
export function migrateSelections(state){
 if(!Array.isArray(state.selections)){const p=state.projects.find(p=>p.id===state.project)||state.projects[0];state.selections=[optionKey(p.id,p.formulas?.find(f=>f.id===p.selectedFormula)?.id||p.formulas?.[0]?.id||'')];}
 const valid=new Set(state.projects.flatMap(p=>p.formulas?p.formulas.map(f=>optionKey(p.id,f.id)):[optionKey(p.id)]));
 state.selections=[...new Set(state.selections)].filter(k=>valid.has(k));state.mode=state.mode==='cumulative'?'cumulative':'alternatives';state.hotels??={};return state;
}
export function selectedOptions(state){if(state.blocks)return state.blocks.map(b=>({key:b.uid,b,p:{...b.p,name:b.name},hotel:b.fees.hotel,c:blockCost(b,state.d,state.r),label:b.name+(b.p.formulaName?' — '+b.p.formulaName:'')}));return state.projects.flatMap(project=>(project.formulas||[null]).flatMap(f=>{
 const key=optionKey(project.id,f?.id||'');if(!state.selections.includes(key))return [];
 const p=f?effectiveProject({...project,selectedFormula:f.id}):project;
 const hotel=state.hotels[key]??state.r.hotel??'';
 return [{key,p,hotel,c:calculate(p,state.d,{...state.r,hotel}),label:p.name+(p.formulaName?' — '+p.formulaName:'')}];
}));}
export function combinedTotal(options){return options.length&&options.every(o=>o.c.total!==null)?Math.round(options.reduce((s,o)=>s+o.c.total,0)*100)/100:null;}
const fmt=n=>n===null?'à chiffrer':money(n);
export function proposal(state,options){
 if(state.blocks)return builderProposal(state,options);
 const d=state.d,cumulative=state.mode==='cumulative';
 const sections=options.map((o,i)=>{
 const {p,c,hotel}=o;
 return `${cumulative?'Prestation':'Option'} ${i+1} — ${o.label}\n${p.description}\nDurée proposée : ${p.duration}\nComposition / inclus : ${p.includes}\nEffectif : ${c.artists||'à préciser'} artiste(s) / intervenant(s)\nPrestation artistique : ${fmt(c.fee)} HT${p.formulaName?' hors VHR':''}\nVoyage et restauration : ${fmt(c.travel)}${p.formulaName?'\nHébergement : '+(hotel===''?'à chiffrer':money(Number(hotel))):''}\nTotal de ${cumulative?'la prestation':'l’option'} HT : ${fmt(c.total)}\nAcompte (${state.r.deposit} %) : ${fmt(c.deposit)}${p.conditions?'\n\nConditions : '+p.conditions:''}${p.videos?'\n\nVidéos :\n'+p.videos:''}`;
 });
 const total=combinedTotal(options);
 return `Bonjour${d.client?' '+d.client:''},\n\nMerci pour votre demande${d.context?' concernant votre événement « '+d.context+' »':''}. ${options.length?'Vous trouverez ci-dessous '+(cumulative?'les prestations réunies dans notre proposition.':'notre sélection d’animations. Les options sont proposées au choix ; leurs montants ne se cumulent pas.'):'La sélection des animations est en cours.'}\n\nVotre événement\n• Date(s) envisagée(s) : ${d.date||'à définir'}\n• Lieu : ${d.place||'à définir'}\n• Participants : ${d.participants||'à préciser'}\n• Durée / horaires demandés : ${d.duration||'à définir'}\n\n${sections.join('\n\n────────────────────\n\n')}${cumulative&&options.length?'\n\nTOTAL GÉNÉRAL HT : '+fmt(total)+'\nAcompte global ('+state.r.deposit+' %) : '+fmt(total===null?null:Math.round(total*Number(state.r.deposit))/100)+'\nLes frais sont calculés séparément pour chaque équipe, sans mutualisation.':''}\n\n${state.tax||'Régime fiscal et montant final à confirmer.'}\n\nPour finaliser la proposition, merci de confirmer ${cumulative?'les prestations retenues':'l’option retenue'}, la date, l’adresse exacte et les horaires. La proposition reste soumise à confirmation des disponibilités et des modalités techniques.\n\nJe reste à votre disposition pour adapter cette proposition à vos besoins. Pourriez-vous me confirmer la bonne réception de ce message ?\n\nBien cordialement,\nSébastien Poitevin\nMusic Concept\nsebastien@music-concept.fr\nhttps://music-concept.fr/`;
}

function builderProposal(state,options){
 const sections=options.map((o,i)=>{const {b,p,c}=o,show=b.show;
 const text=[`${state.mode==='cumulative'?'Prestation':'Option'} ${i+1} — ${b.name}`,b.commercialText?.trim()||'Présentation commerciale à compléter.'];
 if(p.formulaName)text.push('','Configuration : '+p.formulaName);
 if(show.duration)text.push('Durée proposée : '+p.duration);
 if(show.includes)text.push('Composition / inclus : '+p.includes);
 if(show.artists)text.push('Effectif : '+(c.artists||'à préciser')+' artiste(s)');
 if(show.fee)text.push('Tarif artistique HT hors frais : '+fmt(c.fee));
 if(show.travel)text.push(`Voitures : ${c.cars} — ${fmt(c.carCost)}`,`Camions : ${c.trucks} — ${fmt(c.truckCost)}`,`Restauration : ${fmt(c.meals)}`,`Hébergement : ${fmt(c.hotel)}`);
 if(show.total)text.push('Total HT avec frais : '+fmt(c.total));
 if(show.deposit)text.push('Acompte ('+state.r.deposit+' %) : '+fmt(c.deposit));
 if(show.conditions&&p.conditions)text.push('','Conditions techniques : '+p.conditions);
 if(show.videos&&p.videos)text.push('','Vidéos :',p.videos);
 return text.join('\n');});
 const common=Object.entries(commonLabels).filter(([k])=>state.commonShow[k]&&String(state.d[k]??'').trim()).map(([k,label])=>'• '+label+' : '+state.d[k]);
 const total=combinedTotal(options);
 return `Bonjour${state.commonShow.client&&state.d.client?' '+state.d.client:''},\n\nVoici notre proposition pour votre événement. ${state.mode==='cumulative'?'Les prestations ci-dessous sont cumulées.':'Les propositions ci-dessous sont des options au choix, dont les montants ne se cumulent pas.'}\n\n${sections.length?sections.join('\n\n────────────────────\n\n'):'Ajoutez votre premier projet pour commencer la proposition.'}${common.length?'\n\nINFORMATIONS COMMUNES À TOUS LES PROJETS\n'+common.join('\n'):''}${state.mode==='cumulative'&&options.length?'\n\nTOTAL GÉNÉRAL HT : '+fmt(total):''}\n\n${state.tax||'Régime fiscal et montant final à confirmer.'}\nProposition sous réserve de disponibilité des artistes et de validation des modalités techniques.\n\nJe reste à votre disposition pour adapter cette proposition à vos besoins.\n\nBien cordialement,\nSébastien Poitevin\nMusic Concept\nsebastien@music-concept.fr\nhttps://music-concept.fr/`;
}
