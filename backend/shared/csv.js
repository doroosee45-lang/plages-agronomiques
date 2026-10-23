/* ==========================================================================
   shared/csv.js — export / import CSV (séparateur « ; », ré-importable)
   Une ligne = une culture × un paramètre. Utilisé par le serveur Express.
   ========================================================================== */
import { CULTURES, PARAMS, CHAMPS, ZONES, ECOCROP_CHAMPS, getCulture, getParam, cultureVide, aujourdhuiFr, normaliser, valider } from './model.js';

export const COLONNES = [
  'reference', 'date_saisie', 'source_saisie', 'nom', 'organisation', 'contact',
  'accord_validation', 'date_relecture', 'culture_id', 'culture', 'nom_scientifique', 'zone',
  'parametre_id', 'parametre', 'unite', 'ideal_min', 'ideal_max', 'tolere_min', 'tolere_max',
  'source_precise', 'statut', 'remarques_culture',
  'eco_ph_imin', 'eco_ph_imax', 'eco_ph_tmin', 'eco_ph_tmax',
  'eco_t_imin', 'eco_t_imax', 'eco_t_tmin', 'eco_t_tmax', 'eco_url', 'eco_date'
];

function cellule(v) {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=@]/.test(s) || (/^[+\-]/.test(s) && !/^[+\-]?[\d\s().\-]+$/.test(s))) s = `'${s}`;
  if (/[";\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exporter(records) {
  const lignes = [COLONNES.join(';')];
  records.forEach((r) => {
    const d = r.donnees || {};
    const a = d.agronome || {};
    CULTURES.forEach((cul) => {
      const c = (d.cultures || {})[cul.id] || {};
      const eco = c.ecocrop || {};
      PARAMS.forEach((p) => {
        const v = (c.parametres || {})[p.id] || {};
        lignes.push([
          r.reference, String(r.cree_le || '').slice(0, 19).replace('T', ' '), r.source_saisie || 'web',
          a.nom, a.organisation, a.contact, a.accord ? 'oui' : 'non', a.date_relecture,
          cul.id, cul.nom, c.nom_scientifique || '', c.zone || '',
          p.id, p.nom, p.unite,
          v.imin, v.imax, v.tmin, v.tmax, v.source, v.statut || 'PROVISIONAL',
          String(c.remarques || '').replace(/\r?\n/g, ' '),
          eco.ph_imin, eco.ph_imax, eco.ph_tmin, eco.ph_tmax,
          eco.t_imin, eco.t_imax, eco.t_tmin, eco.t_tmax, eco.url, eco.date
        ].map(cellule).join(';'));
      });
    });
  });
  return `${lignes.join('\r\n')}\r\n`;
}

export function modele() {
  const exemple = {
    reference: '', cree_le: '', source_saisie: 'csv',
    donnees: {
      agronome: { nom: 'Nom et prénom', organisation: 'Fonction / organisation', contact: 'téléphone ou e-mail', date_relecture: aujourdhuiFr(), accord: false },
      cultures: {}
    }
  };
  CULTURES.forEach((c) => {
    const cv = cultureVide(c.id);
    cv.parametres.ph.imin = '5,5';
    cv.parametres.ph.imax = '6,5';
    cv.parametres.ph.source = 'Exemple : INERA, 2018, p. 42';
    cv.parametres.ph.statut = 'VALIDATED';
    cv.remarques = c.id === 'manioc' ? 'Exemple de remarque : sols sableux / argileux.' : '';
    exemple.donnees.cultures[c.id] = cv;
  });
  return exporter([exemple]);
}

export function detecterSeparateur(texte) {
  const premiere = String(texte).replace(/^\ufeff/, '').split(/\r?\n/)[0] || '';
  let pv = 0, virgule = 0, entreGuillemets = false;
  for (const ch of premiere) {
    if (ch === '"') entreGuillemets = !entreGuillemets;
    else if (!entreGuillemets && ch === ';') pv++;
    else if (!entreGuillemets && ch === ',') virgule++;
  }
  return virgule > pv ? ',' : ';';
}

export function decouperLignes(texte, sep = ';') {
  const t = String(texte).replace(/^\ufeff/, '');
  const lignes = [];
  let champ = '', ligne = [], entreGuillemets = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (entreGuillemets) {
      if (ch === '"') {
        if (t[i + 1] === '"') { champ += '"'; i++; } else entreGuillemets = false;
      } else champ += ch;
      continue;
    }
    if (ch === '"') { entreGuillemets = true; continue; }
    if (ch === sep) { ligne.push(champ); champ = ''; continue; }
    if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && t[i + 1] === '\n') i++;
      ligne.push(champ);
      champ = '';
      if (ligne.some((x) => String(x).trim() !== '')) lignes.push(ligne);
      ligne = [];
      continue;
    }
    champ += ch;
  }
  ligne.push(champ);
  if (ligne.some((x) => String(x).trim() !== '')) lignes.push(ligne);
  return lignes;
}

