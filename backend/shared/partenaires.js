/* ==========================================================================
   shared/partenaires.js — référentiel du programme « Devenir partenaire »
   Un seul endroit décrit : les types de parties prenantes, les apports,
   les domaines, les pays, les provinces de la RDC, les devises…
   Le frontend et le backend lisent ce fichier (aucune duplication).
   ========================================================================== */

/* ------------------------------ Identité --------------------------------- */
export const TYPES_PARTIE = [
  { id: 'investisseur', nom: 'Investisseur / partenaire financier', desc: 'Fonds, business angel, banque, IMF, assurance, programme de financement.' },
  { id: 'cooperative', nom: 'Coopérative ou organisation de producteurs', desc: 'Coopérative, union, association de producteurs, groupement villageois.' },
  { id: 'entreprise', nom: 'Entreprise agricole / agro-industrie', desc: 'Production, transformation, négoce, export, intrants, équipements.' },
  { id: 'institution', nom: 'Institution, ONG ou programme public', desc: 'Ministère, agence, bailleur, ONG, projet de développement.' },
  { id: 'recherche', nom: 'Université, recherche ou laboratoire', desc: 'INERA, université, laboratoire d’analyse de sol, institut technique.' },
  { id: 'technologie', nom: 'Partenaire technologique / données', desc: 'Capteurs IoT, satellite, télécoms, éditeur logiciel, données.' },
  { id: 'agronome', nom: 'Agronome ou cabinet de conseil', desc: 'Expertise agronomique, validation des règles, formation terrain.' },
  { id: 'autre', nom: 'Autre partie prenante', desc: 'Précisez votre rôle à l’étape suivante.' }
];

/* -------------------------------- Apports -------------------------------- */
export const APPORTS = [
  { id: 'financement', nom: 'Financement', desc: 'Capital, subvention, prêt ou garantie apportés au projet.' },
  { id: 'expertise', nom: 'Expertise technique', desc: 'Agronomie, données, IA, ingénierie logicielle, juridique.' },
  { id: 'terrain', nom: 'Terrain et réseau', desc: 'Accès à des producteurs, coopératives, parcelles de démonstration.' },
  { id: 'materiel', nom: 'Matériel et équipements', desc: 'Sondes, passerelles, drones, serveurs, smartphones, véhicules.' },
  { id: 'institutionnel', nom: 'Appui institutionnel', desc: 'Cadre réglementaire, autorisations, plaidoyer, mise en relation publique.' },
  { id: 'commercial', nom: 'Débouchés commerciaux', desc: 'Achats de production, contrats, marchés nationaux ou internationaux.' },
  { id: 'formation', nom: 'Formation et accompagnement', desc: 'Renforcement des capacités des équipes et des producteurs.' },
  { id: 'visibilite', nom: 'Visibilité et communication', desc: 'Médias, événements, communautés professionnelles.' }
];

/* -------------------------------- Domaines ------------------------------- */
export const DOMAINES = [
  { id: 'production-vegetale', nom: 'Production végétale', desc: 'Cultures vivrières, rente, maraîchage, semences.' },
  { id: 'sol-agronomie', nom: 'Sol et agronomie', desc: 'Fertilité, analyses de sol, fertilisation, conservation.' },
  { id: 'donnees-ia', nom: 'Données et intelligence artificielle', desc: 'Modèles, prévisions, cartographie, traitement d’images.' },
  { id: 'cartographie-geo', nom: 'Cartographie et géospatial', desc: 'SIG, télédétection, satellite, drone, GPS.' },
  { id: 'cooperatives', nom: 'Coopératives et organisation', desc: 'Gouvernance, gestion des membres, agrégation.' },
  { id: 'marches-export', nom: 'Marchés et export', desc: 'Commercialisation, normalisation, logistique export.' },
  { id: 'finance-investissement', nom: 'Finance et investissement', desc: 'Analyse financière, structuration, garanties, IMF.' },
  { id: 'transformation', nom: 'Transformation et stockage', desc: 'Première transformation, séchage, chaîne du froid, entrepôts.' },
  { id: 'logistique', nom: 'Logistique et transport', desc: 'Collecte, transport rural, pistes, dernier kilomètre.' },
  { id: 'formation-conseil', nom: 'Formation et conseil agricole', desc: 'Vulgarisation, écoles champ, conseil de proximité.' },
  { id: 'numerique-terrain', nom: 'Numérique de terrain', desc: 'Applications mobiles, USSD, WhatsApp, connectivité rurale.' },
  { id: 'juridique', nom: 'Juridique et conformité', desc: 'Droit des sociétés, données personnelles, réglementation.' },
  { id: 'suivi-evaluation', nom: 'Suivi, évaluation et impact', desc: 'Indicateurs, enquêtes, rapports bailleurs.' },
  { id: 'autre-domaine', nom: 'Autre domaine', desc: 'Précisez dans le message final.' }
];

