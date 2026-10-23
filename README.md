# Plages agronomiques — collecte et analyse des relectures

Plateforme **React + Tailwind CSS** (dossier `frontend/`) et **Node.js + Express + MongoDB**
(dossier `backend/`). Elle sert à **collecter, centraliser et faciliter l’analyse** des
relectures des plages agronomiques par culture, comme le demande le document de référence
« Plages agronomiques par culture : formulaire à remplir » (Meya Dorodoro) :
**9 cultures**, **5 paramètres**, **4 bornes par paramètre**, une **source obligatoire** par
valeur saisie, les statuts **PROVISIONAL / VALIDATED** et le **consentement de citation**.

---

## 0. Les adresses à connaître

| Mode | Adresse à ouvrir | Ce qui tourne |
|------|------------------|---------------|
| **Développement** (`npm run dev`) | **http://localhost:3000** | frontend React (Vite) + backend sur le port 4000 |
| **Production** (`npm start`) | **http://localhost:4000** | tout (interface compilée + API) sur un seul port |

Ports et base de données réglables dans le fichier **`.env`** à la racine :
`VITE_PORT` (frontend), `PORT` (backend), `MONGO_URI` (MongoDB).

> N’écrivez **jamais `0.0.0.0`** dans la barre d’adresse du navigateur.

---

## 1. Structure du projet

```
plages-agronomiques/            ← dossier principal
├── frontend/                   ← INTERFACE (React + Tailwind + Vite)
│   ├── index.html
│   ├── src/
│   │   ├── pages/              Accueil, Cultures, Guide, Formulaire, Récapitulatif, Analyse,
│   │   │                        Partenaires, PartenaireFormulaire
│   │   ├── components/         Header, Footer, Layout, Ui, Icons, form/*
│   │   ├── hooks/              apparition au défilement, compteurs, brouillon
│   │   ├── lib/api.js          appels à l’API
│   │   ├── assets/             photos locales : hero, 9 cultures, sonde,
│   │   │                        partenaires/ (8 photos du programme) + images.js
│   │   ├── index.css           Tailwind + styles de base
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── scripts/build-portable.mjs
│   ├── tailwind.config.js      palette, typographie, animations
│   ├── postcss.config.js
│   ├── vite.config.js          port 3000 + proxy /api vers 4000
│   ├── dist/                   interface compilée (production)
│   ├── dist-portable/          version « double-clic » sans serveur
│   └── package.json
│
├── backend/                    ← SERVEUR (Express + MongoDB)
│   ├── server/
│   │   ├── index.js            routes API + service du frontend compilé
│   │   ├── db.js               MongoDB (Mongoose) + repli JSON
│   │   ├── auth.js             session administrateur, limitation de débit
│   │   ├── notifier.js         notifications des relectures (journal, e-mail, WhatsApp)
│   │   ├── courriel.js         envoi des e-mails (Resend uniquement)
│   │   ├── partenaires.js      dossiers partenaires (base + notification)
│   │   ├── pdf.js              détection de Python + génération du PDF rempli
│   │   └── env.js              lecture du fichier .env
│   ├── shared/
│   │   ├── model.js            référentiel unique (cultures, paramètres, validation)
│   │   ├── partenaires.js      référentiel du formulaire partenaire + validation
│   │   └── csv.js              export / import CSV
│   ├── scripts/
│   │   ├── fill_pdf.py         remplissage du formulaire PDF d’origine
│   │   └── db-statut.mjs       vérification de la connexion MongoDB
│   ├── media/                  formulaire PDF d’origine
│   ├── data/                   données si MongoDB est absent (relectures.json)
│   └── package.json
│
├── scripts/
│   ├── dev.mjs                 lance frontend + backend (npm run dev)
│   ├── qa.py / axe.py          contrôles automatiques (facultatif)
├── .env / .env.example         configuration (ports, code admin, MongoDB, VOS COORDONNÉES)
├── DEMARRER-Windows.bat        production, double-clic (port 4000)
├── DEMARRER-DEV-Windows.bat    développement, double-clic (port 3000)
├── start.sh                    équivalent Mac / Linux
├── package.json                commandes communes aux deux dossiers
└── README.md
```

### Les photos du site

