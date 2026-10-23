/* ==========================================================================
   server/db.js — accès aux données
   • MongoDB via Mongoose si MONGO_URI est joignable (mode production)
   • sinon repli automatique sur un fichier JSON (mode démonstration/local)
   L'API exposée est identique dans les deux cas.
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import mongoose from 'mongoose';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'relectures.json');

/* --------------------------------- Modèle -------------------------------- */
const ParametreSchema = new mongoose.Schema({
  imin: { type: String, default: '' },
  imax: { type: String, default: '' },
  tmin: { type: String, default: '' },
  tmax: { type: String, default: '' },
  source: { type: String, default: '' },
  statut: { type: String, enum: ['PROVISIONAL', 'VALIDATED'], default: 'PROVISIONAL' }
}, { _id: false });

const CultureSchema = new mongoose.Schema({
  nom_scientifique: { type: String, default: '' },
  zone: { type: String, enum: ['Les deux', 'Équateur', 'Bandundu'], default: 'Les deux' },
  ecocrop: { type: Object, default: {} },
  parametres: { type: Object, default: {} }, // { ph, temp, hum, ec, racine }
  remarques: { type: String, default: '' }
}, { _id: false });

const RelectureSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  reference: { type: String, required: true, index: true },
  cree_le: { type: Date, default: Date.now, index: true },
  source_saisie: { type: String, enum: ['web', 'csv'], default: 'web' },
  empreinte_ip: String,
  agent_utilisateur: String,
  agronome: {
    nom: { type: String, required: true, index: true },
    organisation: { type: String, required: true },
    contact: { type: String, required: true },
    date_relecture: { type: String, required: true },
    accord: { type: Boolean, default: false }
  },
  donnees: { type: Object, required: true },
  validite: { alertes: { type: Array, default: [] }, valeurs: { type: Number, default: 0 } }
}, { timestamps: true, minimize: false });

export const Relecture = mongoose.models.Relecture || mongoose.model('Relecture', RelectureSchema);

/* ------------------------------ État global ------------------------------ */
export const etat = { mode: 'json', mongo: false, erreur: null, uri: null, base: null, obligatoire: false };

export const URI_PAR_DEFAUT = 'mongodb://127.0.0.1:27017/plages_agronomiques';

/* Indique si l'on veut MongoDB coûte que coûte (MONGO_REQUIRED=1) : dans ce cas,
   aucune bascule silencieuse vers le fichier JSON. */
const MONGO_OBLIGATOIRE = /^(1|true|oui|yes)$/i.test(String(process.env.MONGO_REQUIRED || ''));

function masquerUri(uri) {
  return String(uri).replace(/\/\/[^@/]*@/, '//***:***@');
}

export function nomBase(uri) {
  try {
    const sansParams = String(uri).split('?')[0];
    const nom = sansParams.slice(sansParams.lastIndexOf('/') + 1);
    return nom || 'plages_agronomiques';
  } catch {
    return 'plages_agronomiques';
  }
}

export async function connecter() {
  const uri = process.env.MONGO_URI || URI_PAR_DEFAUT;
  etat.uri = masquerUri(uri);
  etat.base = nomBase(uri);
  etat.obligatoire = MONGO_OBLIGATOIRE;

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      // Nom de base explicite (utile si l'URI ne précise pas de base)
      dbName: etat.base
    });
    etat.mode = 'mongo';
    etat.mongo = true;
    etat.erreur = null;
    const info = mongoose.connection;
    console.log(`[db] MongoDB connecté — base « ${etat.base} » sur ${info.host}:${info.port}`);
  } catch (e) {
    etat.mode = 'json';
    etat.mongo = false;
    etat.erreur = e.message;
    if (MONGO_OBLIGATOIRE) {
      console.error('');
      console.error('  ┌───────────────────────────────────────────────────────────────┐');
      console.error('  │  MongoDB est obligatoire (MONGO_REQUIRED=1) mais injoignable. │');
      console.error('  └───────────────────────────────────────────────────────────────┘');
      console.error(`   Adresse essayée : ${etat.uri}`);
      console.error(`   Détail          : ${e.message}`);
      console.error('   → Démarrez le service MongoDB, ou corrigez MONGO_URI dans le fichier .env');
      console.error('');
      throw new Error('MongoDB injoignable alors que MONGO_REQUIRED=1');
    }
    console.log('');
    console.log('  ┌───────────────────────────────────────────────────────────────┐');
    console.log('  │  MongoDB injoignable → repli sur le fichier data/relectures.json');
    console.log('  └───────────────────────────────────────────────────────────────┘');
    console.log(`   Adresse essayée : ${etat.uri}`);
    console.log(`   Détail          : ${e.message}`);
    console.log('   → Pour enregistrer dans MongoDB : démarrez le service MongoDB puis relancez.');
    console.log('     (Windows : « Services » → MongoDB Server ; Mac : brew services start mongodb-community)');
    console.log('     Pour EXIGER MongoDB : mettez MONGO_REQUIRED=1 dans le fichier .env');
    console.log('');
  }
  return etat;
}

