# Rapport de livraison — Plages agronomiques

**Projet :** plateforme de collecte, de centralisation et d’analyse des relectures des plages
agronomiques par culture (Équateur / Bandundu, RDC) + programme partenaires AGRIKONNECT AFRICA.
**Version livrée :** 2.0.0 — **date du rapport :** 23 octobre 2026.
**Contenu :** projet complet corrigé (`frontend/` + `backend/`), version portable déjà compilée,
ce rapport, et les instructions d’installation plus bas.

Ce rapport est volontairement transparent : il distingue **ce qui a été corrigé et vérifié**,
**ce qui a été vérifié sans correction nécessaire**, et **ce qui n’a pas pu être vérifié**.

---

## 1. Ce qui a été examiné

Architecture lue avant toute modification : application React + Tailwind (Vite) dans
`frontend/`, API Node/Express + MongoDB dans `backend/`, référentiel partagé
`backend/shared/model.js`, stockage MongoDB avec repli fichier JSON, génération PDF Python
(`backend/scripts/fill_pdf.py`), envoi d’e-mails par l’API Resend (`backend/server/courriel.js`).

Pages auditées : `/`, `/cultures`, `/guide`, `/formulaire`, `/recapitulatif/:id`, `/analyse`
(connexion puis tableau de bord), `/partenaires`, `/partenaires/rejoindre`, page 404.
Les parcours testés sont listés au §4.

---

## 2. Anomalies détectées **et corrigées** dans cette phase

### 2.1 Affichage et responsive

| # | Anomalie constatée | Correction appliquée | Vérification |
|---|---|---|---|
| 1 | **Débordement horizontal de 135 px à 820 px sur toutes les pages** : le menu passait en version « ordinateur » dès 768 px alors qu’il lui faut environ 660 px à côté du logo et du bouton. | `frontend/src/components/Header.jsx` : menu principal en `lg:` (1024 px) au lieu de `md:`, bouton hamburger et panneau mobile en `lg:hidden`. | Contrôlé à 360, 390, 600, 768, 820, 1024, 1180, 1280, 1440 et 1920 px : plus aucun débordement. |
| 2 | **Débordement de 12 px à 360 px sur `/partenaires`** : le tableau des offres imposait sa largeur minimale à la colonne de grille. | `Partenaires.jsx` : `min-w-0` sur les deux colonnes + conteneur de tableau en `overflow-x-auto` avec largeur minimale explicite. | Pages repassées à 360 px : largeur de page = largeur d’écran. |
| 3 | **Bloc « Brouillon conservé dans ce navigateur / Effacer » débordant de son cadre à 390 px** (`/partenaires/rejoindre`). | Ligne transformée en conteneur `flex-wrap` avec marges internes sur le bouton. | Capture et mesure à 390 px : contenu contenu dans le cadre. |
| 4 | Photo d’en-tête du formulaire de relecture trop petite et d’arrondi différent du reste du site (208 px, `rounded-xl`). | `Formulaire.jsx` : 240 px, centrée verticalement, arrondi standard du composant `Photo`. | Contrôle visuel à 1440 px. |
| 5 | **Lisibilité insuffisante** des textes secondaires de la section sombre « Module transversal » (texte crème à 60–70 % d’opacité sur photo). | `Partenaires.jsx` : voile plus dense sur la photo (`opacity-25`, dégradé `to-vert-950/94`) et opacités des textes remontées (0,60→0,80 ; 0,65→0,80 ; 0,70→0,85). | Contrôle visuel + axe-core (contraste) : 0 violation. |

### 2.2 Accessibilité et sémantique

| # | Anomalie constatée | Correction appliquée | Vérification |
|---|---|---|---|
| 6 | **`/guide` n’avait aucun `<h1>`** (le composant `TitreSection` ne produisait qu’un `h2`). | `Ui.jsx` : nouvelle propriété `niveau` (1 → `h1`) ; `Guide.jsx` : `niveau={1}`. | Audit : exactement 1 `h1` par page sur les 8 routes. |
| 7 | **Tableau de bord `/analyse` sans `<h1>` une fois connecté** (le `h1` existait seulement sur l’écran de connexion). | `Analyse.jsx` : `niveau={1}` sur le titre du tableau de bord. | Mesure en session administrateur : 1 `h1` (« Analyse des relectures »). |
| 8 | **Tableaux à défilement horizontal non utilisables au clavier** — violation axe-core sérieuse `scrollable-region-focusable`, visible à 390 px sur `/cultures` (9 tableaux), `/guide`, `/partenaires`. | `role="region"` + `aria-label` explicite + `tabIndex={0}` sur les 7 conteneurs de tableaux (Cultures, Guide, Récapitulatif, Analyse ×3, Partenaires). | axe-core WCAG 2.1 A/AA : 0 violation à 390 px **et** à 1440 px sur les 7 routes (+ récapitulatif, + tableau de bord connecté). |

