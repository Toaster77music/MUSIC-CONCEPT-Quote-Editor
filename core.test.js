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