Toutes les images sont **locales** (aucune dépendance à Internet) et rangées dans
`frontend/src/assets/` :

| Dossier / fichier | Contenu | Où il apparaît |
|---|---|---|
| `hero.jpg` (+ `hero-880.jpg`) | agronome dans une parcelle de manioc | accueil (grande photo) |
| `cultures/` | 9 photos, une par culture, en 960 px et 480 px | accueil, page « Cultures & plages », guide, formulaire, récapitulatif |
| `sections/sonde-sol.jpg` | sonde d’humidité dans le sol | accueil, guide, page « Cultures », écran de connexion « Analyse » |

Pour remplacer une photo, il suffit d’écrire un fichier du même nom au même endroit
(garder les deux tailles : `nom.jpg` et `nom-480.jpg`), puis de relancer `npm run build`.
Le fichier `src/assets/images.js` centralise les chemins et les textes alternatifs
(accessibilité), et le composant `src/components/Photo.jsx` garantit le même cadre,
le même voile et la même légende sur toutes les pages.

Le référentiel (`model.js`) est **partagé** : il vit dans `backend/shared/` et le frontend
l’importe par l’alias `@shared` (configuré dans `vite.config.js`). Il n’existe donc qu’une
seule définition des 9 cultures et des 5 paramètres.

---

## 2. Démarrer en trois gestes (Windows)

1. Décompressez le dossier (clic droit → « Extraire tout »).
2. Double-cliquez sur **`DEMARRER-Windows.bat`**.
3. Votre navigateur s’ouvre sur **http://localhost:4000**.

La première fois, l’ordinateur installe les composants (1 à 2 minutes, connexion Internet).
Les fois suivantes, le site démarre en quelques secondes.

Pour **arrêter** : `Ctrl + C` dans la fenêtre noire, ou fermez cette fenêtre.

---

## 3. Mode développement — `npm run dev`

Une seule commande lance **les deux dossiers** :

```bash
cd plages-agronomiques
npm install          # UNIQUEMENT la première fois
npm run dev
```

Affichage attendu :

```
  +------------------------------------------------------------+
  |  Plages agronomiques - mode developpement                  |
  |  frontend/  ->  React + Tailwind                           |
  |  backend/   ->  Express + MongoDB                          |
  +------------------------------------------------------------+
   Frontend (React/Vite)  : http://localhost:3000   <- ouvrez cette adresse
   Backend  (API Express) : http://localhost:4000
   Base de donnees        : MongoDB « plages_agronomiques » (mongodb://127.0.0.1:27017/plages_agronomiques)
   Arret : Ctrl + C

[web]  VITE v5.4.21  ready in 217 ms
[web]  ➜  Local:   http://localhost:3000/
[api]  [db] MongoDB connecté — base « plages_agronomiques » sur 127.0.0.1:27017
```

**Ouvrez http://localhost:3000** (frontend). Les appels `/api` partent automatiquement vers
le backend (port 4000) : rien à configurer.

| Commande | Ce qu’elle fait |
|----------|-----------------|
| `npm run dev` | **frontend + backend** ensemble |
| `npm run dev:frontend` | frontend seul (port 3000) |
| `npm run dev:backend` | backend seul (port 4000) |
| `npm run build` | compile l’interface dans `frontend/dist/` |
| `npm start` | production : interface + API sur **http://localhost:4000** |
| `npm run build:portable` | version « double-clic » dans `frontend/dist-portable/` |
| `npm run db:statut` | vérifie la connexion MongoDB |

« Port déjà utilisé » → fermez l’autre terminal, ou changez `PORT` / `VITE_PORT` dans `.env`
(si 3000 est pris, Vite choisit automatiquement 3001, 3002… : lisez la ligne `Local:`).

---

## 4. Consulter le site sans rien installer

Double-cliquez sur **`frontend/dist-portable/index.html`** : tout le site React s’ouvre
dans le navigateur, sans serveur ni installation. Toutes les pages sont consultables et le
formulaire se remplit, mais **l’envoi d’une relecture nécessite le serveur** (un bandeau le
rappelle en haut de page, et le brouillon est conservé dans le navigateur).

---

## 5. Les pages du site

