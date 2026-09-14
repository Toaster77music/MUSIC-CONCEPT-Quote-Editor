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
 '3':[formula('full','Full Line Up',8,3700,'1h15','Basse / Batterie / Guitare / Clavier / Chanteur / Chanteuse / 2 danseuses')],
 '5':[
 formula('full','Full Line Up',8,3700,'1h15','Basse / Batterie / Guitare / Clavier / Chanteur / Saxophone / Trompette / Trombone'),
 formula('light','Light Line Up',5,2600,'1h15','Basse / Batterie / Guitare / Clavier / Chanteur')],
 '4':[
 formula('standard','Standard Line Up',3,3000,'1h15','Batterie Electro / Claviers / Machines'),
 formula('middle','Middle Line Up',4,3500,'1h15','Batterie Electro / Claviers / Machines / Saxophone ou percussions'),
 formula('full','Full Line Up',6,4500,'1h15','Batterie Electro / Claviers / Machines / Saxophone ou Percussions / 2 chants')]
};
export function updateSeptemberRate(projectId,f){
 if(!['3','5'].includes(projectId)||f.id!=='full'||f.rateRevision==='2026-09-14')return f;
 return {...f,base:Number(f.base)===3900?3700:f.base,rateRevision:'2026-09-14'};
}
// Add the supplied rate card once, preserving saved project edits and later formula edits.
export function migrateCatalog(projects){return projects.map(p=>{
 const ref=initialCatalog.find(x=>x.id===p.id);if(ref){p=populateVideos(p,ref);p={...p,description:p.description===legacyDescriptions[p.id]?ref.description:p.description,source:ref.source};}
 if(p.formulas)p={...p,formulas:p.formulas.map(f=>updateSeptemberRate(p.id,f))};
 if(!tributeFormulas[p.id]||p.formulas)return p;
 const formulas=structuredClone(tributeFormulas[p.id]).map(f=>updateSeptemberRate(p.id,f));
 if(p.base!=='')formulas.push({...Object.fromEntries(['artists','base','duration','includes','perArtist','perPerson','ratio','capacity','minCars'].map(k=>[k,p[k]])),id:'custom',name:'Ancien tarif personnalisé'});
 return {...p,formulas,selectedFormula:p.base!==''?'custom':formulas[0].id,conditions:tributeConditions};
});}
export function effectiveProject(p){const f=p.formulas?.find(f=>f.id===p.selectedFormula)||p.formulas?.[0];return f?{...p,...f,id:p.id,name:p.name,formulaName:f.name,conditions:p.conditions}:p;}

// Summaries of each artist page, reviewed 14 September 2026. Editable thereafter.
const legacyDescriptions=Object.fromEntries(initialCatalog.map(p=>[p.id,p.description]));
const summaries=[
'Samba Experience invite vos équipes à former un orchestre de batucada autour des percussions brésiliennes. Sans expérience musicale préalable, chacun découvre son instrument, apprend son rythme et rejoint une création collective dirigée par le Mestre. L’atelier développe l’écoute, la coordination et la cohésion dans une ambiance festive. Son déroulement s’adapte au format de votre séminaire ou événement.',
'Body Groove Experience transforme le corps en instrument de musique : mains, doigts, cuisses et pas composent une performance collective. Guidés progressivement, les participants découvrent les sons, apprennent des séquences puis construisent un morceau ensemble. Accessible sans pratique musicale, l’atelier associe mouvement, concentration et plaisir de jouer. Une expérience pour mobiliser l’énergie du groupe et renforcer son écoute.',
'The Songwriting Experience propose à vos collaborateurs d’écrire une chanson autour de l’identité et des messages de votre entreprise. Un coach accompagne les équipes dans la création des paroles, leur mise en rythme et l’interprétation vocale. La restitution peut prendre la forme d’un enregistrement ou d’une performance collective, selon la formule retenue. Un atelier créatif pour donner une voix commune à vos équipes.',
'Disco Fiesta fait revivre les grandes heures du disco dans un spectacle live associant musiciens, chant et danse. Les tubes disco et funk des années 70 et 80, les costumes et les chorégraphies invitent le public à rejoindre la fête. Le répertoire rassemble les générations dans une ambiance résolument dansante. Une proposition adaptée aux festivals, soirées d’entreprise et événements privés.',
'Sonic Drift associe la présence d’un groupe live à l’énergie d’un DJ set. Batterie électronique, claviers et machines revisitent les grands titres électro, dance et techno dans une ambiance club. La formation peut être enrichie selon la configuration choisie pour donner une nouvelle dimension au spectacle. Un concert pensé pour faire danser le public lors de soirées, festivals ou événements d’entreprise.',
'Circus rend hommage à Lenny Kravitz avec un concert mêlant rock, soul, funk et blues. Riffs de guitare, groove de la section rythmique et présence vocale font revivre les titres emblématiques de son répertoire. Le spectacle alterne énergie rock, morceaux dansants et ballades, avec une formation adaptée au format retenu. Une expérience live destinée aussi bien aux fans qu’à un public plus large.',
'Cloclo fait revivre les chansons de Claude François à travers un spectacle porté par son sosie et des danseuses. Selon la formule choisie, musiciens et choristes complètent la scène pour retrouver l’énergie de ses grands shows. Costumes, chorégraphies et titres populaires créent une ambiance festive et intergénérationnelle. Plusieurs configurations permettent d’adapter la prestation au lieu et au format de votre événement.',
'Durbaan propose un spectacle de percussions sur tambours métalliques où le rythme rencontre le mouvement. Les artistes associent précision musicale et chorégraphies pour créer une performance sonore et visuelle. Formation, durée, costumes et univers musical peuvent évoluer selon le contexte de votre événement. Un temps fort percussif pour une convention, un lancement de produit, un gala ou un festival.',
'BattleDrum Galactica plonge le public dans un univers futuriste où les percussions rencontrent la lumière. Toms, cymbales et grosses caisses portent l’énergie du marching band, tandis que les masques LED dessinent des personnages galactiques. Son, mouvement et effets visuels composent une performance immersive. Un spectacle pour marquer les temps forts d’un festival, d’une convention ou d’une soirée d’entreprise.',
'Les Perturbatteurs réunissent quatre artistes autour d’un spectacle mêlant percussions, humour et interaction. Bidons, accessoires et objets du quotidien deviennent des instruments au fil de joutes rythmiques pleines de surprises. Le mouvement et l’inventivité invitent le public dans un univers musical décalé. Le spectacle peut s’adapter au contexte, avec des formats courts et plusieurs passages selon les besoins.',
'Dial Show Orchestra propose une soirée live portée par la présence scénique du chanteur Dial, entouré de musiciens et de voix. Pop, soul, funk, disco et variété internationale composent un répertoire destiné à rassembler et faire danser les invités. La formation et le programme s’adaptent aux moments clés de votre événement. Une proposition modulable, de l’ambiance acoustique à l’orchestre festif.',
'Karaoké Live « Be A Star » invite vos participants à chanter sur scène avec de véritables musiciens. Les paroles affichées à l’écran ou sur téléphone facilitent la participation, dans une ambiance de concert. Le répertoire peut être adapté au public et une préparation avec coaching peut être organisée selon la formule. Une expérience participative pour partager le plaisir de la scène entre collègues ou invités.',
'Velvet Cocktail accompagne les réceptions et moments d’accueil avec une musique live élégante, laissant toute leur place aux échanges entre invités. La formation évolue du pianiste solo aux voix et instruments complémentaires selon l’ambiance recherchée. Pop, soul, jazz, lounge et standards composent un répertoire modulable. Une atmosphère chaleureuse et soignée pour cocktails, mariages et événements d’entreprise.'
];
const pageSlugs=['samba-experience','body-groove-experience','the-songwriting-experience','disco-fiesta','sonic-drift','circus','cloclo','durbaan','battledrum-galactica','les-perturbatteurs','dial-show-orchestra','karaoke-live-be-a-star','velvet-cocktail'];
initialCatalog.forEach((p,i)=>{p.description=summaries[i];p.source='https://music-concept.fr/'+pageSlugs[i]+'/';});