export const NIVEAUX = [
  { id: 'decouverte', nom: 'Découverte' },
  { id: 'pratique', nom: 'Pratique' },
  { id: 'confirme', nom: 'Confirmé' },
  { id: 'expert', nom: 'Expert / référence' }
];

/* ------------------------------ Géographie -------------------------------- */
export const PAYS = [
  'République démocratique du Congo', 'République du Congo', 'Angola', 'Zambie', 'Rwanda',
  'Burundi', 'Cameroun', 'Gabon', 'Kenya', 'Tanzanie', 'Ouganda', 'Côte d’Ivoire',
  'Ghana', 'Nigéria', 'Sénégal', 'Afrique du Sud', 'France', 'Belgique', 'Canada',
  'États-Unis', 'Chine', 'Inde', 'Autre pays'
];

export const PROVINCES_RDC = [
  'Kinshasa', 'Kongo Central', 'Kwilu', 'Kwango', 'Mai-Ndombe', 'Équateur', 'Tshuapa',
  'Mongala', 'Sud-Ubangi', 'Nord-Ubangi', 'Bas-Uélé', 'Haut-Uélé', 'Ituri', 'Tshopo',
  'Nord-Kivu', 'Sud-Kivu', 'Maniema', 'Haut-Katanga', 'Lualaba', 'Haut-Lomami',
  'Tanganyika', 'Kasaï', 'Kasaï-Central', 'Kasaï-Oriental', 'Lomami', 'Sankuru'
];

export const ZONES_ACTION = ['République démocratique du Congo', 'Afrique centrale', 'Afrique', 'International'];
export const PORTEES = ['Locale (un territoire)', 'Provinciale', 'Nationale', 'Régionale (plusieurs pays)', 'Internationale'];
export const DEVISES = ['USD', 'EUR', 'CDF'];
export const TICKETS = [
  'Moins de 5 000 USD', '5 000 à 25 000 USD', '25 000 à 100 000 USD',
  '100 000 à 500 000 USD', 'Plus de 500 000 USD', 'À définir ensemble'
];
export const DISPONIBILITES = ['Immédiate', 'Sous 1 à 3 mois', 'Sous 3 à 6 mois', 'À discuter'];
export const CANAUX = ['Recommandation', 'LinkedIn', 'WhatsApp', 'Événement ou atelier', 'Recherche Internet', 'Université ou école', 'Autre'];