| Page | Adresse | Rôle |
|------|---------|------|
| Accueil | `/` | Présentation, objectif, étapes, les 9 cultures, appel aux agronomes |
| Cultures & plages | `/cultures` | Référentiel du document : 9 cultures, tableau 5 paramètres × 4 bornes, bloc EcoCrop, remarques |
| Guide de remplissage | `/guide` | Règles du document (case vide = inconnue, source obligatoire, idéal/toléré, statuts, salinité max, T° air ≠ T° sol), exemples, questions fréquentes |
| Formulaire | `/formulaire` | Saisie en 3 étapes : identité + consentement → cultures → vérification et envoi |
| Récapitulatif | `/recapitulatif/:id` | Confirmation, référence `PA-année-numéro`, impression, PDF rempli (si disponible) |
| Analyse | `/analyse` | Espace protégé : agronomes, valeurs validées, sources, couverture culture × paramètre, relectures reçues, export/import CSV, dossiers partenaires |
| Partenariat | `/partenaires` | Dossier de projet **AGRIKONNECT AFRICA** : problème, chaîne de valeur, versions V1→V5, module sol, principes, modèle économique, ce que nous ne ferons pas, feuille de route, formes de partenariat, questions fréquentes |
| Devenir partenaire | `/partenaires/rejoindre` | Formulaire dédié en **5 étapes** : identité → apport → domaines et années d’expérience → origine et zone d’action → précisions et consentement |

Le formulaire conserve un **brouillon** dans le navigateur : vous pouvez fermer la page et
revenir plus tard.

---

## 6. Accès à l’espace « Analyse »

- Code par défaut : **`agro2026`**
- À changer dans **`.env`** :

```
ADMIN_CODE=votre-nouveau-code
SECRET_SEL=une-longue-phrase-au-hasard
```

**Changez ces valeurs avant toute mise en ligne publique.** Ne diffusez pas le code aux
agronomes : les coordonnées personnelles y sont visibles.

---

## 6 bis. Où mettre MON e-mail et MON numéro de téléphone

**Un seul endroit : le fichier `.env`**, à la racine de `plages-agronomiques/`
(ouvrez-le avec le Bloc-notes). Cherchez le bloc « VOS COORDONNÉES » :

```bash
NOTIF_NOM=Équipe Plages agronomiques
NOTIF_EMAIL=votre-adresse@exemple.cd     ← VOTRE E-MAIL
NOTIF_WHATSAPP=+243810000000            ← VOTRE NUMÉRO (format +243…)
```

Puis relancez `npm run dev` (ou `npm start`).

### À quoi servent ces deux lignes

1. **Recevoir les notifications** : à chaque formulaire envoyé par un agronome, l’équipe reçoit
   un message avec la référence, le nom de l’agronome, son contact, les valeurs et les sources.
2. **Afficher vos coordonnées sur le site**, à trois endroits :
   - **pied de page** de toutes les pages (« Nous joindre » : e-mail cliquable + lien WhatsApp) ;
   - page **Guide de remplissage**, nouvelle carte « Nous joindre » ;
   - le lien WhatsApp est aussi proposé, message pré-rempli, dans l’espace **Analyse**.

Tant que ces lignes sont vides, le site affiche « adresse non renseignée » / « numéro non renseigné ».

### Envoi automatique des e-mails (indispensable pour recevoir vraiment le message)

La plateforme utilise **un seul fournisseur d’e-mails : Resend**. Il n’y a **aucun réglage
SMTP** à faire : ne cherchez pas `SMTP_HOST`, cette variable n’existe plus.

Le numéro et l’adresse seuls **journalisent** la notification (`backend/data/notifications.jsonl`)
et affichent vos coordonnées ; pour un **e-mail réellement envoyé**, complétez dans `.env` :

```bash
CONTACT_EMAIL=doroosee45@gmail.com          # qui reçoit les dossiers partenaires
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx          # votre clé Resend
MAIL_FROM="Omedev services <noreply@www-omedevservices.net>"
```

Marche à suivre, une seule fois :

1. Créez un compte gratuit sur **https://resend.com**.
2. Menu **API Keys** → **Create API Key** → copiez la clé (elle commence par `re_`).
3. Collez-la après `RESEND_API_KEY=` dans `.env`, **sans guillemets ni espace**.
4. Menu **Domains** → **Add Domain** : ajoutez le domaine utilisé dans `MAIL_FROM`
   et créez les enregistrements DNS indiqués. Sans domaine vérifié, Resend refuse l’envoi :
   pour tester immédiatement, mettez `MAIL_FROM="Omedev services <onboarding@resend.dev>"`.
