/* ==========================================================================
   server/index.js — API Express (parité complète avec la version classique)
   Monté aussi sur le serveur de développement Vite via proxy /api.
   ========================================================================== */
import './env.js';
import express from 'express';
import compression from 'compression';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { valider, normaliser, calculerStats, resumePublic, resumeRelecture, CULTURES, PARAMS, CHAMPS, ZONES, STATUTS, ECOCROP_CHAMPS } from '../shared/model.js';
import { exporter, modele, importer } from '../shared/csv.js';
import * as db from './db.js';
import { estAdmin, creerSession, detruireSession, verifierCode, jetonPdf, tropDeRequetes, lireCookies } from './auth.js';
import { detecterPython, genererPdf, etatPdf } from './pdf.js';
import { notifier, etatNotifications, dernieresNotifications } from './notifier.js';
import { envoyerCourriel, gabaritHtml, etatCourriel } from './courriel.js';
import {
  TYPES_PARTIE, APPORTS, DOMAINES, NIVEAUX, PAYS, PROVINCES_RDC, ZONES_ACTION,
  PORTEES, DEVISES, TICKETS, DISPONIBILITES, CANAUX, ETAPES_PARTENAIRE, LIMITES,
  validerDossier, normaliserDossier, resumeCourt
} from '../shared/partenaires.js';
import * as partenaires from './partenaires.js';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PORT = Number(process.env.PORT || 4000);
const DIST = path.join(ROOT, '..', 'frontend', 'dist');
const DEMO = process.env.DEMO !== '0';

const app = express();
app.disable('x-powered-by');
app.use(compression());
const originesAutorisees = new Set([
  ...(process.env.FRONTEND_URL || '').split(',').map((s) => s.trim()).filter(Boolean),
  'http://localhost:3000',
  'http://localhost:5173'
]);
app.use((req, res, next) => {
  const origine = req.get('Origin');
  if (origine && originesAutorisees.has(origine)) {
    res.setHeader('Access-Control-Allow-Origin', origine);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ extended: true, limit: '3mb' }));
