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
