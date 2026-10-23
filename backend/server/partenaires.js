/* ==========================================================================
   server/partenaires.js — dossiers « Devenir partenaire »
   • stockage MongoDB (collection partenaires) + repli fichier JSON
   • référence lisible PT-année-numéro
   • notification e-mail par Resend, journal local toujours écrit
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { normaliserDossier, validerDossier, resumeTexte } from '../shared/partenaires.js';
import { envoyerCourriel, gabaritHtml, destinataireEquipe, etatCourriel } from './courriel.js';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const FICHIER = path.join(DATA_DIR, 'partenaires.json');
const JOURNAL = path.join(DATA_DIR, 'partenaires-notifications.jsonl');

/* --------------------------------- Modèle -------------------------------- */
const DossierSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  reference: { type: String, required: true, unique: true, index: true },
  cree_le: { type: Date, default: Date.now, index: true },
  statut: { type: String, enum: ['NOUVEAU', 'EN_ECHANGE', 'QUALIFIE', 'ECARTE'], default: 'NOUVEAU', index: true },
  empreinte_ip: String,
  agent_utilisateur: String,
  donnees: { type: Object, required: true },
  notification: { type: Object, default: {} }
}, { timestamps: true, minimize: false });

export const Partenaire = mongoose.models.Partenaire || mongoose.model('Partenaire', DossierSchema);

const modeMongo = () => mongoose.connection.readyState === 1;

/* ------------------------------ Repli JSON ------------------------------- */
function lireFichier() {
  try {
    if (!fs.existsSync(FICHIER)) return [];
    const p = JSON.parse(fs.readFileSync(FICHIER, 'utf8'));
    return Array.isArray(p.dossiers) ? p.dossiers : [];
  } catch {
    return [];
  }
}
function ecrireFichier(dossiers) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${FICHIER}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify({ dossiers }, null, 1), 'utf8');
  fs.renameSync(tmp, FICHIER);
}
function journaliser(entree) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.appendFileSync(JOURNAL, JSON.stringify(entree) + '\n', 'utf8');
  } catch (e) {
    console.error('[partenaires] journal impossible :', e.message);
  }
}

/* ------------------------------ Références ------------------------------- */
export async function prochaineReference() {
  const annee = new Date().getFullYear();
  const prefixe = `PT-${annee}-`;
  let n = 0;
  if (modeMongo()) {
    n = await Partenaire.countDocuments({ reference: { $regex: `^${prefixe}` } });
  } else {
    n = lireFichier().filter((d) => String(d.reference || '').startsWith(prefixe)).length;
  }
  return `${prefixe}${String(n + 1).padStart(4, '0')}`;
}

export const empreinteIP = (ip) =>
  ip ? crypto.createHash('sha256').update(`pt:${ip}:${process.env.SECRET_SEL || 'sel-local'}`).digest('hex').slice(0, 16) : null;