### 2.3 Comportement et navigation

| # | Anomalie constatée | Correction appliquée | Vérification |
|---|---|---|---|
| 9 | **Aucune remise en haut de page au changement de page** : depuis l’accueil défilé à 3 000 px, le lien « Guide de remplissage » ouvrait le guide au milieu. | `Layout.jsx` : retour en haut à chaque changement de route ; les ancres (`#culture`) sont gérées avec deux relances pour tenir compte du chargement différé des images. | Mesure : `scrollY = 0` après navigation. |
| 10 | **Lien profond erroné** : `/cultures#mais` depuis l’accueil atterrissait 2 600 px trop bas (position calculée avant le chargement des images). | Même correction que #9 + `scroll-mt` des fiches cultures. | Mesure : haut de la fiche « Maïs » à 92 px du haut, sous l’en-tête fixe. |
| 11 | **`/formulaire?culture=…` ne défilait jamais jusqu’à la fiche** promise (« la fiche s’ouvrira automatiquement à l’étape suivante ») : l’effet ne se rejouait pas au changement d’étape. | `Formulaire.jsx` : effet dépendant de l’étape, défilement doux sauf si l’appareil demande de réduire les animations. | Test `?culture=palmier` : fiche ouverte, positionnée à 96 px. |
| 12 | **Titres d’onglet génériques** sur `/partenaires`, `/partenaires/rejoindre` et `/recapitulatif/:id` (le `:id` ne correspondait à aucune entrée). | `Layout.jsx` : table de titres complétée + correspondance par préfixe. | Titres relevés sur chaque route. |
| 13 | **Version portable (`file://`) : deux erreurs console** `ERR_FILE_NOT_FOUND` à chaque ouverture (appels API sans serveur). | `lib/api.js` : garde hors ligne — aucune requête, message clair « Version hors ligne : l’envoi nécessite le serveur… ». | Version portable rejouée : 0 erreur console. |

### 2.4 Contenu et cohérence

| # | Anomalie constatée | Correction appliquée | Vérification |
|---|---|---|---|
| 14 | Mention « étudiant en génie logiciel » dans la lettre d’accueil, la signature et le pied de page. | Profil professionnel demandé : **« ingénieur en informatique, spécialisé en développement logiciel, développeur Full Stack »** (`Accueil.jsx`, `Footer.jsx`). Le reste de la lettre est inchangé, aucun diplôme ni expérience inventé. | Recherche plein texte : plus aucune occurrence de « étudiant ». |
| 15 | Texte de titre **dupliqué dans le code** de `/cultures` (un second bloc `TitreSection` masqué en `hidden`, avec le même contenu). | Bloc mort supprimé, import devenu inutile retiré. | Un seul titre rendu, à toutes les largeurs. |

---

## 3. Points contrôlés **sans anomalie** (donc laissés tels quels)

- **Animations** : apparition au défilement (`Reveal`/`useReveal`), transition de page,
  survols de boutons, cartes et images — uniquement `transform` et `opacity` ; la règle
  `@media (prefers-reduced-motion: reduce)` neutralise animations et transitions, et les
  défilements déclenchés en JavaScript respectent ce réglage.
- **Images** : 118 images mesurées après défilement complet, à 390 px et 1440 px — **toutes
  chargées**. Les « images manquantes » signalées par un contrôle automatique étaient un faux
  positif (chargement différé `loading="lazy"` : l’image n’est pas encore demandée avant
  d’arriver à l’écran).
- **Routes et liens** : toutes les cibles `Link` correspondent à une route déclarée dans
  `App.jsx` ; aucun `href="#"` ; tous les liens externes portent `rel="noreferrer"` ; la page
  404 s’affiche pour toute route inconnue.