/* --------------------------- Libellés d'étapes ---------------------------- */
export const ETAPES_PARTENAIRE = [
  {
    id: 1,
    court: 'Identité',
    titre: 'Qui êtes-vous ?',
    intro: 'Votre identité professionnelle nous permet de qualifier le dossier et de vous répondre par le bon canal.',
    pourquoi: 'Un dossier identifié est traité en priorité : nous savons avec qui nous parlons et pour quelle structure.'
  },
  {
    id: 2,
    court: 'Apport',
    titre: 'Ce que vous apportez au projet',
    intro: 'Financement, expertise, terrain, matériel ou débouchés : chaque apport accélère une étape précise de la feuille de route.',
    pourquoi: 'La feuille de route est découpée en étapes finançables séparément (V1 à V5). Votre apport est rattaché à une étape, pas noyé dans un budget global.'
  },
  {
    id: 3,
    court: 'Domaines',
    titre: 'Vos domaines et votre expérience',
    intro: 'Indiquez les domaines que vous maîtrisez et, pour chacun, le nombre d’années d’expérience. Nous construisons ensuite des binômes.',
    pourquoi: 'Une année d’expérience réelle sur un domaine vaut mieux que dix promesses : c’est ce qui nous permet de dire à un bailleur qui fait quoi.'
  },
  {
    id: 4,
    court: 'Localisation',
    titre: 'Votre origine et votre zone d’action',
    intro: 'Nous privilégions les partenaires ancrés dans les territoires où les producteurs vivent et travaillent.',
    pourquoi: 'La plateforme démarre en RDC (Kinshasa et zones agricoles stratégiques) et s’étend ensuite à l’Afrique centrale.'
  },
  {
    id: 5,
    court: 'Autres',
    titre: 'Précisions et consentement',
    intro: 'Un message libre, votre disponibilité pour un échange et vos consentements. Vous gardez la main sur ce qui est partagé.',
    pourquoi: 'Aucun dossier n’est transmis à un tiers sans votre accord écrit. Vous pouvez demander la suppression de vos données à tout moment.'
  }
];

/* ------------------------------ Validation -------------------------------- */
export const LIMITES = {
  nom: 80, prenom: 80, organisation: 160, fonction: 120, email: 160, telephone: 40,
  ville: 120, message: 4000, reference: 400, autres: 400, motif: 3000
};

const vide = (v) => String(v ?? '').trim() === '';
const coupe = (v, n) => String(v ?? '').trim().slice(0, n);
const estEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim());
const estTel = (v) => /^[+()\d\s.-]{7,}$/.test(String(v || '').trim());
const ids = (liste) => liste.map((x) => x.id);

export const dossierVide = () => ({
  identite: { nom: '', prenom: '', organisation: '', fonction: '', type_partie: '', email: '', telephone: '' },
  apport: { natures: [], ticket: '', montant: '', devise: 'USD', disponibilite: '', precision: '' },
  domaines: [], // [{ id, annees, niveau }]
  localisation: { pays: 'République démocratique du Congo', province: '', ville: '', zone_action: 'République démocratique du Congo', portee: '', couverture: '' },
  autres: { message: '', canal: '', appel: false, consentement_contact: false, consentement_citation: false },
  meta: { langue: 'fr', source: 'web' }
});

/* Nettoie et borne toutes les valeurs reçues : la validation serveur ne fait
   jamais confiance au client. */
