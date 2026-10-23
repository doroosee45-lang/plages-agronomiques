import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';
import Photo from '../components/Photo.jsx';
import { TitreSection, Encadre, Etiquette } from '../components/Ui.jsx';
import { IMAGES_PARTENAIRES as P, ALT_PARTENAIRES as ALT } from '../assets/images.js';
import { api } from '../lib/api.js';
import {
  IconeFleche, IconeCible, IconeGraphique, IconeBouclier, IconeFeuille,
  IconeOrdinateur, IconeTelephone, IconeEnveloppe, IconeCheck, IconeInfo,
  IconeArchive, IconeLoupe, IconeLien, IconePlus, IconeMoins, IconeGoutte
} from '../components/Icons.jsx';

/* -------------------------------------------------------------------------
   Données de la page — toutes issues du cahier des charges AGRIKONNECT
   AFRICA v2.0. Aucun chiffre non sourcé n'est affiché.
   ------------------------------------------------------------------------- */

const ACTEURS = [
  {
    icone: IconeFeuille,
    titre: 'Producteurs',
    maux: ['Faible visibilité', 'Peu d’acheteurs identifiés', 'Capacité de production non documentée', 'Accès limité au financement et au conseil']
  },
  {
    icone: IconeArchive,
    titre: 'Coopératives',
    maux: ['Membres difficiles à gérer', 'Aucune donnée consolidée', 'Capacité réelle invisible', 'Difficulté à trouver des marchés']
  },
  {
    icone: IconeLoupe,
    titre: 'Acheteurs',
    maux: ['Producteurs fiables introuvables', 'Volumes inconnus', 'Zones de production floues', 'Qualité non documentée']
  },
  {
    icone: IconeGraphique,
    titre: 'Investisseurs',
    maux: ['Projets non standardisés', 'Documentation dispersée', 'Aucune visibilité terrain', 'Risque difficile à évaluer']
  },
  {
    icone: IconeCible,
    titre: 'Institutions',
    maux: ['Données fragmentées', 'Pas de tableau de bord consolidé', 'Politiques publiques à l’aveugle', 'Suivi des programmes coûteux']
  }
];

const CHAINE = [
  { titre: 'Un agriculteur', texte: 'Une personne, un champ, un savoir-faire.' },
  { titre: 'Une identité numérique', texte: 'Profil professionnel vérifiable, partageable, avec QR code.' },
  { titre: 'Une exploitation', texte: 'Parcelles géolocalisées, cultures, historique cultural.' },
  { titre: 'Des données', texte: 'Production déclarée, sol, prix, météo — avec leur provenance.' },
  { titre: 'De la visibilité', texte: 'Un mini-site public, une carte agricole, des contacts qualifiés.' },
  { titre: 'Des opportunités', texte: 'Acheteurs, services, conseil, financement, partenaires.' }
];

const VERSIONS = [
  {
    code: 'V1', nom: 'AGRIKONNECT FARM', image: P.identite, alt: ALT.identite, etiquette: 'Identité agricole',
    promesse: 'Donner une identité numérique à l’agriculture.',
    texte: 'Un producteur ou une coopérative crée une présence agricole professionnelle : compte, exploitation, parcelles, productions, profil public avec QR code, carte agricole, vérification par niveaux.',
    points: ['Inscription en étapes, OTP par SMS, vérification e-mail', 'Profil public avec partage WhatsApp et QR code', 'Parcelles GPS et historique cultural', 'Vérification par critères, jamais par score opaque'],
    duree: '4 à 6 mois'
  },
  {
    code: 'V2', nom: 'AGRIKONNECT MARKET', image: P.marche, alt: ALT.marche, etiquette: 'Marché B2B',
    promesse: 'Transformer la visibilité en opportunités commerciales.',
    texte: 'Annonces de récolte, demandes d’achat, mise en relation explicable, commandes tracées, messagerie et facturation. Aucun paiement n’est opéré par la plateforme.',
    points: ['Annonces et recherches avancées', 'Mise en relation qui affiche ses critères', 'Commandes avec machine à états auditée', 'Agrégation des disponibilités des coopératives'],
    duree: '5 à 7 mois'
  },
  {
    code: 'V3', nom: 'AGRIKONNECT INTELLIGENCE', image: P.carte, alt: ALT.carte, etiquette: 'Données et IA',
    promesse: 'Ajouter l’intelligence agricole, les données et la traçabilité.',
    texte: 'Fonctionnement hors connexion, prix de marché datés et sourcés, météo, lots de récolte traçables, capteurs et premiers modèles — toujours avec niveau de confiance et avertissement.',
    points: ['Synchronisation incrémentale par curseur', 'Assistant et analyse d’image encadrés', 'Prix et météo avec source et date', 'Traçabilité AK-PAYS-ANNÉE-SÉQUENCE'],
    duree: '8 à 12 mois'
  },
  {
    code: 'V4', nom: 'AGRIKONNECT INVEST', image: P.cooperative, alt: ALT.cooperative, etiquette: 'Projets et partenaires',
    promesse: 'Connecter les projets agricoles aux partenaires et aux capitaux.',
    texte: 'Fiches projets standardisées, data room avec accès contrôlé, due diligence par listes de contrôle, reporting d’impact. La plateforme met en relation, elle ne collecte pas de fonds.',
    points: ['Projets documentés, champs déclarés et vérifiés séparés', 'Accès aux documents par autorisation et journalisé', 'Aucune activité financière réglementée', 'Indicateurs d’impact fondés sur des données collectées'],
    duree: '6 à 9 mois'
  },
  {
    code: 'V5', nom: 'AGRIKONNECT GLOBAL', image: P.formation, alt: ALT.formation, etiquette: 'Afrique et international',
    promesse: 'Connecter l’agriculture africaine au monde.',
    texte: 'Multi-pays par configuration (devises, langues, découpage administratif), commerce international, API versionnée et jeux de données agrégés et anonymisés.',
    points: ['Ouverture d’un pays sans réécrire le métier', 'Workflow export documenté', 'API /api/v1 avec clés et quotas', 'Agrégation protégeant la ré-identification'],
    duree: 'En continu, pays par pays'
  }
];

