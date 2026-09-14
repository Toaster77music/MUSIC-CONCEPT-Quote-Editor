import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCatalog,migrateCatalog} from './catalog.js';
import {makeBlock,syncCatalogFields,switchFormula,lineUps} from './builder.js';
test('catalog line ups replace legacy selection and synchronize editable fields',()=>{
 const p=migrateCatalog(structuredClone(initialCatalog)).find(p=>p.id==='3');p.formulas.push({...p.formulas[0],id:'custom',name:'Ancien tarif personnalisé'});p.selectedFormula='custom';
 const b=makeBlock(p,{seats:3,kmRate:0.6,tolls:0,meal:0},'x');assert.equal(b.formulaId,'full');assert.equal(lineUps(p).length,1);
 p.formulas[0].duration='2h';p.formulas[0].includes='Nouvelle composition';syncCatalogFields(b,p);assert.equal(b.p.duration,'2h');assert.equal(b.p.includes,'Nouvelle composition');
 b.p.duration='1h';b.catalogOverrides.duration=true;p.formulas[0].duration='3h';syncCatalogFields(b,p);assert.equal(b.p.duration,'1h');
 switchFormula(b,p,'full');assert.equal(b.p.duration,'1h');
 b.formulaId='custom';syncCatalogFields(b,p);assert.equal(b.formulaId,'full');assert.equal(b.p.base,3700);
});
