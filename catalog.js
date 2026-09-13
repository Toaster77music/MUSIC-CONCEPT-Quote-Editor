const items=[
['Samba Experience','Team building','samba,batucada,percussions brésiliennes,cohésion','Créez ensemble une batucada : découverte des instruments, travail par familles, puis orchestre collectif dirigé par le Mestre. Accessible sans expérience musicale.','samba-experience',1,'1h15 à 1h30'],
['Body Groove Experience','Team building','body,corporelles,cohésion','Un atelier de percussions corporelles pour construire une performance collective et développer l’écoute.','body-groove-experience'],
['The Songwriting Experience','Team building','songwriting,chanson,écriture,cohésion','Écrivez, chantez et enregistrez une chanson autour des messages de votre entreprise.','the-songwriting-experience'],
['Disco Fiesta','Tribute show','disco,années 70,années 80','Un spectacle disco live avec musiciens, chant et danse.','disco-fiesta',8],
['Sonic Drift','Tribute show','electro,électro,techno,dance','Les grands sons électro revisités en concert live, avec un univers visuel LED.','sonic-drift'],
['Circus','Tribute show','lenny,kravitz,rock','Un hommage live à Lenny Kravitz, entre rock, soul et funk.','circus'],
['Cloclo','Tribute show','cloclo,claude françois','Un hommage à Claude François, décliné en plusieurs formations avec danseuses et, selon la formule, musiciens.','cloclo'],
['Durbaan','Spectacle de rue','durbaan,bidons,urban','Une performance de percussions sur bidons métalliques avec mise en scène chorégraphiée.','durbaan'],
['BattleDrum Galactica','Spectacle de rue','battledrum,galactica,led,futuriste','Un marching band percussif et visuel avec masques LED et univers spatial.','battledrum-galactica'],
['Les Perturbatteurs','Spectacle de rue','perturbatteurs,stomp,humour','Quatre musiciens mêlent percussions sur objets, humour et interaction.','les-perturbatteurs',4],
['Dial Show Orchestra','Soirée live','orchestre,gala,dial','Un orchestre pour accompagner les soirées avec un répertoire de tubes variés.','dial-show-orchestra'],
['Karaoké Live « Be A Star »','Soirée live','karaoké,karaoke,be a star','Vos invités chantent sur scène avec des musiciens live et les paroles à l’écran.','karaoke-live-be-a-star'],
['Velvet Cocktail','Soirée live','velvet,cocktail,jazz,réception','Une formation live modulable pour une atmosphère élégante lors de vos cocktails et réceptions.','velvet-cocktail']
];
export const initialCatalog=items.map(([name,category,keywords,description,slug,artists='',duration='À définir'],i)=>({id:String(i),name,category,keywords,description,source:i===0?'https://music-concept.fr/samba-experience/':'https://music-concept.fr/',artists,duration,base:'',perArtist:0,perPerson:0,ratio:'',capacity:'',minCars:1,includes:i===0?'Instruments et encadrement musical':'À préciser',videos:i===0?'https://www.youtube.com/watch?v=-9rM09x_br0\nhttps://www.youtube.com/watch?v=_UZPemF9Cos':''}));

export const tributeConditions='La sonorisation, les lumières et la scène sont à la charge de l’organisateur. Les groupes n’ont pas de technicien attitré et s’adaptent au prestataire avec lequel vous avez l’habitude de travailler. Les VHR (voyage, hébergement et restauration) ne sont pas inclus dans le tarif artistique.';
const formula=(id,name,artists,base,duration,includes)=>({id,name,artists,base,duration,includes,perArtist:0,perPerson:0,ratio:'',capacity:'',minCars:1});
export const tributeFormulas={
 '6':[
 formula('full','Full Line Up',11,4400,'1h15','Basse / Batterie / Guitare / Clavier / 2 choristes / 4 danseuses / Sosie de Cloclo'),
 formula('middle','Middle Line Up',9,3900,'1h15','Basse / Batterie / Guitare / Clavier / 2 choristes / 2 danseuses / Sosie de Cloclo'),
 formula('light5','Light Line Up – 5',5,2600,'1h','4 danseuses / Sosie de Cloclo'),
 formula('light3','Light Line Up – 3',3,2000,'1h','2 danseuses / Sosie de Cloclo')],
 '3':[formula('full','Full Line Up',8,3900,'1h15','Basse / Batterie / Guitare / Clavier / Chanteur / Chanteuse / 2 danseuses')],
 '5':[
 formula('full','Full Line Up',8,3900,'1h15','Basse / Batterie / Guitare / Clavier / Chanteur / Saxophone / Trompette / Trombone'),
 formula('light','Light Line Up',5,2600,'1h15','Basse / Batterie / Guitare / Clavier / Chanteur')],
 '4':[
 formula('standard','Standard Line Up',3,3000,'1h15','Batterie Electro / Claviers / Machines'),
 formula('middle','Middle Line Up',4,3500,'1h15','Batterie Electro / Claviers / Machines / Saxophone ou percussions'),
 formula('full','Full Line Up',6,4500,'1h15','Batterie Electro / Claviers / Machines / Saxophone ou Percussions / 2 chants')]
};
// Add the supplied rate card once, preserving saved project edits and later formula edits.
export function migrateCatalog(projects){return projects.map(p=>{
 if(!tributeFormulas[p.id]||p.formulas)return p;
 const formulas=structuredClone(tributeFormulas[p.id]);
 if(p.base!=='')formulas.push({...Object.fromEntries(['artists','base','duration','includes','perArtist','perPerson','ratio','capacity','minCars'].map(k=>[k,p[k]])),id:'custom',name:'Ancien tarif personnalisé'});
 return {...p,formulas,selectedFormula:p.base!==''?'custom':formulas[0].id,conditions:tributeConditions};
});}
export function effectiveProject(p){const f=p.formulas?.find(f=>f.id===p.selectedFormula)||p.formulas?.[0];return f?{...p,...f,id:p.id,name:p.name,formulaName:f.name,conditions:p.conditions}:p;}