const MOTEURS = [
  { icone: IconeGoutte, titre: 'Soil Engine', texte: 'Caractériser l’état du sol : profil par profondeur, provenance de chaque valeur, niveau de confiance.' },
  { icone: IconeFeuille, titre: 'Crop Engine', texte: 'Évaluer la compatibilité des cultures et afficher les raisons, les hypothèses et les données manquantes.' },
  { icone: IconeGraphique, titre: 'Rotation Engine', texte: 'Construire une rotation pluriannuelle justifiée : nutriments, maladies, couverture du sol, légumineuses.' },
  { icone: IconeArchive, titre: 'Farming Plan Engine', texte: 'Produire un calendrier de 1 à 5 ans avec points de contrôle, à partir de la rotation choisie.' }
];

const NIVEAUX_FIABILITE = [
  { n: 'N1', source: 'GPS, région, altitude, climat, historique', fiable: 'Faible', usage: 'Estimation initiale', tag: 'declared' },
  { n: 'N2', source: 'Satellite (végétation, humidité de surface)', fiable: 'Moyenne', usage: 'Compléter les zones sans sonde', tag: 'derived' },
  { n: 'N3', source: 'Photos du sol et de la végétation', fiable: 'Faible à moyenne', usage: 'Estimation visuelle, jamais une analyse chimique', tag: 'estimated' },
  { n: 'N4', source: 'Sondes IoT (humidité, pH, température)', fiable: 'Moyenne à bonne', usage: 'Mesure répétée, avec étalonnage', tag: 'measured_sensor' },
  { n: 'N5', source: 'Analyse de laboratoire', fiable: 'Élevée', usage: 'Référence, avec rapport joint', tag: 'measured_lab' }
];

const PRINCIPES = [
  { titre: 'Provenance de la donnée', texte: 'Chaque valeur porte son origine : déclarée, vérifiée, mesurée au laboratoire, mesurée par capteur, estimée ou dérivée. Elle est affichée.' },
  { titre: 'Aucune statistique inventée', texte: 'Tout chiffre affiché est traçable jusqu’à une requête ou une agrégation. Aucun chiffre en dur dans les tableaux de bord.' },
  { titre: 'Estimation ≠ diagnostic', texte: 'Toute sortie d’IA ou de sol est une estimation, avec hypothèses, intervalle et avertissement explicite.' },
  { titre: 'Sécurité côté serveur', texte: 'Le frontend masque, le backend interdit : authentification, permission, propriété de la ressource, isolation par organisation.' },
  { titre: 'Vie privée par défaut', texte: 'Téléphone, e-mail et coordonnées exactes sont privés. Toute publication demande un consentement explicite et daté.' },
  { titre: 'Hors connexion dès la conception', texte: 'Identifiants générés côté client, versions, synchronisation incrémentale : l’application reste utilisable sur un réseau intermittent.' },
  { titre: 'Multi-pays dès le modèle de données', texte: 'Code pays, devises et découpage administratif sont des données de configuration, jamais du code en dur.' },
  { titre: 'Proportionnalité', texte: 'Pas de blockchain, pas de microservices, pas d’IA complexe sans besoin démontré. Le produit d’abord.' },
  { titre: 'Le produit avant la technologie', texte: 'La V1 doit être lançable et utile seule, avant toute extension.' }
];