export function normaliserDossier(brut) {
  const d = brut && typeof brut === 'object' ? brut : {};
  const id = d.identite || {};
  const ap = d.apport || {};
  const lo = d.localisation || {};
  const au = d.autres || {};

  const natures = Array.isArray(ap.natures)
    ? [...new Set(ap.natures.map((x) => String(x).trim()).filter((x) => ids(APPORTS).includes(x)))]
    : [];

  const domaines = Array.isArray(d.domaines)
    ? d.domaines
        .filter((x) => x && ids(DOMAINES).includes(String(x.id)))
        .map((x) => ({
          id: String(x.id),
          annees: Math.max(0, Math.min(60, Number(x.annees) || 0)),
          niveau: ids(NIVEAUX).includes(String(x.niveau)) ? String(x.niveau) : 'pratique'
        }))
        .filter((x, i, arr) => arr.findIndex((y) => y.id === x.id) === i)
    : [];

  return {
    identite: {
      nom: coupe(id.nom, LIMITES.nom),
      prenom: coupe(id.prenom, LIMITES.prenom),
      organisation: coupe(id.organisation, LIMITES.organisation),
      fonction: coupe(id.fonction, LIMITES.fonction),
      type_partie: ids(TYPES_PARTIE).includes(String(id.type_partie)) ? String(id.type_partie) : '',
      email: coupe(id.email, LIMITES.email),
      telephone: coupe(id.telephone, LIMITES.telephone)
    },
    apport: {
      natures,
      ticket: TICKETS.includes(String(ap.ticket)) ? String(ap.ticket) : '',
      montant: coupe(ap.montant, 40),
      devise: DEVISES.includes(String(ap.devise)) ? String(ap.devise) : 'USD',
      disponibilite: DISPONIBILITES.includes(String(ap.disponibilite)) ? String(ap.disponibilite) : '',
      precision: coupe(ap.precision, 1200)
    },
    domaines,
    localisation: {
      pays: PAYS.includes(String(lo.pays)) ? String(lo.pays) : coupe(lo.pays, 80),
      province: PROVINCES_RDC.includes(String(lo.province)) ? String(lo.province) : coupe(lo.province, 80),
      ville: coupe(lo.ville, LIMITES.ville),
      zone_action: ZONES_ACTION.includes(String(lo.zone_action)) ? String(lo.zone_action) : '',
      portee: PORTEES.includes(String(lo.portee)) ? String(lo.portee) : '',
      couverture: coupe(lo.couverture, 600)
    },
    autres: {
      message: coupe(au.message, LIMITES.message),
      canal: CANAUX.includes(String(au.canal)) ? String(au.canal) : coupe(au.canal, 80),
      appel: Boolean(au.appel),
      consentement_contact: Boolean(au.consentement_contact),
      consentement_citation: Boolean(au.consentement_citation)
    },
    meta: { langue: 'fr', source: 'web' }
  };
}

export function validerDossier(d) {
  const erreurs = [];
  const add = (champ, message) => erreurs.push({ champ, message });
  const i = d.identite;
  const a = d.apport;
  const l = d.localisation;

  if (vide(i.nom)) add('identite.nom', 'Indiquez votre nom.');
  if (vide(i.prenom)) add('identite.prenom', 'Indiquez votre prénom.');
  if (vide(i.organisation)) add('identite.organisation', 'Indiquez votre organisation ou, si vous êtes indépendant, « Indépendant ».');
  if (vide(i.type_partie)) add('identite.type_partie', 'Choisissez le type de partie prenante que vous représentez.');
  if (vide(i.email)) add('identite.email', 'Indiquez une adresse e-mail : c’est par là que nous répondons.');
  else if (!estEmail(i.email)) add('identite.email', 'Cette adresse e-mail ne semble pas valide.');
  if (vide(i.telephone)) add('identite.telephone', 'Indiquez un téléphone ou un WhatsApp, avec l’indicatif pays.');
  else if (!estTel(i.telephone)) add('identite.telephone', 'Ce numéro ne semble pas valide (chiffres, espaces, + autorisés).');

  if (!a.natures.length) add('apport.natures', 'Sélectionnez au moins une nature d’apport.');
  if (a.natures.includes('financement') && vide(a.ticket) && vide(a.montant)) {
    add('apport.ticket', 'Pour un apport financier, indiquez une fourchette ou un montant estimé.');
  }
  if (vide(a.disponibilite)) add('apport.disponibilite', 'Indiquez sous quel délai vous pourriez vous engager.');

  if (!d.domaines.length) add('domaines', 'Sélectionnez au moins un domaine de compétence.');
  d.domaines.forEach((x) => {
    if (!(x.annees >= 0)) add(`domaines.${x.id}`, 'Indiquez un nombre d’années d’expérience.');
  });

  if (vide(l.pays)) add('localisation.pays', 'Indiquez votre pays d’origine.');
  if (vide(l.zone_action)) add('localisation.zone_action', 'Indiquez votre zone d’action principale.');
  if (vide(l.portee)) add('localisation.portee', 'Indiquez la portée de votre action.');

  if (!d.autres.consentement_contact) {
    add('autres.consentement_contact', 'Nous avons besoin de votre accord pour vous recontacter au sujet de ce dossier.');
  }

  return { valide: erreurs.length === 0, erreurs };
}

