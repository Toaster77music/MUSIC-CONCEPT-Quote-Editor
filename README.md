# Music Concept — Atelier devis

Application statique en français, sans installation de dépendances. Lancez `npm start` puis ouvrez http://localhost:4173. Tests : `npm test`.

## Utilisation
1. Configurez les tarifs, effectifs, ratios et capacités dans Catalogue & critères.
2. Réglez les places par voiture, coût kilométrique, péages A/R, repas et acompte.
3. Collez la demande, analysez puis corrigez les informations extraites.
4. Confirmez un lieu et recherchez la distance routière, ou saisissez les kilomètres aller.
5. Relisez puis copiez/exportez le brouillon. Aucun envoi automatique.

L’analyse est heuristique et locale, sans modèle IA : elle reconnaît notamment les champs étiquetés, e-mails, téléphones français, dates françaises, participants et budgets. Elle ne comprend pas arbitrairement tous les mails. Les champs absents restent vides et toutes les extractions doivent être vérifiées. Le classement des projets utilise des mots-clés ; les contraintes de capacité et le budget produisent des alertes, pas une garantie de compatibilité.

## Calculs
Effectif = max(effectif minimum, plafond(participants / ratio)) si ratio défini.
Véhicules = max(minimum véhicules, plafond(effectif / places)).
Prestation = forfait + supplément par artiste × effectif + supplément par participant × participants.
Déplacements = km aller × 2 × véhicules × coût/km + péages A/R × véhicules + repas × artistes.
Acompte calculé sur le total et arrondi au centime. TVA non calculée : cette V1 doit être adaptée si la société est redevable de TVA. La mention fiscale est configurable, jamais présumée.
Les valeurs initiales de 3 places, 0,60 €/km et 30 % sont des hypothèses modifiables. Aucun prix commercial n’est inventé.

## Sources
Catalogue et descriptions synthétiques consultés le 13 septembre 2026 sur https://music-concept.fr/ ; Samba https://music-concept.fr/samba-experience/ ; Disco Fiesta https://music-concept.fr/disco-fiesta/ ; Cloclo https://music-concept.fr/cloclo/ . Samba : 1 coach et durée idéale 1h15–1h30 issus de l’exemple fourni, sans règle extrapolée d’encadrement. Les limites publiées de Samba divergent (2000/4000), donc aucune capacité maximum présumée.

## Données et itinéraires
Stockage localStorage dans le navigateur, sauvegarde/import JSON. Pas de compte, synchronisation ou stockage serveur. Ne convient pas à un poste partagé sans précautions. Seuls les lieux saisis sont envoyés à Nominatim/OpenStreetMap et au service de démonstration OSRM lors d’une recherche explicite. Ces services publics n’offrent pas de garantie de disponibilité : pour une utilisation commerciale soutenue, prévoir un fournisseur routier contractuel, un cache et un backend. La distance représente un aller entre le centre de Gretz-Armainvilliers et le lieu choisi, sans trafic, péages automatiques ni adresse de départ précise. Saisie manuelle disponible en secours.

## GitHub Pages
Le workflow teste et déploie à chaque push sur main. Dans Settings > Pages, choisir Source : GitHub Actions. URL attendue : https://toaster77music.github.io/MUSIC-CONCEPT-Quote-Editor/ . Le catalogue est public ; les demandes clients saisies localement ne sont pas publiées. Aucun secret ni demande réelle ne doit être ajouté au dépôt.

## Suite possible
Extraction IA côté serveur avec validation structurée, gestion multi-formules, tarif par paliers, disponibilité artistes, devis numéroté/PDF, historique de devis et comptes utilisateurs. Ne jamais placer une clé API dans le navigateur.