const OFFRES = [
  { offre: 'Freemium', cible: 'Producteurs', contenu: 'Profil, exploitation, parcelles, visibilité de base', version: 'V1' },
  { offre: 'AGRIKONNECT PRO', cible: 'Coopératives', contenu: 'Page professionnelle, membres, production agrégée, catalogue, statistiques, QR, rapports', version: 'V1 → V2' },
  { offre: 'Abonnement entreprise', cible: 'Agro-industries, ONG, programmes', contenu: 'Recherche avancée, rapports, exports', version: 'V2' },
  { offre: 'Services premium', cible: 'Tous', contenu: 'Vérification, accompagnement, digitalisation, rapports de sol', version: 'V2 → V3' },
  { offre: 'API et données', cible: 'Banques, institutions', contenu: 'Données agrégées et anonymisées', version: 'V5' }
];

const FORMULES = [
  {
    titre: 'Partenaire financier',
    icone: IconeGraphique,
    texte: 'Vous financez une étape précise : V1, pilote terrain, V2 marché ou module sol. Chaque versement est rattaché à des livrables écrits et vérifiables.',
    attentes: ['Échange de 45 minutes', 'Due diligence documentée', 'Convention par étape', 'Rapport d’avancement daté']
  },
  {
    titre: 'Partenaire technique',
    icone: IconeOrdinateur,
    texte: 'Vous apportez des compétences : agronomie, données, cartographie, développement, cybersécurité. Nous travaillons par lots courts et versions livrées.',
    attentes: ['Portfolio ou références', 'Domaine et volume horaire', 'Binôme avec l’équipe', 'Code et documentation partagés']
  },
  {
    titre: 'Partenaire de terrain',
    icone: IconeFeuille,
    texte: 'Coopérative, ONG ou réseau de producteurs : vous ouvrez l’accès à des parcelles pilotes, à des membres et à la réalité des pratiques agricoles.',
    attentes: ['Zone et nombre de membres', 'Parcelles de démonstration', 'Consentement des producteurs', 'Retour terrain structuré']
  },
  {
    titre: 'Partenaire institutionnel',
    icone: IconeBouclier,
    texte: 'Institution, laboratoire ou université : vous validez les règles agronomiques, hébergez des analyses ou encadrez le cadre juridique.',
    attentes: ['Périmètre de validation', 'Comité scientifique', 'Cadre juridique local', 'Publication conjointe des résultats']
  }
];

const FAQ = [
  {
    q: 'La plateforme collecte-t-elle de l’argent auprès des investisseurs ?',
    r: 'Non. Aucune collecte de fonds, aucun paiement et aucun crédit ne sont opérés par la plateforme en V1 à V4. Elle présente des projets documentés et met en relation avec des partenaires agréés. C’est un choix de conformité assumé, écrit dans le cahier des charges.'
  },
  {
    q: 'Promettez-vous un rendement agricole ?',
    r: 'Non, et aucun document du projet ne le fera. Les sorties agronomiques sont des estimations avec niveau de confiance, hypothèses et données manquantes affichées. Une analyse de sol est toujours recommandée avant une décision importante.'
  },
  {
    q: 'Pourquoi commencer par la République démocratique du Congo ?',
    r: 'Le pilote démarre à Kinshasa et dans une à deux zones agricoles stratégiques, choisies selon les partenaires, la connectivité et les filières. La conception multi-pays permet ensuite d’ouvrir le Congo, la Zambie, l’Angola, le Cameroun, le Rwanda, le Kenya, la Tanzanie, la Côte d’Ivoire ou le Ghana sans réécrire le métier.'
  },
  {
    q: 'Avec quel montant peut-on entrer ?',
    r: 'Il n’y a pas de ticket imposé. Le formulaire vous demande une fourchette pour que nous puissions rattacher votre apport à une étape réaliste. Un apport en expertise, en matériel ou en accès terrain a autant de valeur qu’un apport financier.'
  },
  {
    q: 'Que devient mon dossier après l’envoi ?',
    r: 'Il reçoit une référence (PT-année-numéro), il est enregistré dans notre base et un e-mail part immédiatement à l’équipe. Vous êtes recontacté pour un premier échange. Aucun document n’est transmis à un tiers sans votre accord écrit.'
  },
  {
    q: 'Puis-je demander la suppression de mes données ?',
    r: 'Oui, à tout moment et sans justification : écrivez à l’adresse de contact avec votre référence. Les droits d’accès, de rectification, d’export et de suppression sont prévus dès la conception.'
  },
  {
    q: 'Comment les règles agronomiques sont-elles validées ?',
    r: 'Par des agronomes identifiés (instituts de recherche, universités, ONG partenaires), dans un jeu de règles versionné. Sans validation experte, les recommandations restent désactivées. Les règles locales priment sur les règles génériques.'
  },
  {
    q: 'Le projet est-il déjà financé ou déjà lancé ?',
    r: 'Une première brique existe : la plateforme de relecture des plages agronomiques que vous pouvez utiliser sur ce site. Elle sert de socle documentaire aux cultures, aux paramètres et aux sources. Les versions V1 à V5 sont en préparation ; le calendrier dépend des partenariats.'
  }
];