5. Redémarrez (`npm run dev`) puis vérifiez dans **Analyse → « Envoyer un e-mail de test »**.

### Vérifier que tout fonctionne

1. Page **Analyse** (code `agro2026`) → bloc « Notifications des formulaires reçus » :
   il affiche votre e-mail, votre numéro, et si l’envoi automatique est actif.
2. Bouton **« Envoyer un e-mail de test »** : vous devez recevoir un message en quelques secondes.
3. Envoyez ensuite un vrai formulaire : la notification apparaît en haut de la liste, avec un
   lien **« ouvrir WhatsApp »** qui pré-remplit le message vers votre numéro.

### WhatsApp : pourquoi un lien et pas un envoi automatique ?

L’envoi automatique de messages WhatsApp exige un compte **WhatsApp Business API** (payant).
Sans cela, la plateforme prépare le message et vous l’ouvrez en un clic : le numéro et le texte
sont déjà remplis dans WhatsApp. Le journal local conserve, lui, **toutes** les notifications,
même sans e-mail ni WhatsApp configurés.

---

## 6 ter. Le programme « Devenir partenaire » (AGRIKONNECT AFRICA)

Le site contient un **second formulaire**, indépendant des relectures : il sert à recevoir les
candidatures de partenaires (investisseurs, coopératives, entreprises, institutions, laboratoires,
agronomes, partenaires technologiques).

### Les deux pages

| Page | Adresse | Contenu |
|------|---------|---------|
| Dossier de projet | `/partenaires` | Tout le cahier des charges résumé pour un partenaire : le problème par acteur, la chaîne de valeur, les cinq versions (V1 à V5) avec leurs livrables et durées, le module « sol et cultures » avec les 5 niveaux de fiabilité, les 9 principes, le modèle économique, ce que nous ne ferons pas, la feuille de route, les 4 formes de partenariat, 8 questions fréquentes |
| Candidature | `/partenaires/rejoindre` | Formulaire en 5 étapes, avec brouillon automatique et explication à chaque étape |

### Les 5 étapes du formulaire

1. **Identité** — prénom, nom, organisation, fonction, type de partie prenante (8 choix), e-mail, téléphone/WhatsApp.
2. **Apport** — nature de l'apport (8 choix : financement, expertise, terrain, matériel, institutionnel, commercial, formation, visibilité), fourchette ou montant, devise, disponibilité, précisions.
3. **Domaines** — 14 domaines ; pour chacun coché : **nombre d'années d'expérience** et niveau (découverte, pratique, confirmé, expert).
4. **Localisation** — pays d'origine (23 pays), province de la RDC (26), ville/territoire, zone d'action, portée, couverture.
5. **Autres** — message libre, canal de découverte, consentement de contact (obligatoire), accord de citation (facultatif), préférence d'appel.

Chaque dossier reçoit une référence **`PT-année-numéro`** (ex. `PT-2026-0001`), il est enregistré
en base, et un **e-mail part immédiatement à l'équipe** (voir ci-dessous). L'écran de confirmation
affiche la référence, un récapitulatif imprimable (PDF) et les coordonnées de contact.

### Où sont les dossiers ?

- MongoDB : collection **`partenaires`** (repli fichier `backend/data/partenaires.json` si MongoDB est arrêté).
- Espace **Analyse** (`/analyse`, code `agro2026`) : bloc « Dossiers partenaires » avec la liste,
  le changement de statut (`NOUVEAU`, `EN ECHANGE`, `QUALIFIE`, `ECARTE`), l'export **CSV**
  et un bouton **« Envoyer un e-mail de test »**.
- Journal local : `backend/data/partenaires-notifications.jsonl`.

### Recevoir les dossiers par e-mail (Resend)

Un seul fournisseur : **Resend** (aucun SMTP).

```
# dans .env
CONTACT_EMAIL=doroosee45@gmail.com
RESEND_API_KEY=re_...votre_cle...
MAIL_FROM="Omedev services <noreply@www-omedevservices.net>"
```

