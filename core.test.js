import test from 'node:test';import assert from 'node:assert/strict';import {analyse,calculate} from './core.js';import {initialCatalog} from './catalog.js';
test('dates alternatives et extraction du budget',()=>{const r=analyse('Contact : Naëlla\nLieu : Colombes ou ses environs\nSamba Experience pour 50 participants le 1er ou le 8 octobre 2026. Budget : 1 000 €',initialCatalog);assert.equal(r.date,'1er ou le 8 octobre 2026');assert.equal(r.budget,'1000');assert.equal(r.participants,'50');assert.equal(r.ranked[0].id,'0');assert.equal(r.client,'Naëlla')});
test('arrondi véhicules, aller-retour et acompte',()=>{const c=calculate({base:700,artists:4,ratio:0,minCars:1},{participants:50,km:50},{seats:3,kmRate:1,tolls:10,meal:20,deposit:30});assert.equal(c.cars,2);assert.equal(c.travel,300);assert.equal(c.total,1000);assert.equal(c.deposit,300)});
test('prix inconnu et distance inconnue ne deviennent pas zéro',()=>{assert.equal(calculate(initialCatalog[0],{km:'',participants:50},{seats:3,kmRate:.6,tolls:0,meal:0,deposit:30}).total,null)});
test('effectif selon capacité et suppléments',()=>{const c=calculate({base:100,perArtist:200,perPerson:2,artists:1,ratio:50,minCars:2},{participants:101,km:0},{seats:3,kmRate:.6,tolls:0,meal:0,deposit:30});assert.equal(c.artists,3);assert.equal(c.cars,2);assert.equal(c.total,902)});
test('aucune donnée inventée dans une demande vide',()=>{const r=analyse('Bonjour, merci de me rappeler.',initialCatalog);assert.equal(r.date,'');assert.equal(r.budget,'');assert.equal(r.place,'');assert.deepEqual(r.ranked,[])});

import {migrateCatalog,effectiveProject,tributeFormulas} from './catalog.js';
test('les dix tarifs fournis et les effectifs sont exacts',()=>{
 assert.deepEqual(Object.values(tributeFormulas).flat().map(f=>[f.artists,f.base]),[[8,3900],[3,3000],[4,3500],[6,4500],[8,3900],[5,2600],[11,4400],[9,3900],[5,2600],[3,2000]]);
});
test('migration ajoute les formules sans écraser les réglages existants',()=>{
 const original=structuredClone(initialCatalog);original[0].base=1000;original[6].base=5000;
 const migrated=migrateCatalog(original);assert.equal(migrated[0].base,1000);assert.equal(effectiveProject(migrated[6]).base,5000);
 migrated[6].formulas[0].base=4600;assert.deepEqual(migrateCatalog(migrated),migrated);
});
test('Cloclo full : 11 artistes, 4 voitures, VHR ajoutés une seule fois',()=>{
 const p=effectiveProject(migrateCatalog(initialCatalog)[6]);
 const r={seats:3,kmRate:.6,tolls:20,meal:25,hotel:500,deposit:30};
 const c=calculate(p,{km:100,participants:50},r);
 assert.equal(c.artists,11);assert.equal(c.cars,4);assert.equal(c.fee,4400);assert.equal(c.travel,835);assert.equal(c.total,5735);assert.equal(c.deposit,1720.5);
 assert.equal(calculate(p,{km:100}, {...r,hotel:''}).total,null);
});
test('changement de formule Cloclo modifie durée, tarif et transport',()=>{
 const p=migrateCatalog(initialCatalog)[6];p.selectedFormula='light3';const f=effectiveProject(p);
 assert.equal(f.duration,'1h');assert.equal(f.base,2000);assert.equal(f.artists,3);
 assert.equal(calculate(f,{km:0},{seats:3,kmRate:.6,tolls:0,meal:0,hotel:0,deposit:30}).total,2000);
});

import {migrateSelections,selectedOptions,combinedTotal,proposal} from './quote.js';
test('sélection multiple sans doublons et migration de la formule précédente',()=>{
 const s={projects:migrateCatalog(initialCatalog),project:'6',r:{hotel:0}};migrateSelections(s);assert.deepEqual(s.selections,['6:full']);s.selections=['6:full','6:full','6:light3','3:full'];migrateSelections(s);assert.equal(s.selections.length,3);
});
test('plusieurs projets : alternatives non additionnées et mode cumulé explicite',()=>{
 const s=migrateSelections({projects:migrateCatalog(initialCatalog),selections:['6:light3','3:full'],mode:'alternatives',r:{seats:3,kmRate:.6,tolls:0,meal:0,hotel:0,deposit:30},d:{km:'0'},hotels:{}});
 const options=selectedOptions(s);assert.equal(options.length,2);assert.equal(combinedTotal(options),5900);assert.match(proposal(s,options),/Option 1 — Disco Fiesta/);assert.match(proposal(s,options),/Option 2 — Cloclo/);assert.doesNotMatch(proposal(s,options),/TOTAL GÉNÉRAL/);s.mode='cumulative';assert.match(proposal(s,options),/TOTAL GÉNÉRAL HT/);
 s.hotels['6:light3']='';assert.equal(combinedTotal(selectedOptions(s)),null);s.selections=[];assert.equal(selectedOptions(s).length,0);assert.equal(combinedTotal([]),null);
});

import {makeBlock,migrateBuilder,blockCost,switchFormula} from './builder.js';
test('frais indépendants : voitures, camion et location ne se confondent pas',()=>{
 const r={seats:3,kmRate:.6,tolls:0,meal:0,hotel:0,deposit:30};const p=migrateCatalog(initialCatalog)[6];const a=makeBlock(p,r,'a'),b=makeBlock(p,r,'b');
 a.fees={...a.fees,cars:2,trucks:1,truckRental:200,truckKmRate:.3,truckTolls:20,meal:10,hotel:100};
 const c=blockCost(a,{km:'100'},r);assert.equal(c.carCost,240);assert.equal(c.truckCost,280);assert.equal(c.meals,110);assert.equal(c.total,5130);assert.equal(b.fees.trucks,0);
 switchFormula(a,p,'light3');a.fees.cars=0;a.fees.trucks=2;switchFormula(a,p,'full');assert.equal(a.fees.cars,2);assert.equal(a.fees.trucks,1);
});
test('blocs répétés, quatre lignes et informations communes une seule fois',()=>{
 const r={seats:3,kmRate:.6,tolls:0,meal:0,hotel:0,deposit:30};const s=migrateBuilder(migrateSelections({projects:migrateCatalog(initialCatalog),selections:['6:full','3:full'],r,d:{km:'0',client:'Test Client',place:'Lieu Test',constraints:'Accès camion limité'}}));
 s.blocks.push({...structuredClone(s.blocks[0]),uid:'duplicate'});assert.equal(selectedOptions(s).length,3);
 s.blocks[0].show.travel=false;s.commonShow.client=false;
 const text=proposal(s,selectedOptions(s));assert.equal(text.split('Lieu Test').length-1,1);assert.equal(text.split('Accès camion limité').length-1,1);assert.doesNotMatch(text,/Test Client/);
 const name=text.indexOf('Option 1 —');assert.deepEqual(text.slice(name).split('\n').slice(1,5),s.blocks[0].lines);
 s.blocks=[];assert.equal(selectedOptions(s).length,0);
});