/* ------------------------------- Création -------------------------------- */
export async function creerDossier({ brut, ip, agent }) {
  const donnees = normaliserDossier(brut);
  const v = validerDossier(donnees);
  if (!v.valide) return { ok: false, erreurs: v.erreurs };

  const dossier = {
    id: crypto.randomBytes(9).toString('hex'),
    reference: await prochaineReference(),
    cree_le: new Date().toISOString(),
    statut: 'NOUVEAU',
    empreinte_ip: empreinteIP(ip),
    agent_utilisateur: String(agent || '').slice(0, 300),
    donnees,
    notification: {}
  };

  // 1) Enregistrement : le dossier est conservé même si l'e-mail échoue.
  if (modeMongo()) {
    const doc = await Partenaire.create(dossier);
    dossier.cree_le = new Date(dossier.cree_le);
    dossier._id = doc._id;
  } else {
    const tous = lireFichier();
    tous.push(dossier);
    ecrireFichier(tous);
  }

  // 2) Notification de l'équipe.
  const texte = resumeTexte(dossier);
  const ri = dossier.donnees.identite;
  const html = gabaritHtml({
    titre: `Nouveau dossier partenaire — ${dossier.reference}`,
    sousTitre: `${ri.prenom} ${ri.nom} · ${ri.organisation}`,
    corps: `
      <p style="margin:0 0 14px;font-size:14px;line-height:1.6">
        Un dossier a été déposé depuis le formulaire « Devenir partenaire ».
        Répondez directement à ce message pour écrire au candidat.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:13.5px">
        <tr><td style="padding:6px 0;color:#5c665f;width:42%">Référence</td><td style="padding:6px 0;font-weight:600">${dossier.reference}</td></tr>
        <tr><td style="padding:6px 0;color:#5c665f">Candidat</td><td style="padding:6px 0;font-weight:600">${ri.prenom} ${ri.nom}</td></tr>
        <tr><td style="padding:6px 0;color:#5c665f">Organisation</td><td style="padding:6px 0">${ri.organisation}</td></tr>
        <tr><td style="padding:6px 0;color:#5c665f">E-mail</td><td style="padding:6px 0">${ri.email}</td></tr>
        <tr><td style="padding:6px 0;color:#5c665f">Téléphone / WhatsApp</td><td style="padding:6px 0">${ri.telephone}</td></tr>
      </table>
      <pre style="margin:18px 0 0;padding:14px;background:#faf6ec;border:1px solid #e9dfc9;border-radius:10px;white-space:pre-wrap;font-size:12.5px;line-height:1.55;color:#16211b">${texte
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`,
    pied: `Dossier ${dossier.reference} · reçu le ${new Date(dossier.cree_le).toLocaleString('fr-FR')} · notification envoyée à ${destinataireEquipe() || '—'}`
  });

  const envoi = await envoyerCourriel({
    sujet: `[AGRIKONNECT] ${dossier.reference} — ${ri.prenom} ${ri.nom} (${ri.organisation})`,
    texte: `Nouveau dossier partenaire\n\n${texte}`,
    html,
    repondreA: ri.email
  });

  dossier.notification = {
    date: new Date().toISOString(),
    envoye: Boolean(envoi.envoye),
    fournisseur: envoi.fournisseur || null,
    raison: envoi.raison || null,
    message: envoi.message || null,
    destinataire: destinataireEquipe() || null
  };

  if (modeMongo()) {
    await Partenaire.updateOne({ id: dossier.id }, { $set: { notification: dossier.notification } }).catch(() => {});
  } else {
    const tous = lireFichier();
    const i = tous.findIndex((d) => d.id === dossier.id);
    if (i > -1) { tous[i] = dossier; ecrireFichier(tous); }
  }

  journaliser({
    date: dossier.notification.date,
    reference: dossier.reference,
    id: dossier.id,
    candidat: `${ri.prenom} ${ri.nom}`,
    organisation: ri.organisation,
    email: envoi
  });

  return { ok: true, dossier };
}

/* -------------------------------- Lecture -------------------------------- */
export async function tousDossiers() {
  if (modeMongo()) {
    const docs = await Partenaire.find({}).sort({ cree_le: -1 }).lean();
    return docs.map((d) => ({ ...d, cree_le: d.cree_le instanceof Date ? d.cree_le.toISOString() : d.cree_le }));
  }
  return lireFichier().slice().sort((a, b) => String(b.cree_le).localeCompare(String(a.cree_le)));
}

export async function compter() {
  if (modeMongo()) return Partenaire.countDocuments({});
  return lireFichier().length;
}

export async function changerStatut(id, statut) {
  const valides = ['NOUVEAU', 'EN_ECHANGE', 'QUALIFIE', 'ECARTE'];
  if (!valides.includes(statut)) return false;
  if (modeMongo()) {
    const r = await Partenaire.updateOne({ id }, { $set: { statut } });
    return r.matchedCount > 0;
  }
  const tous = lireFichier();
  const d = tous.find((x) => x.id === id);
  if (!d) return false;
  d.statut = statut;
  ecrireFichier(tous);
  return true;
}

export { etatCourriel };