app.use(express.text({ type: ['text/csv', 'text/plain'], limit: '5mb' }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

const ipDe = (req) => (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '';

/* Coordonnées de l'équipe, affichées sur le site (pied de page, guide, récapitulatif) */
function contactEquipe() {
  const n = etatNotifications();
  const numero = n.whatsapp_destinataire ? String(n.whatsapp_destinataire) : '';
  return {
    nom: n.nom_destinataire,
    email: n.email_destinataire,
    whatsapp: numero || null,
    whatsapp_lien: numero ? `https://wa.me/${String(numero).replace(/[^\d+]/g, '').replace(/^\+/, '')}` : null
  };
}

/* -------------------------------- Santé --------------------------------- */
app.get('/api/health', async (req, res) => {
  // Si Python/PyMuPDF n'était pas disponible au démarrage, on réessaie à la demande :
  // ainsi le bouton « PDF rempli » apparaît sans redémarrer le serveur.
  if (!etatPdf.disponible) await detecterPython();
  const documents = await db.compter().catch(() => null);
  res.json({
    ok: true,
    version: '2.0.0',
    pdf: etatPdf.disponible,
    pdf_message: etatPdf.message,
    stockage: db.etat.mode,
    mongo: db.etat.mongo,
    base: db.etat.base,
    uri: db.etat.uri,
    exigence_mongo: db.etat.obligatoire,
    mongodb_erreur: db.etat.erreur,
    documents,
    notifications: etatNotifications(),
    ports: { api: PORT },
    horodatage: new Date().toISOString()
  });
});

app.get('/api/config', (req, res) => {
  res.json({
    cultures: CULTURES, zones: ZONES, statuts: STATUTS, parametres: PARAMS,
    champs: CHAMPS, ecocrop: ECOCROP_CHAMPS,
    limites: { nom: 120, organisation: 160, contact: 160, source: 600, remarques: 3000, url: 500 },
    stockage: db.etat.mode, pdf: etatPdf.disponible,
    contact: contactEquipe()
  });
});

/* ------------------------------ Relectures ------------------------------ */
app.post('/api/relectures', async (req, res, next) => {
  try {
    const ip = ipDe(req);
    if (tropDeRequetes(`post:${ip}`, 40, 60_000)) {
      return res.status(429).json({ ok: false, message: 'Trop d’envois en peu de temps. Patientez une minute puis réessayez.' });
    }
    const donnees = normaliser(req.body || {});
    const v = valider(donnees);
    if (!v.valide) return res.status(400).json({ ok: false, erreurs: v.erreurs, alertes: v.alertes });

    const rec = await db.creer({
      donnees,
      empreinte_ip: db.empreinteIP(ip),
      agent_utilisateur: String(req.headers['user-agent'] || '').slice(0, 300),
      source_saisie: 'web',
      validite: { alertes: v.alertes, valeurs: v.totalValeurs }
    });
    // Notification de l'équipe (journal local + e-mail Resend si la clé est renseignée).
    // Un échec d'envoi ne doit jamais empêcher l'enregistrement de la relecture.
    let notification = null;
    try {
      notification = await notifier({ ...rec, resume: resumeRelecture(rec) });
    } catch (e) {
      console.error('[notif] erreur inattendue :', e.message);
    }

    res.status(201).json({
      ok: true,
      reference: rec.reference,
      id: rec.id,
      jetons_pdf: jetonPdf(rec.id),
      alertes: v.alertes,
      resume: resumeRelecture(rec),
      notification: notification
        ? { email_envoye: notification.email.actif, whatsapp_lien: notification.whatsapp.lien }
        : null
    });
  } catch (e) { next(e); }
});

app.get('/api/relectures', async (req, res, next) => {
  try {
    if (!estAdmin(req)) return res.status(401).json({ ok: false, message: 'Code administrateur requis.' });
    const tous = await db.toutes();
    const q = String(req.query.q || '').toLowerCase().trim();
    let liste = tous;
    if (q) {
      liste = tous.filter((r) => {
        const a = r.donnees.agronome;
        return [r.reference, a.nom, a.organisation, a.contact].join(' ').toLowerCase().includes(q);
      });
    }
    res.json({ ok: true, total: tous.length, affichees: liste.length, relectures: liste.map((r) => ({
      id: r.id, reference: r.reference, cree_le: r.cree_le, source_saisie: r.source_saisie,
      agronome: r.donnees.agronome, validite: r.validite,
      cultures: CULTURES.filter((c) => r.donnees.cultures[c.id]).map((c) => c.nom)
    })) });
  } catch (e) { next(e); }
});

app.get('/api/relectures/:id', async (req, res, next) => {
  try {
    if (!estAdmin(req) && req.query.jeton !== jetonPdf(req.params.id)) {
      return res.status(401).json({ ok: false, message: 'Accès non autorisé.' });
    }
    const rec = await db.parId(req.params.id);
    if (!rec) return res.status(404).json({ ok: false, message: 'Relecture introuvable.' });
    res.json({ ok: true, relecture: rec, resume: resumeRelecture(rec) });
  } catch (e) { next(e); }
});

app.delete('/api/relectures/:id', async (req, res, next) => {
  try {
    if (!estAdmin(req)) return res.status(401).json({ ok: false, message: 'Code administrateur requis.' });
    const rec = await db.supprimer(req.params.id);
    if (!rec) return res.status(404).json({ ok: false, message: 'Relecture introuvable.' });
    res.json({ ok: true, reference: rec.reference });
  } catch (e) { next(e); }
});

/* --------------------------------- PDF ---------------------------------- */
app.get('/api/relectures/:id/pdf', async (req, res, next) => {
  try {
    if (!estAdmin(req) && req.query.jeton !== jetonPdf(req.params.id)) {
      return res.status(401).json({ ok: false, message: 'Accès non autorisé.' });
    }
    const rec = await db.parId(req.params.id);
    if (!rec) return res.status(404).json({ ok: false, message: 'Relecture introuvable.' });
    if (!etatPdf.disponible) await detecterPython();
    const buf = await genererPdf(rec);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${rec.reference}.pdf"`);
    res.send(buf);
  } catch (e) {
    if (e.statut) return res.status(e.statut).json({ ok: false, message: e.message });
    next(e);
  }
});

/* ------------------------------ Export CSV ------------------------------ */
app.get('/api/export.csv', async (req, res, next) => {
  try {
    if (!estAdmin(req)) return res.status(401).json({ ok: false, message: 'Code administrateur requis.' });
    const tous = await db.toutes();
    const csv = exporter(tous);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="plages-agronomiques-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send('\uFEFF' + csv);
  } catch (e) { next(e); }
});

app.get('/api/modele.csv', (req, res) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="modele-plages-agronomiques.csv"');
  res.send('\uFEFF' + modele());
});

/* -------------------------------- Import -------------------------------- */
app.post('/api/import', async (req, res, next) => {
  try {
    if (!estAdmin(req)) return res.status(401).json({ ok: false, message: 'Code administrateur requis.' });
    const texte = typeof req.body === 'string'
      ? req.body
      : (typeof req.body?.csv === 'string' ? req.body.csv : '');
    if (!texte.trim()) return res.status(400).json({ ok: false, message: 'Aucun contenu CSV reçu.' });
    const { enregistrements, erreurs } = importer(texte);
    if (!enregistrements.length) {
      return res.status(400).json({ ok: false, message: 'Aucune ligne exploitable.', erreurs });
    }
    const prepares = [];
    const rejets = [];
    enregistrements.forEach((r) => {
      const donnees = normaliser(r.donnees);
      const v = valider(donnees);
      if (v.valide) prepares.push({ donnees, validite: { alertes: v.alertes, valeurs: v.totalValeurs } });
      else rejets.push({ nom: donnees.agronome.nom, raison: v.erreurs[0]?.message || 'invalide' });
    });
    const { crees, ignores } = await db.creerLot(prepares);
    res.json({
      ok: true, importees: crees.length, doublons: ignores.length, rejetees: rejets.length,
      references: crees.map((c) => c.reference), erreurs: [...erreurs, ...rejets.map((r) => `${r.nom} : ${r.raison}`)]
    });
  } catch (e) {
    res.status(400).json({ ok: false, message: e.message });
  }
});

/* ---------------------------- Statistiques ------------------------------ */
app.get('/api/stats', async (req, res, next) => {
  try {
    if (!estAdmin(req)) return res.status(401).json({ ok: false, message: 'Code administrateur requis.' });
    const tous = await db.toutes();
    res.json({ ok: true, stats: calculerStats(tous) });
  } catch (e) { next(e); }
});

app.get('/api/resume-public', async (req, res, next) => {
  try {
    const tous = await db.toutes();
    res.json({ ok: true, resume: resumePublic(tous) });
  } catch (e) { next(e); }
});

/* ----------------------------- Administration --------------------------- */
app.post('/api/admin/connexion', (req, res) => {
  const ip = ipDe(req);
  if (tropDeRequetes(`login:${ip}`, 8, 5 * 60_000)) {
    return res.status(429).json({ ok: false, message: 'Trop de tentatives. Réessayez dans quelques minutes.' });
  }
  if (!verifierCode(req.body?.code)) {
    return res.status(401).json({ ok: false, message: 'Code incorrect.' });
  }
  const { cookie } = creerSession();
  res.setHeader('Set-Cookie', cookie);
  res.json({ ok: true, message: 'Connexion réussie.' });
});

app.get('/api/admin/notifications', (req, res) => {
  if (!estAdmin(req)) return res.status(401).json({ ok: false, message: 'Code administrateur requis.' });
  res.json({ ok: true, reglages: etatNotifications(), recentes: dernieresNotifications(30) });
});

app.post('/api/admin/notifications/test', async (req, res) => {
  if (!estAdmin(req)) return res.status(401).json({ ok: false, message: 'Code administrateur requis.' });
  const configuration = etatNotifications();
  if (!configuration.email_actif) {
    return res.status(400).json({ ok: false, message: configuration.message });
  }
  try {
    await notifier({
      id: 'test-' + Date.now(),
      reference: 'TEST-' + new Date().toISOString().slice(0, 10),
      cree_le: new Date().toISOString(),
      donnees: {
        agronome: { nom: 'Test de notification', organisation: 'Équipe du projet', contact: configuration.email_destinataire, date_relecture: new Date().toLocaleDateString('fr-FR'), accord: false },
        cultures: { manioc: { id: 'manioc', zone: 'Les deux', nom_scientifique: '', ecocrop: {}, parametres: { ph: { imin: '5,5', imax: '6,5', tmin: '', tmax: '', source: 'Test', statut: 'PROVISIONAL' } }, remarques: 'Ceci est un message de test.' } }
      },
      resume: { agronome: 'Test de notification', organisation: 'Équipe du projet', contact: configuration.email_destinataire, date: new Date().toLocaleDateString('fr-FR'), accord: false, valeurs: 2, cultures: 1 }
    });
    res.json({ ok: true, message: `E-mail de test envoyé à ${configuration.email_destinataire}.` });
  } catch (e) {
    res.status(500).json({ ok: false, message: `Échec de l’envoi : ${e.message}` });
  }
});

app.post('/api/admin/deconnexion', (req, res) => {
  detruireSession(req);
  res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  res.json({ ok: true });
});

app.get('/api/admin/session', (req, res) => {
  res.json({ ok: true, admin: estAdmin(req) });
});

/* ========================================================================
   PROGRAMME « DEVENIR PARTENAIRE »
   ======================================================================== */

/* Référentiel public : le formulaire se construit à partir de ces listes. */
app.get('/api/partenaires/config', (req, res) => {
  res.json({
    ok: true,
    etapes: ETAPES_PARTENAIRE,
    types_partie: TYPES_PARTIE,
    apports: APPORTS,
    domaines: DOMAINES,
    niveaux: NIVEAUX,
    pays: PAYS,
    provinces_rdc: PROVINCES_RDC,
    zones_action: ZONES_ACTION,
    portees: PORTEES,
    devises: DEVISES,
    tickets: TICKETS,
    disponibilites: DISPONIBILITES,
    canaux: CANAUX,
    limites: LIMITES,
    contact: contactEquipe(),
    email_actif: etatCourriel().actif,
    stockage: db.etat.mode
  });
});

/* Dépôt d'un dossier (5 étapes côté interface, validé de nouveau ici). */
app.post('/api/partenaires', async (req, res, next) => {
  try {
    const ip = ipDe(req);
    if (tropDeRequetes(`partenaire:${ip}`, 12, 60 * 60_000)) {
      return res.status(429).json({ ok: false, message: 'Trop de dossiers envoyés depuis cette connexion. Écrivez-nous directement par e-mail.' });
    }
    // Piège à robots : champ invisible qui doit rester vide.
    if (String(req.body?.site_web || '').trim()) {
      return res.status(400).json({ ok: false, message: 'Envoi refusé.' });
    }
    const r = await partenaires.creerDossier({
      brut: req.body?.donnees || req.body,
      ip,
      agent: req.headers['user-agent']
    });
    if (!r.ok) {
      return res.status(400).json({ ok: false, message: 'Le dossier contient des informations à compléter.', erreurs: r.erreurs });
    }
    res.status(201).json({
      ok: true,
      reference: r.dossier.reference,
      cree_le: r.dossier.cree_le,
      email: {
        envoye: Boolean(r.dossier.notification.envoye),
        destinataire: r.dossier.notification.destinataire,
        raison: r.dossier.notification.raison || null
      },
      contact: contactEquipe()
    });
  } catch (e) { next(e); }
});

/* Vérification de la configuration e-mail (admin) */
app.post('/api/admin/partenaires/test-email', async (req, res) => {
  if (!estAdmin(req)) return res.status(401).json({ ok: false, message: 'Code administrateur requis.' });
  const etat = etatCourriel();
  if (!etat.actif) return res.status(400).json({ ok: false, message: etat.message });
  try {
    const r = await envoyerCourriel({
      sujet: '[AGRIKONNECT] Test de configuration e-mail',
      texte: 'Ceci est un message de test envoyé depuis la plateforme. Si vous le recevez, les dossiers partenaires vous parviendront aussi.',
      html: gabaritHtml({
        titre: 'Test de configuration e-mail',
        sousTitre: 'Programme Devenir partenaire',
        corps: '<p style="margin:0;font-size:14px;line-height:1.6">Ceci est un message de test envoyé depuis la plateforme. Si vous le recevez, les dossiers partenaires vous parviendront aussi.</p>',
        pied: `Destinataire : ${etat.destinataire} · Expéditeur : ${etat.expediteur || '—'}`
      })
    });
    if (!r.envoye) return res.status(502).json({ ok: false, message: `Envoi refusé : ${r.message || r.raison}`, etat });
    res.json({ ok: true, message: `E-mail de test envoyé à ${etat.destinataire}.`, fournisseur: r.fournisseur, etat });
  } catch (e) {
    res.status(500).json({ ok: false, message: `Échec de l’envoi : ${e.message}` });
  }
});

/* Liste des dossiers (admin) */
app.get('/api/admin/partenaires', async (req, res, next) => {
  try {
    if (!estAdmin(req)) return res.status(401).json({ ok: false, message: 'Code administrateur requis.' });
    const tous = await partenaires.tousDossiers();
    const q = String(req.query.q || '').toLowerCase().trim();
    const filtres = q
      ? tous.filter((d) => {
          const i = d.donnees.identite;
          return [d.reference, i.nom, i.prenom, i.organisation, i.email, d.donnees.localisation.pays, d.statut]
            .join(' ').toLowerCase().includes(q);
        })
      : tous;
    res.json({
      ok: true,
      total: tous.length,
      affiches: filtres.length,
      email: etatCourriel(),
      dossiers: filtres.map((d) => ({
        ...resumeCourt(d),
        id: d.id,
        statut: d.statut || 'NOUVEAU',
        notification: d.notification || {},
        apport: d.donnees.apport,
        localisation: d.donnees.localisation,
        autres: d.donnees.autres
      }))
    });
  } catch (e) { next(e); }
});

app.patch('/api/admin/partenaires/:id', async (req, res, next) => {
  try {
    if (!estAdmin(req)) return res.status(401).json({ ok: false, message: 'Code administrateur requis.' });
    const ok = await partenaires.changerStatut(req.params.id, String(req.body?.statut || ''));
    if (!ok) return res.status(404).json({ ok: false, message: 'Dossier introuvable ou statut invalide.' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

app.get('/api/admin/partenaires.csv', async (req, res, next) => {
  try {
    if (!estAdmin(req)) return res.status(401).json({ ok: false, message: 'Code administrateur requis.' });
    const tous = await partenaires.tousDossiers();
    const entetes = ['reference', 'date', 'statut', 'nom', 'prenom', 'organisation', 'fonction', 'type', 'email', 'telephone',
      'apports', 'ticket', 'montant', 'devise', 'disponibilite', 'domaines', 'pays', 'province', 'ville', 'zone_action', 'portee',
      'appel', 'consentement', 'message'];
    const echappe = (v) => `"${String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
    const lignes = [entetes.join(',')];
    tous.forEach((d) => {
      const i = d.donnees.identite;
      lignes.push([
        d.reference, new Date(d.cree_le).toISOString().slice(0, 10), d.statut || 'NOUVEAU',
        i.nom, i.prenom, i.organisation, i.fonction, i.type_partie, i.email, i.telephone,
        d.donnees.apport.natures.join(' | '), d.donnees.apport.ticket, d.donnees.apport.montant, d.donnees.apport.devise,
        d.donnees.apport.disponibilite,
        d.donnees.domaines.map((x) => `${x.id} (${x.annees} ans)`).join(' | '),
        d.donnees.localisation.pays, d.donnees.localisation.province, d.donnees.localisation.ville,
        d.donnees.localisation.zone_action, d.donnees.localisation.portee,
        d.donnees.autres.appel ? 'oui' : 'non',
        d.donnees.autres.consentement_contact ? 'oui' : 'non',
        d.donnees.autres.message
      ].map(echappe).join(','));
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="partenaires-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send('\uFEFF' + lignes.join('\r\n'));
  } catch (e) { next(e); }
});

/* Validation à la volée (utile pour un aperçu sans enregistrement) */
app.post('/api/partenaires/verifier', (req, res) => {
  const d = normaliserDossier(req.body?.donnees || req.body);
  const v = validerDossier(d);
  res.json({ ok: true, ...v });
});

/* --------------------------- Application React -------------------------- */
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST, { index: false, maxAge: '1h' }));
  app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ressource introuvable.' });
});

app.use((err, req, res, _next) => {
  console.error('[erreur]', err);
  res.status(500).json({ ok: false, message: 'Erreur interne du serveur.' });
});

db.connecter()
  .then((etat) => {
    if (etat.mode !== 'mongo' && etat.obligatoire) {
      console.error('[db] Arrêt : MongoDB est exigé (MONGO_REQUIRED=1) mais n’est pas joignable.');
      process.exit(1);
    }
    detecterPython().then(() => {
      app.listen(PORT, '0.0.0.0', () => {
        const stockage = etat.mode === 'mongo'
          ? `MongoDB — base « ${etat.base} » (${etat.uri})`
          : 'fichier JSON (data/relectures.json) — MongoDB non joignable';
        console.log('');
        console.log('  ┌───────────────────────────────────────────────────────────────┐');
        console.log('  │  Plateforme « Plages agronomiques » — serveur Express (API)    │');
        console.log('  └───────────────────────────────────────────────────────────────┘');
        console.log(`   API / site compilé : http://localhost:${PORT}`);
        console.log(`   Stockage           : ${stockage}`);
        console.log(`   Base interrogée    : ${etat.base || '—'}`);
        console.log(`   PDF rempli         : ${etatPdf.disponible ? 'disponible' : 'indisponible (facultatif)'}`);
        console.log('   Arrêt              : Ctrl + C');
        console.log('');
      });
    });
  })
  .catch((e) => {
    console.error('[db] Impossible de démarrer :', e.message);
    process.exit(1);
  });

export { app };