## Tarifs tribute (fournis par Music Concept)
10 formules : Cloclo (4), Disco Fiesta (1), Circus (2), Sonic Drift (3). Sélection de la formule dans le devis ; chaque tarif, composition, durée et effectif est modifiable dans le catalogue. Les effectifs Cloclo incluent le sosie (11/9/5/3).
Les tarifs artistiques sont HT hors VHR. Voyage et restauration sont calculés séparément ; l’hébergement est un montant global HT à saisir explicitement (0 si inutile ou pris en charge). Le total reste incomplet tant que l’hébergement ou la distance manque. Les conditions techniques sont reprises dans le mail.
Les sauvegardes locales antérieures reçoivent les formules automatiquement sans effacer les réglages : un ancien tarif personnalisé devient une formule supplémentaire conservée. L’import JSON accepte les anciennes sauvegardes et les formules de cette version.

## Devis multi-projets et actualisations
Cochez plusieurs projets et plusieurs formules. Le mode par défaut présente des options alternatives sans total additionné ; le mode « Prestations cumulées » additionne les prestations et leurs frais propres, sans mutualiser véhicules ni équipes. L’hébergement est configurable par option. Les anciennes sélections et sauvegardes sont migrées.
Le navigateur consulte version.json toutes les 30 secondes quand l’onglet est visible, ainsi qu’au retour sur l’onglet. À la publication d’une nouvelle version, il sauvegarde les données puis recharge après au moins 5 secondes sans saisie. Une erreur de sauvegarde empêche le rechargement. Hors ligne, la page ouverte reste utilisable. GitHub Actions génère la version et renouvelle les URLs des ressources à chaque déploiement.

## Construction progressive par blocs
Ajoutez un projet du catalogue ou un projet libre, sans limite applicative au nombre de blocs. Chaque bloc peut être dupliqué, déplacé ou retiré. Il conserve un instantané de sa configuration et ses propres tarifs/frais ; modifier le catalogue n’altère pas les blocs déjà construits. Changer de formule mémorise les réglages précédents du bloc pour les retrouver au retour sur cette formule.
Quatre lignes de présentation modifiables restent immédiatement sous chaque nom d’artiste. Les informations communes (contact, société, coordonnées, date, lieu, horaires, participants, contexte et contraintes) sont rassemblées une seule fois après les projets ; les cases d’affichage permettent de choisir leur présence. Les champs communs vides sont omis.
Les cases de chaque bloc contrôlent durée, composition, effectif, tarif, détail des frais, total, acompte, conditions et vidéos. Masquer un prix dans le texte ne change pas le calcul interne.
Voitures : nombre automatique ou saisi, coût/km et péages A/R propres au bloc. Camions : nombre × (location totale par camion + km aller × 2 × coût/km camion + péages A/R camion). Restauration : effectif × coût par artiste. Hébergement : montant global du bloc. Les camions ne réduisent pas automatiquement les voitures ; adapter le nombre si l’équipe voyage dans le camion. La location ne doit pas doubler les coûts déjà inclus dans le coût/km.
Les anciennes sélections sont migrées en blocs en conservant les paramètres et frais d’hébergement. Les quatre lignes préremplies synthétisent le catalogue déjà présent, et restent à personnaliser.

## Carburant et aller-retour
La distance aller reste saisie une seule fois ; l’interface affiche explicitement l’aller-retour (distance × 2) par véhicule. Chaque bloc peut choisir le forfait kilométrique ou le carburant estimé : km aller × 2 × véhicules × consommation L/100 km ÷ 100 × prix €/L. Le carburant remplace le forfait/km, il ne s’y ajoute pas. Consommations et prix sont saisis par l’utilisateur, sans récupération des prix à la pompe. Location et péages sont ajoutés séparément. Les péages A/R restent manuels : OSRM ne fournit pas de tarifs. Une future intégration tarifaire nécessitera un fournisseur et un backend protégeant sa clé.

## Présentation commerciale unique
Depuis le 14 septembre 2026, la présentation est un champ de texte multiligne unique dans le catalogue et dans chaque bloc du devis. Les 13 résumés proviennent des pages artistes liées dans le catalogue. Les anciens textes par défaut sont actualisés ; les descriptions personnalisées restent conservées. À l’ajout d’un bloc, le texte du catalogue est copié et reste éditable indépendamment dans le devis. Les quatre anciennes lignes personnalisées sont réunies dans ce champ, sans perte de contenu. Le choix de configuration ne remplace pas ce texte.
