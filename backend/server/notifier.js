/* ==========================================================================
   server/notifier.js — notifications des formulaires reçus
   Trois canaux, dans cet ordre :
     1. journal local  : backend/data/notifications.jsonl  (toujours actif)
     2. e-mail         : via Resend, si RESEND_API_KEY est renseignée
     3. WhatsApp       : lien pré-rempli « wa.me » renvoyé à l'équipe
                         (l'envoi réellement automatique exigerait l'API
                          WhatsApp Business ; sans elle, un clic suffit)
   Les coordonnées de l'équipe se règlent dans le fichier .env :
     NOTIF_EMAIL=...      NOTIF_WHATSAPP=...
     CONTACT_EMAIL=... RESEND_API_KEY=... MAIL_FROM=...
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CULTURES, PARAMS, CHAMPS } from '../shared/model.js';
import { envoyerCourriel, gabaritHtml, etatCourriel } from './courriel.js';

const ICI = path.dirname(path.dirname(fileURLToPath(import.meta.url))); // …/backend
const DOSSIER_DATA = process.env.DATA_DIR || path.join(ICI, 'data');
const JOURNAL = path.join(DOSSIER_DATA, 'notifications.jsonl');

/* --------------------------- Configuration ------------------------------- */
const env = (cle, defaut = '') => String(process.env[cle] || defaut).trim();

export const config = {
  get email() { return env('NOTIF_EMAIL'); },
  get whatsapp() { return env('NOTIF_WHATSAPP'); },
  get nom() { return env('NOTIF_NOM', 'Équipe Plages agronomiques'); }
};

export function etatNotifications() {
  const c = etatCourriel();
  return {
    email_destinataire: config.email || c.destinataire || null,
    whatsapp_destinataire: config.whatsapp || null,
    nom_destinataire: config.nom,
    email_actif: Boolean(c.actif),
    resend_configure: Boolean(c.resend),
    fournisseur: 'resend',
    journal_actif: true,
    journal: JOURNAL,
    message: c.message
  };
}

/* ------------------------- Numéro au format international ---------------- */
export function normaliserNumero(brut) {
  let n = String(brut || '').replace(/[^\d+]/g, '');
  if (!n) return '';
  if (n.startsWith('+')) n = n.slice(1);
  // République démocratique du Congo : 0812345678 → 243812345678
  if (n.startsWith('0') && n.length >= 9) n = '243' + n.slice(1);
  return n;
}

const destinataire = () => etatCourriel().destinataire || config.email || null;

export const lienWhatsApp = (numero, texte) =>
  numero ? `https://wa.me/${normaliserNumero(numero)}?text=${encodeURIComponent(texte)}` : null;

/* ------------------------------ Résumé texte ----------------------------- */
export function resumeTexte(rec) {
  const a = rec.donnees.agronome;
  const lignes = [];
  lignes.push(`Référence : ${rec.reference}`);
  lignes.push(`Agronome : ${a.nom} — ${a.organisation}`);
  lignes.push(`Contact : ${a.contact}`);
  lignes.push(`Date de relecture : ${a.date_relecture}`);
  lignes.push(`Reçu le : ${new Date(rec.cree_le).toLocaleString('fr-FR')}`);
  lignes.push(`Citation du nom : ${a.accord ? 'acceptée' : 'refusée (relecture anonyme)'}`);
  lignes.push('');
  CULTURES.forEach((cul) => {
    const c = rec.donnees.cultures[cul.id];
    if (!c) return;
    const lignesParam = [];
    PARAMS.forEach((p) => {
      const v = (c.parametres || {})[p.id] || {};
      if (!CHAMPS.some((ch) => String(v[ch.id] || '').trim() !== '')) return;
      const bornes = CHAMPS.map((ch) => (String(v[ch.id] || '').trim() === '' ? '—' : v[ch.id])).join(' / ');
      lignesParam.push(`  - ${p.nom} (${p.unite}) : ${bornes} [${v.statut}] — source : ${v.source || 'non indiquée'}`);
    });
    if (lignesParam.length || String(c.remarques || '').trim()) {
      lignes.push(`${cul.nom}${c.zone ? ` (zone : ${c.zone})` : ''}`);
      lignes.push(...lignesParam);
      if (String(c.remarques || '').trim()) lignes.push(`  Remarques : ${c.remarques}`);
      lignes.push('');
    }
  });
  return lignes.join('\n').trim();
}