1. Créez un compte sur https://resend.com (offre gratuite).
2. **API Keys → Create API Key**, copiez la clé (elle commence par `re_`).
3. Collez-la après `RESEND_API_KEY=` dans `.env`, puis relancez `npm run dev`.
4. Dans Resend, **Domains → Add Domain** : ajoutez les enregistrements DNS indiqués pour
   `www-omedevservices.net`. Tant que le domaine n'est pas vérifié, l'envoi est refusé ;
   pour tester tout de suite, mettez `MAIL_FROM="Omedev services <onboarding@resend.dev>"`.
5. Vérifiez dans **Analyse → Dossiers partenaires → « Envoyer un e-mail de test »**.

Le dossier est **toujours enregistré**, même si l'e-mail échoue : l'écran de confirmation indique
alors « e-mail non parti » avec la raison, et le dossier reste visible dans l'espace Analyse.

Les notifications de **relecture** utilisent aussi Resend en priorité ; elles gardent leur propre
adresse `NOTIF_EMAIL`, et le lien WhatsApp reste disponible.

### Adresses à connaître

| Élément | Valeur |
|---|---|
| Page partenaires | `http://localhost:3000/partenaires` |
| Formulaire partenaire | `http://localhost:3000/partenaires/rejoindre` |
| API publique | `GET /api/partenaires/config`, `POST /api/partenaires` |
| API réservée | `GET /api/admin/partenaires`, `PATCH /api/admin/partenaires/:id`, `GET /api/admin/partenaires.csv`, `POST /api/admin/partenaires/test-email` |

---

## 7. MongoDB : les relectures vont directement dans la base

**Par défaut, la plateforme écrit dans MongoDB**, base `plages_agronomiques`
(`mongodb://127.0.0.1:27017/plages_agronomiques`, réglable dans `.env`).

### Vérifier la connexion à tout moment

```bash
npm run db:statut
```

```
  ✔ MongoDB répond.
    Base de données   : plages_agronomiques
    Version du serveur: 7.0.14
    Relectures        : 12
```

### Installer MongoDB une seule fois

| Système | Marche à suivre |
|---------|-----------------|
| Windows | Télécharger **MongoDB Community Server** (mongodb.com/try/download/community), installer en gardant « Install MongoDB as a Service » : il démarrera à chaque allumage |
| macOS | `brew tap mongodb/brew` puis `brew install mongodb-community` et `brew services start mongodb-community` |
| Linux | dépôt officiel MongoDB puis `sudo apt install mongodb-org` et `sudo systemctl start mongod` |

### Utiliser MongoDB Atlas (en ligne)

1. Créez un cluster gratuit sur **mongodb.com/atlas**.
2. **Connect → Drivers** : copiez la chaîne `mongodb+srv://…`.
3. Dans `.env` : `MONGO_URI=mongodb+srv://utilisateur:motdepasse@cluster0.xxxxx.mongodb.net/plages_agronomiques`
4. Relancez `npm run dev`.

### Exiger MongoDB (recommandé en production)

```
MONGO_REQUIRED=1
```

Le serveur refuse alors de démarrer si la base est injoignable : aucune relecture ne peut
être enregistrée par erreur dans un fichier local. Avec `0`, la plateforme reste utilisable
hors ligne et bascule sur `backend/data/relectures.json` en l’indiquant clairement (terminal
et page « Analyse »).

### Vérifier ce qui est réellement en base

- Page **Analyse** : ligne « Stockage : **MongoDB — base plages_agronomiques** · N relecture(s) en base ».
- `http://localhost:4000/api/health` → `"stockage": "mongo"`, la base et le nombre de documents.
- Sauvegarde : `mongodump --db plages_agronomiques --out sauvegarde/`
  Restauration : `mongorestore --db plages_agronomiques sauvegarde/plages_agronomiques`

---

## 8. Récapitulatif en PDF (facultatif)

Le bouton « Télécharger le formulaire PDF rempli » utilise `backend/media/Plages_agronomiques_formulaire.pdf`
et `backend/scripts/fill_pdf.py`, qui exige **Python + PyMuPDF** (`pip install pymupdf`).
Si ces outils manquent, le bouton est signalé comme indisponible : **les données sont
enregistrées** et la page reste imprimable.