- **Console** : aucune erreur ni avertissement sur les 9 routes. Seule exception attendue : un
  lien `/recapitulatif/…` **sans jeton** provoque deux réponses HTTP 401 (refus normal du
  serveur) que le navigateur journalise — la page affiche correctement « Récapitulatif
  indisponible ».
- **Composants** : pas de doublon de composant ni de CSS contradictoire détecté ; les classes
  mortes trouvées (bloc masqué de `/cultures`) ont été retirées.

---

## 4. Tests réellement exécutés et résultats

Outils : build Vite, `node --check` sur les fichiers serveur, requêtes HTTP réelles sur l’API,
et navigateur automatisé (Chromium via puppeteer) + moteur d’accessibilité axe-core.

| Test | Résultat |
|---|---|
| `npm run build` | ✅ réussi (CSS 58,5 ko — JS 385 ko, 111 ko gzip) |
| `npm run build:portable` | ✅ réussi (`frontend/dist-portable/index.html`) |
| Débordement horizontal : 8 routes × 10 largeurs (360 → 1920 px) | ✅ aucun débordement, aucun élément hors cadre non rogné |
| Un seul `h1` par page (8 routes) | ✅ |
| axe-core WCAG 2.1 A/AA — 7 routes à 1440 px | ✅ 0 violation |
| axe-core WCAG 2.1 A/AA — 7 routes à 390 px | ✅ 0 violation |
| axe-core — récapitulatif (1440 px et 390 px) | ✅ 0 violation |
| axe-core — tableau de bord connecté | ✅ 0 violation |
| Console/JS — 9 routes | ✅ aucune erreur, aucun avertissement |
| Parcours relecture complet : identité → cultures → vérification → envoi | ✅ référence `PA-2026-0001`, récapitulatif affiché, 0 erreur JS |
| Téléchargement du récapitulatif PDF depuis ce dossier | ✅ `application/pdf`, 10 pages, 265 ko |
| Envoi d’un formulaire vide (contrôle d’erreur) | ✅ message clair : « Le formulaire est vide : renseignez au moins une valeur ou une remarque… » |
| Export CSV (session administrateur) | ✅ 200, 10 222 o, séparateur `;`, BOM UTF-8 pour Excel |
| Modèle CSV | ✅ 200, 9 034 o |
| Import CSV | ✅ 200 après remplissage d’une ligne (`importees: 1`) ; fichier modèle vide refusé avec message explicite |
| Statistiques et tableau de bord | ✅ 8 panneaux affichés, KPI cohérents |
| Parcours partenaire en 5 étapes | ✅ référence `PT-2026-0001`, message honnête « e-mail non parti (`resend_non_configure`) » |
| Espace administrateur : connexion, dossiers partenaires, changement de statut | ✅ 200 |
| Version portable (`file://`) : navigation 4 pages, images, bandeau hors ligne | ✅ 13/13 images, 0 erreur console |
| API `GET /api/health` | ✅ MongoDB connecté, fournisseur d’e-mail = `resend` |

Les données de test créées pendant ces contrôles (relectures, dossier partenaire, journaux)
ont été **supprimées** : le projet est livré avec une base vide, la première référence
attribuée sera `PA-2026-0001` / `PT-2026-0001`.

---

## 5. Ce qui n’a **pas** pu être vérifié (à savoir avant de mettre en ligne)

1. **Envoi réel d’un e-mail.** La clé `RESEND_API_KEY` est vide dans `.env` : aucun message ne
   peut partir. La chaîne a été validée jusqu’au bout avec une fausse clé — Resend répond
   bien `401 API key is invalid`, preuve que la requête part correctement. Il reste à créer la
   clé chez Resend **et** à vérifier le domaine `www-omedevservices.net` chez Resend
   (procédure en 5 étapes au §6 ter du `README.md`).
2. **Aucune suite de tests automatisés ni lint/typecheck** n’est configurée dans le projet
   (`frontend/package.json` ne contient que `dev`, `build`, `build:portable`, `preview`).
   Les contrôles ci-dessus ont donc été exécutés avec des scripts externes au projet (non
   livrés dans l’archive). Rien n’a été « ajouté » au projet, conformément à la consigne de
   ne pas ajouter de fonctionnalité non demandée.