/* ------------------------- Résumé lisible (e-mail) ------------------------ */
const nomDe = (liste, id) => (liste.find((x) => x.id === id) || {}).nom || id || '—';

export function resumeTexte(p) {
  const d = p.donnees;
  const i = d.identite;
  const a = d.apport;
  const l = d.localisation;
  const L = [];
  L.push(`Référence du dossier : ${p.reference}`);
  L.push(`Reçu le : ${new Date(p.cree_le).toLocaleString('fr-FR')}`);
  L.push('');
  L.push('— IDENTITÉ —');
  L.push(`Nom : ${i.prenom} ${i.nom}`);
  L.push(`Organisation : ${i.organisation}`);
  L.push(`Fonction : ${i.fonction || 'non précisée'}`);
  L.push(`Type de partie prenante : ${nomDe(TYPES_PARTIE, i.type_partie)}`);
  L.push(`E-mail : ${i.email}`);
  L.push(`Téléphone / WhatsApp : ${i.telephone}`);
  L.push('');
  L.push('— APPORT —');
  L.push(`Nature : ${a.natures.map((x) => nomDe(APPORTS, x)).join(', ') || 'non précisée'}`);
  if (a.ticket) L.push(`Fourchette : ${a.ticket}`);
  if (a.montant) L.push(`Montant estimé : ${a.montant} ${a.devise}`);
  L.push(`Disponibilité : ${a.disponibilite || 'non précisée'}`);
  if (a.precision) L.push(`Précisions : ${a.precision}`);
  L.push('');
  L.push('— DOMAINES ET EXPÉRIENCE —');
  d.domaines.forEach((x) => {
    L.push(`• ${nomDe(DOMAINES, x.id)} — ${x.annees} an(s) — niveau ${nomDe(NIVEAUX, x.niveau)}`);
  });
  L.push('');
  L.push('— ORIGINE ET ZONE D’ACTION —');
  L.push(`Pays d’origine : ${l.pays}`);
  if (l.province) L.push(`Province (RDC) : ${l.province}`);
  if (l.ville) L.push(`Ville / territoire : ${l.ville}`);
  L.push(`Zone d’action : ${l.zone_action}`);
  L.push(`Portée : ${l.portee}`);
  if (l.couverture) L.push(`Couverture : ${l.couverture}`);
  L.push('');
  L.push('— AUTRES —');
  L.push(`Comment nous a-t-il connu : ${d.autres.canal || 'non précisé'}`);
  L.push(`Souhaite un appel : ${d.autres.appel ? 'oui' : 'non'}`);
  L.push(`Accord pour être recontacté : ${d.autres.consentement_contact ? 'oui' : 'non'}`);
  L.push(`Accord pour être cité (nom + date) : ${d.autres.consentement_citation ? 'oui' : 'non'}`);
  if (d.autres.message) {
    L.push('');
    L.push('Message :');
    L.push(d.autres.message);
  }
  return L.join('\n');
}

export function resumeCourt(p) {
  const d = p.donnees;
  return {
    reference: p.reference,
    nom: `${d.identite.prenom} ${d.identite.nom}`.trim(),
    organisation: d.identite.organisation,
    type_partie: nomDe(TYPES_PARTIE, d.identite.type_partie),
    email: d.identite.email,
    telephone: d.identite.telephone,
    apports: d.apport.natures.map((x) => nomDe(APPORTS, x)),
    domaines: d.domaines.map((x) => ({ nom: nomDe(DOMAINES, x.id), annees: x.annees, niveau: nomDe(NIVEAUX, x.niveau) })),
    pays: d.localisation.pays,
    zone_action: d.localisation.zone_action,
    cree_le: p.cree_le
  };
}