/* ------------------------------------------------------------------------ */

function Faq({ q, r, ouvert, onToggle, index }) {
  return (
    <div className="overflow-hidden rounded-xl2 border border-vert-800/10 bg-white/80 transition-colors duration-300 hover:border-vert-800/20">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={ouvert}
          aria-controls={`faq-${index}`}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        >
          <span className="text-[14.5px] font-semibold text-vert-900">{q}</span>
          <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-vert-800/10 text-lg text-vert-800 transition-transform duration-300 ${ouvert ? 'rotate-180' : ''}`}>
            {ouvert ? <IconeMoins /> : <IconePlus />}
          </span>
        </button>
      </h3>
      <div id={`faq-${index}`} hidden={!ouvert} className="px-5 pb-5 text-[13.5px] leading-relaxed text-encre-500">
        {r}
      </div>
    </div>
  );
}

export default function Partenaires() {
  const [ouvert, setOuvert] = useState(0);
  const [contact, setContact] = useState(null);

  useEffect(() => {
    api.config().then((c) => setContact(c.contact || null)).catch(() => {});
  }, []);

  return (
    <>
      {/* ------------------------------- HERO ------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 -top-24 h-[420px] w-[420px] rounded-full bg-terre-300/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-24 top-40 h-[380px] w-[380px] rounded-full bg-vert-300/25 blur-3xl" aria-hidden="true" />
        <div className="conteneur relative grid gap-10 pb-14 pt-12 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14">
          <div>
            <Reveal>
              <div className="flex flex-wrap items-center gap-2">
                <Etiquette ton="terre">Programme partenaires</Etiquette>
                <span className="text-[11px] font-semibold uppercase tracking-[.16em] text-encre-500">
                  Cahier des charges v2.0 · 18 septembre 2026
                </span>
              </div>
              <h1 className="mt-5 font-display text-[34px] font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[54px]">
                L’agriculture africaine mérite une <span className="text-terre-600">visibilité mondiale</span>.
              </h1>
              <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-encre-500 sm:text-base">
                <strong className="font-semibold text-vert-900">AGRIKONNECT AFRICA</strong> construit une
                infrastructure numérique agricole : une identité professionnelle pour chaque producteur,
                une carte agricole, un marché B2B, des données de sol traçables et des projets présentables
                à des partenaires. Nous cherchons des partenaires pour financer, construire et déployer
                les premières étapes.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/partenaires/rejoindre" className="btn-terre">
                  Devenir partenaire <IconeFleche className="text-base" />
                </Link>
                <a href="#dossier" className="btn-secondaire">Lire le dossier de projet</a>
              </div>
              <dl className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-vert-800/10 pt-5">
                {[
                  ['5 versions', 'de V1 à V5, livrables séparés'],
                  ['9 cultures', 'référentiel agronomique déjà en ligne'],
                  ['RDC', 'pilote Kinshasa + zones agricoles']
                ].map(([t, s]) => (
                  <div key={t}>
                    <dt className="font-display text-lg font-semibold text-vert-900">{t}</dt>
                    <dd className="mt-0.5 text-[11.5px] leading-snug text-encre-500">{s}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delai={140} className="relative">
            <Photo
              src={P.hero.grand}
              alt={ALT.hero}
              etiquette="Terrain · RDC"
              legende="Une agronome et un producteur : la donnée n’a de valeur que confrontée au champ."
              ratio="aspect-[4/3] sm:aspect-[5/4]"
              priorite
            />
            <div className="absolute -left-3 top-5 hidden w-[190px] rounded-xl2 border border-vert-800/10 bg-white/95 p-3 shadow-carte backdrop-blur sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-terre-700">Chaîne de valeur</p>
              <p className="mt-1 text-[12.5px] leading-snug text-encre-500">
                Producteur → identité → exploitation → données → visibilité → opportunités
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------- LE PROBLÈME --------------------------- */}
      <section id="dossier" className="border-y border-vert-800/10 bg-vert-900 py-16 text-creme-100 sm:py-20">
        <div className="conteneur">
          <Reveal className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[.22em] text-terre-300">Le problème</p>
            <h2 className="mt-2 font-display text-[28px] font-semibold leading-tight text-creme-50 sm:text-4xl">
              Chaque acteur de la chaîne manque d’une information que l’autre détient.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-creme-200/80">
              Ce n’est pas un problème de production : c’est un problème de structure et de visibilité.
              Le producteur ne peut pas prouver sa capacité ; l’acheteur ne peut pas vérifier ce qu’il achète ;
              l’investisseur ne peut pas documenter un projet ; l’institution ne peut pas consolider.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {ACTEURS.map((a, i) => (
              <Reveal key={a.titre} delai={i * 70} className="rounded-xl2 border border-creme-100/15 bg-creme-100/5 p-5 transition-colors duration-300 hover:border-terre-300/40 hover:bg-creme-100/10">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-creme-100/10 text-xl text-terre-300">
                  <a.icone />
                </span>
                <h3 className="mt-4 font-display text-[17px] font-semibold text-creme-50">{a.titre}</h3>
                <ul className="mt-2.5 space-y-1.5 text-[12.5px] leading-snug text-creme-200/70">
                  {a.maux.map((m) => (
                    <li key={m} className="flex gap-1.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-terre-300" aria-hidden="true" />
                      {m}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------- CHAÎNE DE VALEUR ------------------------- */}
      <section className="conteneur py-16 sm:py-20">
        <Reveal>
          <TitreSection
            surtitre="La réponse"
            titre="Une chaîne de valeur, pas une application de plus"
            intro="Chaque maillon produit la matière du suivant. C’est cette continuité qui rend le produit difficile à copier : identité, données, visibilité, marché, projets."
          />
        </Reveal>
        <div className="mt-10 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {CHAINE.map((c, i) => (
            <Reveal key={c.titre} delai={i * 60} className="carte-survol relative p-4">
              <span className="font-display text-[26px] font-semibold leading-none text-vert-200">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-2 text-[14px] font-semibold text-vert-900">{c.titre}</h3>
              <p className="mt-1 text-[12px] leading-snug text-encre-500">{c.texte}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------- LES 5 VERSIONS ------------------------- */}
      <section className="border-y border-vert-800/10 bg-white/50 py-16 sm:py-20">
        <div className="conteneur">
          <Reveal>
            <TitreSection
              surtitre="Ce que nous construisons"
              titre="Cinq versions, cinq livrables finançables séparément"
              intro="Le découpage est volontairement progressif : chaque version doit être lançable et utile seule. Vous pouvez soutenir une étape sans vous engager sur les suivantes."
            />
          </Reveal>

          <div className="mt-12 space-y-12 lg:space-y-16">
            {VERSIONS.map((v, i) => (
              <Reveal
                key={v.code}
                delai={40}
                className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${i % 2 ? 'lg:[&>figure]:order-2' : ''}`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-vert-800 font-display text-[15px] font-bold text-creme-100">
                      {v.code}
                    </span>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[.16em] text-terre-700">{v.etiquette}</p>
                      <h3 className="font-display text-xl font-semibold leading-tight">{v.nom}</h3>
                    </div>
                  </div>
                  <p className="mt-4 font-display text-[19px] leading-snug text-vert-800">{v.promesse}</p>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-encre-500">{v.texte}</p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {v.points.map((p) => (
                      <li key={p} className="flex gap-2 text-[12.5px] leading-snug text-encre-700">
                        <IconeCheck className="mt-0.5 shrink-0 text-[13px] text-vert-600" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-creme-200/70 px-3 py-1.5 text-[11.5px] font-semibold text-vert-800">
                    Durée indicative : {v.duree}
                  </p>
                </div>
                <Photo
                  src={v.image.grand}
                  alt={v.alt}
                  ratio="aspect-[16/10]"
                  voile="leger"
                  etiquette={v.code}
                  legende={v.nom}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------- SOIL & CROP INTELLIGENCE -------------------- */}
      <section className="relative overflow-hidden bg-vert-950 py-16 text-creme-100 sm:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true">
          <img src={P.sol.grand} alt="" className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-vert-950 via-vert-950/97 to-vert-950/94" />
        </div>
        <div className="conteneur relative">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            <Reveal>
              <p className="text-[11px] font-bold uppercase tracking-[.22em] text-terre-300">Module transversal</p>
              <h2 className="mt-2 font-display text-[28px] font-semibold leading-tight text-creme-50 sm:text-4xl">
                Comprendre son sol avant de semer
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-creme-200/80">
                La question posée n’est pas seulement « que semer ? » mais
                <em className="text-creme-100"> « que faire de cette parcelle pendant les cinq prochaines années ? »</em>.
                Quatre moteurs répondent, avec une règle absolue : dire ce que le système sait,
                ce qu’il estime, et ce qu’il ignore.
              </p>
              <blockquote className="mt-6 rounded-xl2 border-l-4 border-terre-400 bg-creme-100/5 px-5 py-4 font-display text-[15.5px] leading-relaxed text-creme-100">
                « Évaluation indicative : conditions favorables au manioc selon les données disponibles.
                Une analyse de sol est recommandée avant toute décision importante. »
                <footer className="mt-2 font-sans text-[11.5px] uppercase tracking-[.12em] text-creme-200/80">
                  Formulation imposée — jamais « votre sol est fertile à 92 %, semez »
                </footer>
              </blockquote>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {MOTEURS.map((m) => (
                  <div key={m.titre} className="rounded-xl border border-creme-100/12 bg-creme-100/5 p-4">
                    <span className="text-lg text-terre-300"><m.icone /></span>
                    <h3 className="mt-1.5 text-[13.5px] font-semibold text-creme-50">{m.titre}</h3>
                    <p className="mt-1 text-[12px] leading-snug text-creme-200/85">{m.texte}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delai={120}>
              <div className="rounded-xl2 border border-creme-100/15 bg-vert-950/85 p-5 backdrop-blur-sm sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-[17px] font-semibold text-creme-50">Niveaux de fiabilité</h3>
                  <span className="text-[10px] font-bold uppercase tracking-[.14em] text-terre-300">5 sources</span>
                </div>
                <ul className="mt-4 space-y-3">
                  {NIVEAUX_FIABILITE.map((n) => (
                    <li key={n.n} className="rounded-xl border border-creme-100/10 bg-creme-100/[0.04] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <span className="grid h-6 w-6 place-items-center rounded-md bg-terre-400/20 text-[10.5px] font-bold text-terre-200">{n.n}</span>
                          <span className="text-[12.5px] font-medium text-creme-100">{n.source}</span>
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-creme-200/80">
                        <span>Fiabilité : <strong className="font-semibold text-creme-100">{n.fiable}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>{n.usage}</span>
                        <code className="rounded bg-vert-950/60 px-1.5 py-0.5 text-[10px] text-terre-200">{n.tag}</code>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 flex gap-2 text-[11.5px] leading-relaxed text-creme-200/85">
                  <IconeInfo className="mt-0.5 shrink-0 text-terre-300" />
                  Un satellite ne mesure pas le sous-sol : il lit la surface. La vérité sous-sol vient des
                  sondes et du géoradar. Chaque valeur affiche sa source et sa date.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------- PRINCIPES ---------------------------- */}
      <section className="conteneur py-16 sm:py-20">
        <Reveal>
          <TitreSection
            surtitre="Nos règles"
            titre="Neuf principes qui nous engagent devant vous"
            intro="Ils ne sont pas décoratifs : chacun a une conséquence technique vérifiable dans le produit."
          />
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPES.map((p, i) => (
            <Reveal key={p.titre} delai={i * 50} className="carte-survol p-5">
              <span className="font-display text-[13px] font-bold text-terre-600">P{i + 1}</span>
              <h3 className="mt-1 font-display text-[16px] font-semibold leading-snug">{p.titre}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-encre-500">{p.texte}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ----------------------- MODÈLE ÉCONOMIQUE ------------------------ */}
      <section className="border-y border-vert-800/10 bg-white/55 py-16 sm:py-20">
        <div className="conteneur grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-14">
          <Reveal className="min-w-0">
            <TitreSection
              surtitre="Modèle économique"
              titre="Comment le projet devient rentable"
              intro="La visibilité est gratuite pour les producteurs : c’est la coopérative, l’entreprise et l’institution qui paient pour la donnée consolidée, les rapports et les services."
            />
            <Photo
              src={P.cooperative.grand}
              alt={ALT.cooperative}
              ratio="aspect-[16/10]"
              className="mt-6"
              etiquette="Coopératives"
              legende="Le plan PRO coopératives est le premier produit à monétiser : membres, production agrégée, catalogue, rapports."
            />
          </Reveal>
          <Reveal delai={100} className="min-w-0">
            <div className="overflow-x-auto rounded-xl2 border border-vert-800/10 bg-white shadow-doux" role="region" aria-label="Offres commerciales par version (défilement horizontal si nécessaire)" tabIndex={0}>
              <table className="w-full min-w-[420px] border-collapse text-left text-[13px]">
                <caption className="sr-only">Offres commerciales prévues par version</caption>
                <thead>
                  <tr className="bg-vert-800 text-creme-100">
                    <th scope="col" className="p-3 font-semibold">Offre</th>
                    <th scope="col" className="hidden p-3 font-semibold sm:table-cell">Cible</th>
                    <th scope="col" className="p-3 font-semibold">Contenu</th>
                    <th scope="col" className="p-3 text-center font-semibold">Version</th>
                  </tr>
                </thead>
                <tbody>
                  {OFFRES.map((o) => (
                    <tr key={o.offre} className="border-t border-vert-800/10 align-top odd:bg-creme-50/50">
                      <th scope="row" className="p-3 font-semibold text-vert-900">{o.offre}</th>
                      <td className="hidden p-3 text-encre-500 sm:table-cell">{o.cible}</td>
                      <td className="p-3 text-encre-500">{o.contenu}</td>
                      <td className="p-3 text-center"><Etiquette ton="creme">{o.version}</Etiquette></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-encre-500">
              Aucune donnée n’est vendue à l’unité : les jeux de données sont agrégés et anonymisés,
              avec un seuil minimal empêchant la ré-identification et un contrat de données.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------- CE QUE NOUS NE FAISONS PAS -------------- */}
      <section className="conteneur py-14 sm:py-16">
        <Reveal className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-xl2 border border-terre-300/60 bg-terre-50 p-5 lg:col-span-2">
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-terre-700">Engagement de conformité</p>
            <h2 className="mt-5 font-display text-[22px] font-semibold leading-tight sm:text-[26px]">
              Ce que nous ne ferons pas — même si cela semblerait plus vendeur
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                'Aucune collecte de fonds, aucun paiement, aucun crédit opéré par la plateforme en V1 à V4.',
                'Aucune promesse de rendement, de récolte ou de succès commercial.',
                'Aucun score global opaque : des critères détaillés, une provenance, un niveau de confiance.',
                'Aucune donnée personnelle transmise à un tiers sans accord écrit et traçable.',
                'Aucune recommandation d’intrants dosés sans validation experte et conformité locale.',
                'Aucun profil public ne révèle les coordonnées ou la position exacte sans autorisation.'
              ].map((t) => (
                <li key={t} className="flex gap-2.5 rounded-xl bg-white/70 p-3 text-[12.5px] leading-relaxed text-encre-700">
                  <IconeCheck className="mt-0.5 shrink-0 text-sm text-vert-600" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="carte flex flex-col justify-between p-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-terre-700">Cadre réglementaire</p>
              <p className="mt-3 text-[13px] leading-relaxed text-encre-600">
                Avant tout développement de la version « projets et partenaires », un avis juridique
                est requis, ainsi qu’un partenariat avec des institutions financières agréées pour
                le KYC et l’AML.
              </p>
            </div>
            <div className="mt-6 space-y-2.5">
              <Encadre ton="info" titre="L’innovation est ailleurs">
                Elle est dans la traçabilité, la provenance des données et la chaîne
                « sol → culture → marché → projet », pas dans la promesse financière.
              </Encadre>
            </div>
          </div>
        </Reveal>
      </section>

      {/* --------------------------- FEUILLE DE ROUTE ---------------------- */}
      <section className="border-y border-vert-800/10 bg-white/50 py-16 sm:py-20">
        <div className="conteneur grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14">
          <Reveal>
            <TitreSection
              surtitre="Où va votre apport"
              titre="Un financement rattaché à des livrables, pas à des intentions"
              intro="Chaque étape est découpée en lots courts : un lot se termine par une démonstration, un document et une mise en service. Vous savez ce que votre apport a produit."
            />
            <ol className="mt-7 space-y-4">
              {[
                ['Phase 0', 'Cadrage, UX, architecture, modèle de données, sécurité, design system, validation juridique de base.', '3 à 4 semaines'],
                ['V1 + pilote', 'Identité, exploitations, parcelles, productions, profil public, carte. Pilote terrain à Kinshasa et en zone agricole.', '4 à 6 mois + 2 à 3 mois'],
                ['V2 à V5', 'Marché, intelligence et données, projets et partenaires, international. Ouverture pays par pays.', 'Par étapes successives']
              ].map(([titre, texte, duree], i) => (
                <li key={titre} className="relative flex gap-4 rounded-xl2 border border-vert-800/10 bg-white/80 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-vert-800 font-display text-[13px] font-bold text-creme-100">
                    {i + 1}
                  </span>
                  <div>
                    <p className="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-vert-900">
                      {titre}
                      <span className="rounded-full bg-creme-200/80 px-2 py-0.5 text-[10.5px] font-semibold text-vert-800">{duree}</span>
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-encre-500">{texte}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[11.5px] leading-relaxed text-encre-500">
              Les durées sont celles du cahier des charges. Elles sont recalées après chaque phase,
              selon la taille de l’équipe, le financement et les partenariats — jamais selon une promesse de communication.
            </p>
          </Reveal>

          <Reveal delai={120} className="grid gap-4">
            <Photo
              src={P.equipe.grand}
              alt={ALT.equipe}
              ratio="aspect-[16/11]"
              etiquette="Équipe produit"
              legende="Une équipe restreinte, un monolithe modulaire : pas de complexité technique avant la preuve du besoin."
            />
            <div className="grid grid-cols-2 gap-3">
              <Photo src={P.formation.petit} alt={ALT.formation} ratio="aspect-[4/3]" arrondi="rounded-xl" voile="aucun" />
              <Photo src={P.carte.petit} alt={ALT.carte} ratio="aspect-[4/3]" arrondi="rounded-xl" voile="aucun" />
            </div>
            <Encadre ton="succes" titre="Ce que nous mesurons">
              Producteurs inscrits, coopératives, exploitations, parcelles, profils complétés, taux de
              vérification, commandes livrées, rétention à 30 jours. Toute valeur déclarée est présentée
              comme déclarée, jamais comme chiffre audité.
            </Encadre>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------- FORMULES ----------------------------- */}
      <section className="conteneur py-16 sm:py-20">
        <Reveal>
          <TitreSection
            surtitre="Quatre manières d’entrer"
            titre="Choisissez la forme de partenariat qui vous ressemble"
            intro="Un apport financier n’est pas la seule porte. Un accès terrain, une validation scientifique ou un domaine d’expertise peuvent débloquer une étape entière."
          />
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {FORMULES.map((f, i) => (
            <Reveal key={f.titre} delai={i * 70} className="carte-survol group flex flex-col p-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-vert-800/10 text-2xl text-vert-700 transition-colors duration-300 group-hover:bg-vert-800 group-hover:text-creme-100">
                <f.icone />
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold">{f.titre}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-encre-500">{f.texte}</p>
              <ul className="mt-4 space-y-1.5 border-t border-vert-800/10 pt-4">
                {f.attentes.map((a) => (
                  <li key={a} className="flex gap-2 text-[12px] text-encre-700">
                    <IconeCheck className="mt-0.5 shrink-0 text-[12px] text-vert-600" />
                    {a}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------- FAQ ------------------------------ */}
      <section className="border-y border-vert-800/10 bg-white/55 py-16 sm:py-20">
        <div className="conteneur grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <Reveal>
            <TitreSection
              surtitre="Questions fréquentes"
              titre="Les réponses que vous cherchez avant de nous écrire"
              intro="Si une question manque, posez-la dans le formulaire : la dernière étape accepte un message libre."
            />
            <div className="mt-6 rounded-xl2 border border-vert-800/10 bg-white/80 p-5">
              <p className="text-[11px] font-bold uppercase tracking-[.16em] text-terre-700">Écrire directement</p>
              <ul className="mt-3 space-y-2.5 text-[13px] text-encre-700">
                {contact?.email && (
                  <li className="flex items-center gap-2.5">
                    <IconeEnveloppe className="shrink-0 text-vert-600" />
                    <a className="lien-souligne" href={`mailto:${contact.email}`}>{contact.email}</a>
                  </li>
                )}
                {contact?.whatsapp_lien && (
                  <li className="flex items-center gap-2.5">
                    <IconeTelephone className="shrink-0 text-vert-600" />
                    <a className="lien-souligne" href={contact.whatsapp_lien} target="_blank" rel="noreferrer">
                      WhatsApp {contact.whatsapp}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </Reveal>

          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <Faq
                key={f.q}
                index={i}
                q={f.q}
                r={f.r}
                ouvert={ouvert === i}
                onToggle={() => setOuvert(ouvert === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ CTA ------------------------------- */}
      <section className="conteneur py-16 sm:py-20">
        <Reveal className="grid overflow-hidden rounded-xl3 border border-vert-800/10 bg-vert-900 shadow-leve lg:grid-cols-[1fr_0.85fr]">
          <div className="p-7 sm:p-10">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-terre-300">Candidature partenaire</p>
            <h2 className="mt-3 font-display text-[26px] font-semibold leading-tight text-creme-50 sm:text-4xl">
              Cinq étapes, quelques minutes, une référence de dossier.
            </h2>
            <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-creme-200/80">
              Identité, apport, domaines et années d’expérience, origine et zone d’action, puis vos
              précisions. Vous recevez immédiatement une référence <strong className="text-creme-100">PT-année-numéro</strong>
              {' '}et votre dossier part à l’équipe.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/partenaires/rejoindre" className="btn-terre">
                Ouvrir le formulaire <IconeFleche className="text-base" />
              </Link>
              <Link to="/" className="btn inline-flex border border-creme-100/25 px-5 py-3 text-creme-100 hover:bg-creme-100/10">
                Retour à l’accueil
              </Link>
            </div>
            <p className="mt-5 flex items-center gap-2 text-[11.5px] text-creme-200/60">
              <IconeLien className="shrink-0 text-terre-300" />
              Aucune pièce jointe demandée à cette étape. Les documents arrivent après le premier échange.
            </p>
          </div>
          <Photo
            src={P.formation.petit}
            alt={ALT.formation}
            ratio="aspect-[16/11] lg:aspect-auto lg:h-full"
            arrondi="rounded-none"
            voile="fort"
            className="order-first border-0 lg:order-last"
          />
        </Reveal>
      </section>
    </>
  );
}