/* Vérification ponctuelle (utilisée par « npm run db:statut ») */
export async function verifier(uri = process.env.MONGO_URI || URI_PAR_DEFAUT) {
  const debut = Date.now();
  const conn = await mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 5000,
    dbName: nomBase(uri)
  }).asPromise();
  const admin = conn.db.admin();
  const infos = await admin.serverStatus().catch(() => null);
  const compteur = await conn.db.collection('relectures').countDocuments().catch(() => 0);
  const resume = {
    ok: true,
    uri: masquerUri(uri),
    base: nomBase(uri),
    version: infos ? infos.version : 'inconnue',
    documents: compteur,
    duree_ms: Date.now() - debut
  };
  await conn.close();
  return resume;
}

/* ------------------------------ Repli JSON ------------------------------- */
let cache = null;
function chargerJson() {
  if (cache) return cache;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) { cache = { relectures: [] }; return cache; }
  try {
    const parsed = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    cache = { relectures: Array.isArray(parsed.relectures) ? parsed.relectures : [] };
  } catch {
    try { fs.copyFileSync(FILE, `${FILE}.corrompu-${Date.now()}`); } catch { /* ignore */ }
    cache = { relectures: [] };
  }
  return cache;
}
function sauverJson() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(chargerJson(), null, 1), 'utf8');
  fs.renameSync(tmp, FILE);
}

/* ------------------------------ Référentiel ------------------------------ */
const annee = () => new Date().getFullYear();

export async function prochainesReferences(n) {
  const prefixe = `PA-${annee()}-`;
  let base;
  if (etat.mode === 'mongo') {
    base = await Relecture.countDocuments({ reference: { $regex: `^${prefixe}` } });
  } else {
    base = chargerJson().relectures.filter((r) => String(r.reference || '').startsWith(prefixe)).length;
  }
  return Array.from({ length: n }, (_, i) => `${prefixe}${String(base + i + 1).padStart(4, '0')}`);
}

export function nouvelleId() {
  return crypto.randomBytes(9).toString('hex');
}

export function empreinteIP(ip) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(`ip:${ip}:${process.env.SECRET_SEL || 'sel-local'}`).digest('hex').slice(0, 16);
}

/* --------------------------------- Écriture ------------------------------ */
export async function creer({ donnees, empreinte_ip, agent_utilisateur, source_saisie = 'web', validite = {}, reference }) {
  const [ref] = reference ? [reference] : await prochainesReferences(1);
  const rec = {
    id: nouvelleId(),
    reference: ref,
    cree_le: new Date().toISOString(),
    source_saisie,
    empreinte_ip: empreinte_ip || null,
    agent_utilisateur: agent_utilisateur || '',
    agronome: donnees.agronome,
    donnees,
    validite: { alertes: validite.alertes || [], valeurs: validite.valeurs || 0 }
  };
  if (etat.mode === 'mongo') {
    const doc = await Relecture.create(rec);
    return normaliserDoc(doc.toObject());
  }
  chargerJson().relectures.push(rec);
  sauverJson();
  return rec;
}

export async function creerLot(liste) {
  const refs = await prochainesReferences(liste.length);
  const crees = [];
  const ignores = [];
  const cles = new Set((await toutes()).map(cleDoublon));
  for (let i = 0; i < liste.length; i++) {
    const item = liste[i];
    const k = cleDoublon({ donnees: item.donnees });
    if (cles.has(k)) { ignores.push({ raison: 'doublon', nom: item.donnees.agronome.nom }); continue; }
    cles.add(k);
    crees.push(await creer({ ...item, reference: refs[i], source_saisie: 'csv' }));
  }
  return { crees, ignores };
}

function cleDoublon(r) {
  const a = (r && r.donnees && r.donnees.agronome) || {};
  return [String(a.nom || '').toLowerCase().trim(), String(a.contact || '').toLowerCase().trim(), String(a.date_relecture || '')].join('|');
}

/* --------------------------------- Lecture ------------------------------- */
function normaliserDoc(d) {
  if (!d) return d;
  return {
    ...d,
    id: d.id,
    cree_le: d.cree_le instanceof Date ? d.cree_le.toISOString() : d.cree_le
  };
}

export async function toutes() {
  if (etat.mode === 'mongo') {
    const docs = await Relecture.find({}).sort({ cree_le: -1 }).lean();
    return docs.map(normaliserDoc);
  }
  return chargerJson().relectures.slice().sort((a, b) => String(b.cree_le).localeCompare(String(a.cree_le)));
}

export async function parId(id) {
  if (etat.mode === 'mongo') {
    const doc = await Relecture.findOne({ id }).lean();
    return normaliserDoc(doc);
  }
  return chargerJson().relectures.find((r) => r.id === id) || null;
}

export async function supprimer(id) {
  if (etat.mode === 'mongo') {
    const doc = await Relecture.findOneAndDelete({ id }).lean();
    return doc ? normaliserDoc(doc) : null;
  }
  const base = chargerJson();
  const i = base.relectures.findIndex((r) => r.id === id);
  if (i === -1) return null;
  const [supprime] = base.relectures.splice(i, 1);
  sauverJson();
  return supprime;
}

export async function compter() {
  if (etat.mode === 'mongo') return Relecture.countDocuments({});
  return chargerJson().relectures.length;
}