---

## 9. API du backend

| Méthode | Route | Accès | Rôle |
|---------|-------|-------|------|
| GET | `/api/health` | public | état du serveur, du stockage, de la base, du PDF |
| GET | `/api/config` | public | cultures, paramètres, bornes, statuts, limites |
| POST | `/api/relectures` | public | enregistrer une relecture (validation complète) |
| GET | `/api/resume-public` | public | agrégats anonymes (accueil) |
| GET | `/api/relectures` | admin | liste filtrable des relectures |
| GET | `/api/relectures/:id` | admin ou jeton | détail d’une relecture |
| DELETE | `/api/relectures/:id` | admin | suppression |
| GET | `/api/relectures/:id/pdf` | admin ou jeton | formulaire PDF rempli |
| GET | `/api/stats` | admin | statistiques consolidées |
| GET | `/api/export.csv` | admin | export compatible tableur |
| POST | `/api/import` | admin | import CSV |
| GET | `/api/modele.csv` | public | modèle CSV vierge |
| POST | `/api/admin/connexion` / `deconnexion` | — | session administrateur (cookie HttpOnly) |
| GET | `/api/admin/notifications` | admin | réglages + 30 dernières notifications |
| POST | `/api/admin/notifications/test` | admin | envoie un e-mail de test à `NOTIF_EMAIL` |

---

## 10. Conformité au document de référence

- **9 cultures** : Manioc, Maïs, Haricot, Arachide, Riz, Banane plantain, Palmier à huile,
  Café robusta, Cacao — nom scientifique à confirmer, zone Équateur / Bandundu / les deux.
- **5 paramètres** : pH du sol, température de l’air, humidité volumique du sol, salinité
  maximale (EC), profondeur racinaire.
- **4 bornes** : idéal min, idéal max, toléré min, toléré max — plage idéale = ce que le
  logiciel utilise, plage tolérée = limites de survie (facultative).
- **Source obligatoire** dès qu’une valeur est saisie ; **case vide = valeur inconnue**.
- **Bloc EcoCrop (FAO), provisoire** : pH et température idéaux/tolérés, adresse de la fiche
  GAEZ consultée, date de consultation.
- **Statuts PROVISIONAL / VALIDATED** ; nom et date cités **uniquement** avec le consentement.
- **Salinité** : seule la valeur maximale est utilisée.
- **Température de l’air ≠ température du sol** : rappel dans la fiche et champ « remarques ».
- Retour par **e-mail ou WhatsApp**, **appel** possible en cas de doute.
- Aucune fonctionnalité ajoutée qui ne soit justifiée par le document.

---

## 11. Qualité

- **Responsive** : contrôlé de 360 px à 1920 px (téléphone, tablette, ordinateur) — aucun
  débordement horizontal ; les tableaux larges défilent horizontalement et restent
  utilisables au clavier.
- **Accessibilité** : navigation clavier, lien « Aller au contenu principal », libellés
  associés, erreurs annoncées, un seul titre principal par page — 0 violation axe-core
  (WCAG 2.1 A/AA) sur les 7 pages, à 1440 px et à 390 px, y compris le récapitulatif et le
  tableau de bord connecté.
- **Animations** : apparition au défilement, transitions de page, survols discrets —
  uniquement `transform` et `opacity`, désactivées si l’appareil demande de réduire les
  animations.
- **Données** : export CSV complet (une ligne par culture et par paramètre) et ré-import du
  même fichier avec détection des doublons.
- **Détail complet des contrôles** : voir `RAPPORT-DE-LIVRAISON.md` (anomalies trouvées,
  corrections appliquées, tests réellement exécutés, points non vérifiables).

---

## 12. Besoin d’aide ?

- « npm : command not found » → installez Node.js (version LTS) depuis nodejs.org.
- « vite : command not found » ou « cannot find module » → vous avez oublié `npm install`.
- Le bouton PDF est grisé → installez Python + PyMuPDF (facultatif), le reste fonctionne.
- La page Analyse ne se connecte pas → vérifiez que le backend tourne (ligne `[api]`).
- Les données ont disparu → vérifiez `npm run db:statut` (base) ou `backend/data/relectures.json`.
