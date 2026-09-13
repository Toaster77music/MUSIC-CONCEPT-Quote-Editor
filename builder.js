import {effectiveProject} from './catalog.js?v=builder1';
import {calculate} from './core.js?v=builder1';
export const displayDefaults={duration:true,includes:true,artists:false,fee:true,travel:false,total:true,deposit:true,conditions:true,videos:true};
export const commonLabels={client:'Contact',company:'Client / société',email:'E-mail',phone:'Téléphone',date:'Date(s)',place:'Lieu',duration:'Horaires / durée demandés',participants:'Participants',context:'Contexte',constraints:'Contraintes'};
const lines={
 '0':['Une expérience collective autour des percussions brésiliennes.','Chaque participant découvre son instrument et apprend son rythme.','Les familles de percussions se réunissent pour former une batucada.','Le Mestre dirige le groupe dans une performance musicale partagée.'],
 '1':['Un atelier musical où le corps devient un instrument.','Mains, pieds et mouvements créent les premières séquences rythmiques.','Les participants construisent progressivement un morceau ensemble.','Une expérience participative qui sollicite l’écoute et la coordination.'],
 '2':['Un atelier pour créer une chanson à l’image de votre entreprise.','Les participants imaginent des paroles autour de leurs messages.','Le coach accompagne l’écriture et la mise en rythme.','Le groupe chante et enregistre sa création collective.'],
 '3':['Un hommage live aux grands classiques du disco.','Musiciens, chanteurs et danseuses partagent la scène.','Le spectacle retrouve l’esprit festif des années disco.','Un répertoire pensé pour rassembler et faire danser les générations.'],
 '4':['Les grands sons électro revisités sur scène.','Batterie électronique, claviers et machines forment le cœur du projet.','La formation évolue selon la configuration choisie.','Un concert qui associe l’énergie du live à l’univers des musiques électroniques.'],
 '5':['Un hommage à l’univers musical de Lenny Kravitz.','Rock, soul et funk composent l’identité du spectacle.','Les musiciens revisitent ses titres en concert live.','Deux formations permettent d’adapter la présence scénique à votre événement.'],
 '6':['Un hommage à Claude François et à ses chansons emblématiques.','Le sosie de Cloclo est accompagné de danseuses.','Les formules Full et Middle ajoutent musiciens et choristes.','Un spectacle festif décliné en plusieurs configurations.'],
 '7':['Une performance de percussions urbaines sur bidons métalliques.','Les rythmes sont portés par une mise en scène chorégraphiée.','Le projet associe énergie sonore et présence visuelle.','La formation est à définir selon le format de votre événement.'],
 '8':['Un spectacle percussif inspiré de l’univers spatial.','Toms, cymbales et grosses caisses composent le marching band.','Les masques LED accompagnent l’identité visuelle du projet.','Une performance qui mêle rythmes puissants et esthétique futuriste.'],
 '9':['Quatre musiciens explorent les percussions sur objets.','Bidons et accessoires deviennent des instruments de musique.','Le spectacle associe rythme, humour et interaction.','Une proposition décalée pour les événements de rue et les soirées.'],
 '10':['Un orchestre live au répertoire de tubes variés.','Musiciens et voix accompagnent les temps forts de votre soirée.','Le projet mêle une ambiance élégante à une énergie festive.','La configuration est à définir selon votre événement.'],
 '11':['Vos invités deviennent les chanteurs d’un groupe live.','Des musiciens les accompagnent sur scène.','Les paroles à l’écran facilitent leur participation.','Une expérience musicale collective dans une ambiance de concert.'],
 '12':['Une animation musicale live pour cocktails et réceptions.','Une ambiance élégante accompagne les échanges entre invités.','Le projet privilégie une atmosphère chaleureuse et raffinée.','La formation est modulable selon le format de votre réception.']};
export function presentation(p){return [...(lines[p.id]||[p.description||'Présentation du projet à compléter.','Univers musical à préciser.','Déroulement de la prestation à préciser.','Adaptation à votre événement à préciser.'])];}
export function makeBlock(p,r,uid){return {uid,projectId:p.id,name:p.name,formulaId:p.selectedFormula||p.formulas?.[0]?.id||'',p:structuredClone(effectiveProject(p)),lines:presentation(p),show:{...displayDefaults},fees:{cars:'',seats:r.seats,kmRate:r.kmRate,tolls:r.tolls,meal:r.meal,hotel:p.formulas?r.hotel??'':0,trucks:0,truckRental:0,truckKmRate:0,truckTolls:0},configurations:{}};}
export function migrateBuilder(s){
 if(!Array.isArray(s.blocks))s.blocks=s.projects.flatMap(p=>(p.formulas||[null]).flatMap(f=>{const key=p.id+':'+(f?.id||'');if(!s.selections?.includes(key))return [];const b=makeBlock(f?{...p,selectedFormula:f.id}:p,s.r,'legacy-'+key);b.fees.hotel=s.hotels?.[key]??b.fees.hotel;return [b];}));
 s.commonShow={...Object.fromEntries(Object.keys(commonLabels).map(k=>[k,true])),...s.commonShow};s.d.constraints??='';return s;
}
export function switchFormula(b,project,id){
 b.configurations[b.formulaId]={p:structuredClone(b.p),fees:structuredClone(b.fees)};
 b.formulaId=id;const saved=b.configurations[id];
 if(saved){b.p=structuredClone(saved.p);b.fees=structuredClone(saved.fees);}else{b.p=structuredClone(effectiveProject({...project,selectedFormula:id}));b.fees={...b.fees,cars:'',trucks:0,truckRental:0,truckKmRate:0,truckTolls:0};}
}
export function blockCost(b,d,r){
 const basic=calculate(b.p,d,{...r,...b.fees,hotel:0});
 const cars=b.fees.cars===''?basic.cars:Number(b.fees.cars),trucks=Number(b.fees.trucks)||0;
 const km=d.km===''?null:Number(d.km),f=b.fees;
 const round=n=>Math.round(n*100)/100;
 const carCost=km===null&&cars>0?null:round((km||0)*2*cars*Number(f.kmRate)+cars*Number(f.tolls));
 const truckCost=trucks===0?0:km===null&&Number(f.truckKmRate)>0?null:round(trucks*(Number(f.truckRental)+(km||0)*2*Number(f.truckKmRate)+Number(f.truckTolls)));
 const meals=round(basic.artists*Number(f.meal));const hotel=f.hotel===''?null:Number(f.hotel);
 const travel=carCost===null||truckCost===null||hotel===null?null:round(carCost+truckCost+meals+hotel);
 const total=basic.fee===null||travel===null?null:round(basic.fee+travel);
 return {...basic,cars,trucks,carCost,truckCost,meals,hotel,travel,total,deposit:total===null?null:round(total*Number(r.deposit)/100)};
}