3. **Navigateurs** : tous les contrôles ont été faits sur Chromium. Safari, Firefox et les
   navigateurs mobiles réels n’ont pas pu être testés dans l’environnement de travail.
4. **Rendu du PDF page à page** : le fichier est généré et s’ouvre (10 pages), mais la mise en
   page du document rempli n’a été vérifiée que par son ouverture et son en-tête.
5. **MongoDB** doit être installé et démarré sur la machine. Sans base, l’application bascule
   sur un stockage fichier (`backend/data/`) : c’est prévu, mais ce mode n’a pas été rejoué
   intégralement dans cette phase.
6. **Fenêtres natives** : « Effacer le brouillon » utilise la confirmation standard du
   navigateur (choix existant, non modifié).

---

## 6. Installer et lancer

### A. Le plus simple (Windows)

1. Décompressez l’archive (clic droit → **Extraire tout**). Ne lancez rien depuis l’intérieur
   du fichier ZIP.
2. Double-cliquez sur **`DEMARRER-Windows.bat`**.
   *La première fois seulement :* une fenêtre noire installe les composants (1 à 2 minutes,
   connexion Internet requise), puis le site s’ouvre.
3. Le navigateur s’affiche sur **http://localhost:4000**. Pour arrêter : `Ctrl + C` dans la
   fenêtre noire, ou fermez-la.

### B. Mac / Linux

1. Ouvrez un terminal dans le dossier du projet.
2. La première fois : `chmod +x start.sh` puis `./start.sh`.
3. Le navigateur s’affiche sur **http://localhost:4000**.

### C. Pour travailler sur le code (mode développement)

```bash
npm install      # la première fois seulement
npm run dev      # site : http://localhost:3000 — API : http://localhost:4000
```
N’ouvrez jamais une adresse `0.0.0.0` dans le navigateur : utilisez `localhost` (comme
indiqué dans le terminal).

### D. Consulter le site sans rien installer

Double-cliquez sur **`frontend/dist-portable/index.html`** (déjà compilé dans l’archive) : tout
le site est consultable, le formulaire se remplit et le brouillon est conservé dans le
navigateur. L’**envoi** d’une relecture nécessite le serveur — un bandeau le rappelle en haut
de page.

### E. Mise en service de l’envoi d’e-mails (Resend)

1. Créez un compte sur resend.com et une clé API (`re_…`).
2. Vérifiez le domaine expéditeur `www-omedevservices.net` chez Resend.
3. Dans `.env`, renseignez `RESEND_API_KEY=re_…` (et `MAIL_FROM` si besoin).
4. Redémarrez le serveur (`npm run dev` ou le fichier `.bat`).
5. Vérifiez dans **Analyse → Notifications** que l’état indique « envoi automatique actif ».

> Le fichier `.env` de cette archive ne contient **aucun secret réel** ; `.env.example` liste
> toutes les variables attendues.

---

## 7. Contenu de l’archive

```
plages-agronomiques/
├── RAPPORT-DE-LIVRAISON.md      ← ce rapport
├── README.md                    ← guide complet (installation, pages, API, dépannage)
├── package.json                 ← commandes : dev, build, build:portable, start, db:statut
├── .env.example                 ← toutes les variables (aucun secret)
├── DEMARRER-Windows.bat / DEMARRER-DEV-Windows.bat / start.sh
├── scripts/dev.mjs
├── frontend/                    ← React + Tailwind
│   ├── src/ (pages, composants, styles, animations, images)
│   ├── dist-portable/           ← version compilée pour double-clic (sans serveur)
│   └── scripts/build-portable.mjs
└── backend/                     ← Express + MongoDB (+ repli JSON), PDF, e-mails
    ├── server/ (index, db, auth, notifier, courriel, partenaires, pdf)
    ├── shared/ (model, csv, partenaires)
    ├── scripts/ (db-statut.mjs, fill_pdf.py)
    ├── media/ (formulaire PDF de référence)
    └── data/ (vide — les données vont dans MongoDB)
```

**Non inclus volontairement :** `node_modules/` (réinstallés par `npm install`),
`frontend/dist/` (reconstruit automatiquement par les lanceurs), journaux, fichiers
temporaires et le fichier `.env` réel (secrets). L’archive a été contrôlée après création
(`unzip -t`, aucune erreur d’intégrité).