/* ------------------------------- Envoi e-mail ---------------------------- */
async function envoyerEmail(rec, texte) {
  const cible = destinataire();
  if (!cible) return { envoye: false, raison: 'destinataire_absent' };

  // rec.resume vient de resumeRelecture() : agronome est un objet
  const r = rec.resume || {};
  const a = r.agronome || rec.donnees.agronome || {};
  const resume = {
    nom: a.nom || '',
    organisation: a.organisation || '',
    contact: a.contact || '',
    date: a.date_relecture || '',
    accord: Boolean(a.accord),
    cultures: r.cultures_renseignees ?? null,
    valeurs: r.valeurs ?? null
  };
  const echappe = (t) => String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html = gabaritHtml({
    titre: `Nouvelle relecture — ${rec.reference}`,
    sousTitre: `${resume.nom} · ${resume.organisation}`,
    corps: `
      <p style="margin:0 0 14px;font-size:14px;line-height:1.6">
        <strong>Contact :</strong> ${echappe(resume.contact) || '—'}<br>
        <strong>Date de relecture :</strong> ${echappe(resume.date) || '—'}<br>
        <strong>Citation du nom :</strong> ${resume.accord ? 'acceptée' : 'refusée'}
      </p>
      <p style="margin:0 0 14px;font-size:14px">
        <strong>${resume.cultures ?? 0} culture(s) renseignée(s)</strong> — ${resume.valeurs ?? 0} borne(s) saisie(s).
      </p>
      <pre style="margin:0;padding:14px;background:#faf6ec;border:1px solid #e9dfc9;border-radius:10px;white-space:pre-wrap;font-size:12.5px;line-height:1.55">${echappe(texte)}</pre>`,
    pied: 'Message automatique de la plateforme « Plages agronomiques ».'
  });

  return envoyerCourriel({
    destinataire: config.email || undefined,
    sujet: resume.nom ? `[Plages agronomiques] Nouvelle relecture ${rec.reference} — ${resume.nom}` : `[Plages agronomiques] Message de test — ${rec.reference}`,
    texte: `Nouvelle relecture ${rec.reference}\n\n${texte}`,
    html
  });
}

/* -------------------------------- Journal -------------------------------- */
function journaliser(entree) {
  try {
    fs.mkdirSync(DOSSIER_DATA, { recursive: true });
    fs.appendFileSync(JOURNAL, JSON.stringify(entree) + '\n', 'utf8');
  } catch (e) {
    console.error('[notif] impossible d’écrire le journal :', e.message);
  }
}

export function dernieresNotifications(n = 20) {
  try {
    if (!fs.existsSync(JOURNAL)) return [];
    const lignes = fs.readFileSync(JOURNAL, 'utf8').trim().split('\n').filter(Boolean);
    return lignes.slice(-n).reverse().map((l) => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(Boolean);
  } catch {
    return [];
  }
}

/* ------------------------------ Point d'entrée --------------------------- */
export async function notifier(rec) {
  const texte = resumeTexte(rec);
  const numero = config.whatsapp;
  const entree = {
    date: new Date().toISOString(),
    reference: rec.reference,
    id: rec.id,
    agronome: rec.donnees.agronome.nom,
    contact: rec.donnees.agronome.contact,
    email: { actif: false, destinataire: config.email || null, erreur: null },
    whatsapp: { destinataire: numero || null, lien: lienWhatsApp(numero, `Nouvelle relecture ${rec.reference} — ${rec.donnees.agronome.nom}\n\n${texte.slice(0, 900)}`) }
  };

  try {
    const r = await envoyerEmail(rec, texte);
    entree.email.actif = Boolean(r.envoye);
    if (!r.envoye && r.raison) entree.email.note = r.raison;
  } catch (e) {
    entree.email.erreur = e.message;
    console.error('[notif] e-mail non envoyé :', e.message);
  }

  journaliser(entree);
  return entree;
}