export function importer(texte) {
  const sep = detecterSeparateur(texte);
  const lignes = decouperLignes(texte, sep);
  if (!lignes.length) throw new Error('Le fichier est vide.');
  const entetes = lignes[0].map((h) => h.trim().toLowerCase());
  const obligatoires = ['nom', 'date_relecture', 'culture_id', 'parametre_id'];
  const manquantes = obligatoires.filter((o) => !entetes.includes(o));
  if (manquantes.length) {
    throw new Error(`Colonnes manquantes : ${manquantes.join(', ')}. Utilisez le modèle CSV fourni ou un export de la plateforme.`);
  }
  const idx = {};
  entetes.forEach((h, i) => { idx[h] = i; });
  const lire = (l, cle) => {
    if (idx[cle] === undefined) return '';
    let v = String(l[idx[cle]] === undefined ? '' : l[idx[cle]]).trim();
    if (v.charAt(0) === "'") v = v.slice(1);
    return v;
  };

  const erreurs = [];
  const groupes = new Map();

  lignes.slice(1).forEach((l, n) => {
    const nom = lire(l, 'nom');
    const dateR = lire(l, 'date_relecture');
    if (!nom && !lire(l, 'culture_id')) return;
    const ref = lire(l, 'reference');
    const contact = lire(l, 'contact');
    const cle = ref ? `ref:${ref}` : `cle:${nom.toLowerCase()}|${contact.toLowerCase()}|${dateR}`;
    let g = groupes.get(cle);
    if (!g) {
      g = {
        reference: ref || null,
        donnees: {
          agronome: { nom, organisation: lire(l, 'organisation'), contact, date_relecture: dateR, accord: /^(oui|true|1|x|yes)$/i.test(lire(l, 'accord_validation')) },
          cultures: {},
          meta: { import: true }
        }
      };
      CULTURES.forEach((c) => { g.donnees.cultures[c.id] = cultureVide(c.id); });
      groupes.set(cle, g);
    }
    const cultureId = lire(l, 'culture_id');
    const paramId = lire(l, 'parametre_id');
    const cul = getCulture(cultureId);
    const par = getParam(paramId);
    if (!cul && cultureId) erreurs.push(`Ligne ${n + 2} : culture inconnue « ${cultureId} ».`);
    if (!par && paramId) erreurs.push(`Ligne ${n + 2} : paramètre inconnu « ${paramId} ».`);
    if (!cul || !par) return;

    const c = g.donnees.cultures[cul.id];
    if (lire(l, 'nom_scientifique')) c.nom_scientifique = lire(l, 'nom_scientifique');
    const zone = lire(l, 'zone');
    if (ZONES.includes(zone)) c.zone = zone;
    if (lire(l, 'remarques_culture')) c.remarques = lire(l, 'remarques_culture');
    ECOCROP_CHAMPS.forEach((ch) => {
      const v = lire(l, `eco_${ch.id}`);
      if (v) c.ecocrop[ch.id] = v;
    });
    const pv = c.parametres[par.id];
    const map = { imin: 'ideal_min', imax: 'ideal_max', tmin: 'tolere_min', tmax: 'tolere_max' };
    CHAMPS.forEach((ch) => {
      const v = lire(l, map[ch.id]);
      if (v) pv[ch.id] = v;
    });
    const src = lire(l, 'source_precise');
    if (src) pv.source = src;
    const st = lire(l, 'statut').toUpperCase();
    if (st === 'VALIDATED' || st === 'PROVISIONAL') pv.statut = st;
  });

  const enregistrements = [];
  groupes.forEach((g) => {
    const normalise = normaliser(g.donnees);
    const controle = valider(normalise);
    if (!controle.valide) {
      erreurs.push(`« ${normalise.agronome.nom || 'sans nom'} » (${normalise.agronome.date_relecture || 'date ?'}) : ${controle.erreurs.slice(0, 4).map((e) => e.message).join(' ')}`);
      return;
    }
    enregistrements.push({
      donnees: normalise,
      reference_source: g.reference,
      validite: { alertes: controle.alertes, valeurs: controle.totalValeurs }
    });
  });

  return {
    enregistrements,
    erreurs,
    message: enregistrements.length ? null : 'Aucune relecture valide n’a été trouvée dans ce fichier.'
  };
}