// Video links extracted from the project pages on 2026-09-14.
const siteVideos={"0": ["https://www.youtube.com/watch?v=_UZPemF9Cos", "https://www.youtube.com/watch?v=-9rM09x_br0", "https://www.youtube.com/watch?v=Pxq_ef5UZXc", "https://www.youtube.com/watch?v=8rRuTqw5wEU"], "1": ["https://www.youtube.com/watch?v=rjS8XaOqqn0"], "2": ["https://www.youtube.com/watch?v=anqR1Iy-DNI"], "3": ["https://www.youtube.com/watch?v=1I-nYxvkE0k", "https://www.youtube.com/watch?v=tDxcvhjYtg4", "https://www.youtube.com/watch?v=F6spZ6ELqk4", "https://www.youtube.com/watch?v=wWlTATJ08TU", "https://www.youtube.com/watch?v=kpresNgLtz8"], "4": ["https://www.youtube.com/watch?v=WKY9s_11Y84"], "5": ["https://www.youtube.com/watch?v=tIbmxCLtuyU"], "6": ["https://www.youtube.com/watch?v=ukMeWdpyDJg", "https://www.youtube.com/watch?v=oa2pA4068ek", "https://www.youtube.com/watch?v=Oy97WoOjQVA", "https://www.youtube.com/watch?v=h9peHLsfmjc", "https://www.youtube.com/watch?v=7gZZxI7fK00"], "7": ["https://www.youtube.com/watch?v=j39RHArH1rA"], "8": ["https://www.youtube.com/watch?v=VDCXVZ3Cs4c", "https://www.youtube.com/watch?v=PePCR-vZMM0", "https://www.youtube.com/watch?v=RdIKwLq2IcA", "https://www.youtube.com/watch?v=VZnTe5-AXBY"], "9": ["https://www.youtube.com/watch?v=Fe5hTpDxHWo", "https://www.youtube.com/watch?v=WKBdHBvN8T4"], "10": ["https://www.youtube.com/watch?v=9yEUKeKbAM8", "https://www.youtube.com/watch?v=OZNuPWEMm4k"], "11": [], "12": []};
initialCatalog.forEach(p=>{p.videos=siteVideos[p.id].join("\n");});
export function populateVideos(p,ref){
 if(p.videosRevision==='2026-09-14')return p;
 const links=[...(p.videos||'').split(/\n/),...(ref.videos||'').split(/\n/)].map(x=>x.trim()).filter(Boolean);
 const seen=new Set();const unique=links.filter(url=>{const id=url.match(/(?:[?&]v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1]||url;if(seen.has(id))return false;seen.add(id);return true;});
 return {...p,videos:unique.join('\n'),videosRevision:'2026-09-14'};
}
