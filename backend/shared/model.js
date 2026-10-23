/* ==========================================================================
   shared/model.js — référentiel unique (serveur Express + application React)
   Reprend STRICTEMENT le document « Plages agronomiques par culture :
   formulaire à remplir » (Meya Dorodoro) :
     • 9 cultures
     • 5 paramètres × 4 bornes (idéal min/max, toléré min/max)
     • zone « Référence EcoCrop (FAO), provisoire » à relire
     • zones : Les deux / Équateur / Bandundu
     • statuts : PROVISIONAL / VALIDATED
     • toute valeur saisie doit porter une source
     • case vide = valeur inconnue ; salinité = valeur maximale
   ========================================================================== */

export const CULTURES = [
  { id: 'manioc', nom: 'Manioc', scientifique: 'Manihot esculenta', page: 2 },
  { id: 'mais', nom: 'Maïs', scientifique: 'Zea mays', page: 3 },
  { id: 'haricot', nom: 'Haricot', scientifique: 'Phaseolus vulgaris', page: 4 },
  { id: 'arachide', nom: 'Arachide', scientifique: 'Arachis hypogaea', page: 5 },
  { id: 'riz', nom: 'Riz', scientifique: 'Oryza sativa', page: 6 },
  { id: 'bananier', nom: 'Banane plantain', scientifique: 'Musa x paradisiaca', page: 7 },
  { id: 'palmier', nom: 'Palmier à huile', scientifique: 'Elaeis guineensis', page: 8 },
  { id: 'cafe', nom: 'Café robusta', scientifique: 'Coffea canephora', page: 9 },
  { id: 'cacao', nom: 'Cacao', scientifique: 'Theobroma cacao', page: 10 }
];

export const ZONES = ['Les deux', 'Équateur', 'Bandundu'];

export const STATUTS = [
  { id: 'PROVISIONAL', label: 'PROVISIONAL', desc: 'Non encore relue' },
  { id: 'VALIDATED', label: 'VALIDATED', desc: 'Relue et acceptée par vous' }
];

export const PARAMS = [
  { id: 'ph', nom: 'pH du sol', unite: 'pH', min: 0, max: 14, step: 0.1, ec: false,
    aide: 'pH du sol de la parcelle.' },
  { id: 'temp', nom: "Température de l'air", unite: '°C', min: -20, max: 60, step: 0.5, ec: false,
    aide: "Température de l'air, et non du sol." },
  { id: 'hum', nom: 'Humidité volumique du sol', unite: '%', min: 0, max: 100, step: 0.5, ec: false,
    aide: 'Grandeur mesurée par les sondes du projet.' },
  { id: 'ec', nom: 'Salinité maximale (EC)', unite: 'dS/m', min: 0, max: 60, step: 0.1, ec: true,
    aide: 'Seule la valeur maximale est utilisée.' },
  { id: 'racine', nom: 'Profondeur racinaire', unite: 'cm', min: 0, max: 2000, step: 1, ec: false,
    aide: "Profondeur utile d'enracinement." }
];

export const CHAMPS = [
  { id: 'imin', label: 'Idéal min' },
  { id: 'imax', label: 'Idéal max' },
  { id: 'tmin', label: 'Toléré min' },
  { id: 'tmax', label: 'Toléré max' }
];

export const ECOCROP_CHAMPS = [
  { id: 'ph_imin', label: 'pH idéal min', type: 'number', min: 0, max: 14 },
  { id: 'ph_imax', label: 'pH idéal max', type: 'number', min: 0, max: 14 },
  { id: 'ph_tmin', label: 'pH toléré min', type: 'number', min: 0, max: 14 },
  { id: 'ph_tmax', label: 'pH toléré max', type: 'number', min: 0, max: 14 },
  { id: 't_imin', label: 'T° idéale min', type: 'number', min: -20, max: 60 },
  { id: 't_imax', label: 'T° idéale max', type: 'number', min: -20, max: 60 },
  { id: 't_tmin', label: 'T° tolérée min', type: 'number', min: -20, max: 60 },
  { id: 't_tmax', label: 'T° tolérée max', type: 'number', min: -20, max: 60 },
  { id: 'url', label: 'Adresse de la fiche GAEZ consultée', type: 'url' },
  { id: 'date', label: 'Date consultée', type: 'date_fr' }
];

export const LIMITS = {
  nom: 2, nomMax: 120, organisationMax: 160, contactMax: 160,
  sourceMax: 600, remarquesMax: 3000, urlMax: 500
};

export const getCulture = (id) => CULTURES.find((c) => c.id === id) || null;
export const getParam = (id) => PARAMS.find((p) => p.id === id) || null;

/* --- Utilitaires --------------------------------------------------------- */
export const vide = (v) => v === undefined || v === null || String(v).trim() === '';

export function nombre(v) {
  if (vide(v)) return null;
  const s = String(v).replace(',', '.').trim();
  if (!/^-?\d+(\.\d+)?$/.test(s)) return NaN;
  return parseFloat(s);
}

export const emailValide = (v) => /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(String(v).trim());
export const telephoneValide = (v) => /^\d{7,15}$/.test(String(v).replace(/[\s().\-+]/g, ''));
export const contactValide = (v) => emailValide(v) || telephoneValide(v);

export function dateFrValide(v) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(v).trim());
  if (!m) return null;
  const j = +m[1], mo = +m[2], a = +m[3];
  const d = new Date(a, mo - 1, j);
  if (d.getFullYear() !== a || d.getMonth() !== mo - 1 || d.getDate() !== j) return null;
  if (a < 1950 || a > 2100) return null;
  return String(v).trim();
}

export function aujourdhuiFr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export const urlValide = (v) => /^https?:\/\/[^\s]+\.[^\s]{2,}$/i.test(String(v).trim());

/* --- Modèles vierges ----------------------------------------------------- */
export const paramVide = () => ({ imin: '', imax: '', tmin: '', tmax: '', source: '', statut: 'PROVISIONAL' });

export const ecocropVide = () =>
  ECOCROP_CHAMPS.reduce((acc, c) => ({ ...acc, [c.id]: '' }), {});

export function cultureVide(cultureId) {
  const c = getCulture(cultureId);
  return {
    nom_scientifique: c ? c.scientifique : '',
    zone: 'Les deux',
    ecocrop: ecocropVide(),
    parametres: PARAMS.reduce((acc, p) => ({ ...acc, [p.id]: paramVide() }), {}),
    remarques: ''
  };
}

export function relectureVide() {
  return {
    agronome: { nom: '', organisation: '', contact: '', date_relecture: aujourdhuiFr(), accord: false },
    cultures: CULTURES.reduce((acc, c) => ({ ...acc, [c.id]: cultureVide(c.id) }), {}),
    meta: {}
  };
}

export function cultureRenseignee(c) {
  if (!c) return false;
  if (!vide(c.remarques)) return true;
  if (Object.keys(c.ecocrop || {}).some((k) => !vide(c.ecocrop[k]))) return true;
  return PARAMS.some((p) => {
    const v = (c.parametres || {})[p.id];
    if (!v) return false;
    if (CHAMPS.some((ch) => !vide(v[ch.id]))) return true;
    return !vide(v.source);
  });
}

export function nbValeursCulture(c) {
  return PARAMS.reduce((n, p) => {
    const v = (c && c.parametres && c.parametres[p.id]) || {};
    return n + CHAMPS.filter((ch) => !vide(v[ch.id])).length;
  }, 0);
}

/* --- Validation (règles explicites du document) -------------------------- */
export function valider(relecture) {
  const erreurs = [];
  const alertes = [];
  const push = (liste, champ, message, culture = null) => liste.push({ champ, message, culture });

  const a = relecture.agronome || {};
  if (vide(a.nom) || String(a.nom).trim().length < LIMITS.nom) push(erreurs, 'agronome.nom', 'Indiquez votre nom et prénom.');
  else if (String(a.nom).length > LIMITS.nomMax) push(erreurs, 'agronome.nom', 'Le nom est trop long (120 caractères maximum).');

  if (vide(a.organisation)) push(erreurs, 'agronome.organisation', 'Indiquez votre fonction / organisation.');
  else if (String(a.organisation).length > LIMITS.organisationMax) push(erreurs, 'agronome.organisation', 'La fonction / organisation est trop longue (160 caractères maximum).');

  if (vide(a.contact)) push(erreurs, 'agronome.contact', 'Indiquez un téléphone ou un e-mail pour vous joindre.');
  else if (!contactValide(a.contact)) push(erreurs, 'agronome.contact', 'Ce contact n’est ni un e-mail ni un numéro de téléphone valide.');

  if (vide(a.date_relecture)) push(erreurs, 'agronome.date_relecture', 'Indiquez la date de relecture (jj/mm/aaaa).');
  else if (!dateFrValide(a.date_relecture)) push(erreurs, 'agronome.date_relecture', 'La date de relecture doit être au format jj/mm/aaaa.');

  let totalValeurs = 0;
  let culturesRenseignees = 0;

  CULTURES.forEach((cul) => {
    const c = relecture.cultures && relecture.cultures[cul.id];
    if (!c) return;
    const base = `cultures.${cul.id}`;
    if (cultureRenseignee(c)) culturesRenseignees++;

    if (!vide(c.nom_scientifique) && String(c.nom_scientifique).length > LIMITS.nomMax)
      push(erreurs, `${base}.nom_scientifique`, `${cul.nom} : le nom scientifique est trop long.`, cul.id);

    if (!ZONES.includes(c.zone)) push(erreurs, `${base}.zone`, `${cul.nom} : choisissez la zone concernée.`, cul.id);

    ECOCROP_CHAMPS.forEach((ch) => {
      const val = (c.ecocrop || {})[ch.id];
      if (vide(val)) return;
      if (ch.type === 'number') {
        const n = nombre(val);
        if (Number.isNaN(n)) push(erreurs, `${base}.ecocrop.${ch.id}`, `${cul.nom} — référence EcoCrop : « ${ch.label} » doit être un nombre.`, cul.id);
        else if (n < ch.min || n > ch.max) push(erreurs, `${base}.ecocrop.${ch.id}`, `${cul.nom} — référence EcoCrop : « ${ch.label} » doit être comprise entre ${ch.min} et ${ch.max}.`, cul.id);
      } else if (ch.type === 'url') {
        if (String(val).length > LIMITS.urlMax) push(erreurs, `${base}.ecocrop.url`, `${cul.nom} : l’adresse de la fiche GAEZ est trop longue.`, cul.id);
        else if (!urlValide(val)) push(erreurs, `${base}.ecocrop.url`, `${cul.nom} : l’adresse de la fiche GAEZ doit commencer par http:// ou https://`, cul.id);
      } else if (ch.type === 'date_fr' && !dateFrValide(val)) {
        push(erreurs, `${base}.ecocrop.date`, `${cul.nom} : la date consultée doit être au format jj/mm/aaaa.`, cul.id);
      }
    });

    PARAMS.forEach((p) => {
      const v = (c.parametres || {})[p.id] || paramVide();
      const champBase = `${base}.parametres.${p.id}`;
      let saisis = 0;

      CHAMPS.forEach((ch) => {
        const raw = v[ch.id];
        if (vide(raw)) return;
        saisis++;
        const n = nombre(raw);
        if (Number.isNaN(n)) {
          push(erreurs, `${champBase}.${ch.id}`, `${cul.nom} — ${p.nom} : « ${ch.label} » doit être un nombre (virgule ou point pour les décimales).`, cul.id);
          return;
        }
        if (n < p.min || n > p.max) push(erreurs, `${champBase}.${ch.id}`, `${cul.nom} — ${p.nom} : « ${ch.label} » doit être comprise entre ${p.min} et ${p.max} ${p.unite}.`, cul.id);
      });

      const imin = nombre(v.imin), imax = nombre(v.imax), tmin = nombre(v.tmin), tmax = nombre(v.tmax);
      const ok = (x) => x !== null && !Number.isNaN(x);

      if (ok(imin) && ok(imax) && imin > imax)
        push(erreurs, `${champBase}.imin`, `${cul.nom} — ${p.nom} : l’idéal min (${v.imin}) est supérieur à l’idéal max (${v.imax}).`, cul.id);
      if (ok(tmin) && ok(tmax) && tmin > tmax)
        push(erreurs, `${champBase}.tmin`, `${cul.nom} — ${p.nom} : le toléré min (${v.tmin}) est supérieur au toléré max (${v.tmax}).`, cul.id);

      if (p.ec && (!vide(v.imin) || !vide(v.tmin)))
        push(alertes, `${champBase}.imin`, `${cul.nom} — salinité : seule la valeur maximale est utilisée ; les valeurs minimales ne seront pas reprises.`, cul.id);

      if (saisis > 0 && vide(v.source))
        push(erreurs, `${champBase}.source`, `${cul.nom} — ${p.nom} : une valeur est saisie, indiquez sa source précise (auteur ou institut, année, page ou lien).`, cul.id);
      if (!vide(v.source) && String(v.source).length > LIMITS.sourceMax)
        push(erreurs, `${champBase}.source`, `${cul.nom} — ${p.nom} : la source est trop longue (600 caractères maximum).`, cul.id);

      if (v.statut === 'VALIDATED' && saisis === 0)
        push(alertes, `${champBase}.statut`, `${cul.nom} — ${p.nom} : statut VALIDATED sans aucune valeur saisie.`, cul.id);
      if (!STATUTS.some((s) => s.id === v.statut))
        push(erreurs, `${champBase}.statut`, `${cul.nom} — ${p.nom} : statut invalide.`, cul.id);

      if (!p.ec && ok(imin) && ok(tmin) && tmin > imin)
        push(alertes, `${champBase}.tmin`, `${cul.nom} — ${p.nom} : le toléré min est supérieur à l’idéal min (la plage tolérée devrait encadrer la plage idéale).`, cul.id);
      if (!p.ec && ok(imax) && ok(tmax) && tmax < imax)
        push(alertes, `${champBase}.tmax`, `${cul.nom} — ${p.nom} : le toléré max est inférieur à l’idéal max (la plage tolérée devrait encadrer la plage idéale).`, cul.id);
      if (!p.ec && ok(imin) !== ok(imax))
        push(alertes, `${champBase}.imax`, `${cul.nom} — ${p.nom} : la plage idéale est incomplète (min et max sont utilisés ensemble par le logiciel).`, cul.id);

      totalValeurs += saisis;
    });

    if (!vide(c.remarques) && String(c.remarques).length > LIMITS.remarquesMax)
      push(erreurs, `${base}.remarques`, `${cul.nom} : les remarques sont trop longues (3000 caractères maximum).`, cul.id);
  });

  if (totalValeurs === 0 && culturesRenseignees === 0)
    push(erreurs, 'global', 'Le formulaire est vide : renseignez au moins une valeur ou une remarque pour une culture.');

  return { valide: erreurs.length === 0, erreurs, alertes, totalValeurs, culturesRenseignees };
}

/* --- Normalisation ------------------------------------------------------- */
export function normaliser(relecture) {
  const out = JSON.parse(JSON.stringify(relecture));
  const norm = (v) => {
    if (vide(v)) return '';
    const n = parseFloat(String(v).replace(',', '.').trim());
    if (Number.isNaN(n)) return '';
    return String(Math.round(n * 1000) / 1000);
  };
  out.agronome = out.agronome || {};
  ['nom', 'organisation', 'contact', 'date_relecture'].forEach((k) => {
    out.agronome[k] = String(out.agronome[k] || '').trim();
  });
  out.agronome.accord = !!out.agronome.accord;

  CULTURES.forEach((cul) => {
    const c = (out.cultures || {})[cul.id];
    if (!c) return;
    c.nom_scientifique = String(c.nom_scientifique || '').trim();
    c.zone = ZONES.includes(c.zone) ? c.zone : 'Les deux';
    c.remarques = String(c.remarques || '').trim();
    c.ecocrop = ECOCROP_CHAMPS.reduce((acc, ch) => {
      const v = (c.ecocrop || {})[ch.id];
      return { ...acc, [ch.id]: ch.type === 'number' ? norm(v) : String(v || '').trim() };
    }, {});
    c.parametres = PARAMS.reduce((acc, p) => {
      const src = (c.parametres || {})[p.id] || paramVide();
      return {
        ...acc,
        [p.id]: {
          imin: norm(src.imin), imax: norm(src.imax), tmin: norm(src.tmin), tmax: norm(src.tmax),
          source: String(src.source || '').trim(),
          statut: src.statut === 'VALIDATED' ? 'VALIDATED' : 'PROVISIONAL'
        }
      };
    }, {});
  });
  return out;
}

/* --- Statistiques (tableau de bord) -------------------------------------- */
export function calculerStats(records) {
  const cultures = CULTURES.map((c) => ({
    id: c.id, nom: c.nom, scientifique: c.scientifique,
    relectures: 0, valeurs: 0, validees: 0, sources: 0, remarques: 0, complete: 0
  }));
  const idxC = Object.fromEntries(cultures.map((c) => [c.id, c]));
  const parametres = PARAMS.map((p) => ({ id: p.id, nom: p.nom, unite: p.unite, valeurs: 0, validees: 0, cultures: 0, sources: 0 }));
  const idxP = Object.fromEntries(parametres.map((p) => [p.id, p]));
  const zones = { 'Les deux': 0, 'Équateur': 0, 'Bandundu': 0 };
  const sourcesMap = new Map();
  const parJour = new Map();
  const couverture = CULTURES.map((c) => ({ culture: c.id, nom: c.nom, cellules: {} }));
  const idxCv = Object.fromEntries(couverture.map((c) => [c.culture, c]));
  const agronomes = new Set();
  let validees = 0, provisoires = 0, accords = 0;

  records.forEach((r) => {
    const d = r.donnees || {};
    const a = d.agronome || {};
    agronomes.add([a.nom || '', a.contact || ''].join('|').toLowerCase());
    if (a.accord) accords++;
    const jour = String(r.cree_le || '').slice(0, 10);
    if (jour) parJour.set(jour, (parJour.get(jour) || 0) + 1);

    CULTURES.forEach((cul) => {
      const c = (d.cultures || {})[cul.id];
      if (!c) return;
      const st = idxC[cul.id];
      const renseignee = cultureRenseignee(c);
      if (renseignee) st.relectures++;
      if (!vide(c.remarques)) st.remarques++;
      let nbCulture = 0;
      PARAMS.forEach((p) => {
        const v = (c.parametres || {})[p.id] || {};
        const nb = CHAMPS.filter((ch) => !vide(v[ch.id])).length;
        if (nb > 0) {
          idxP[p.id].valeurs += nb;
          idxCv[cul.id].cellules[p.id] = (idxCv[cul.id].cellules[p.id] || 0) + 1;
          if (v.statut === 'VALIDATED') { idxP[p.id].validees += nb; st.validees += nb; validees += nb; }
          else provisoires += nb;
          if (!vide(v.source)) {
            idxP[p.id].sources++;
            st.sources++;
            const cle = String(v.source).trim().replace(/\s+/g, ' ').toLowerCase();
            const e = sourcesMap.get(cle) || { texte: String(v.source).trim().replace(/\s+/g, ' '), count: 0, cultures: new Set() };
            e.count++;
            e.cultures.add(cul.nom);
            sourcesMap.set(cle, e);
          }
        }
        nbCulture += nb;
      });
      st.valeurs += nbCulture;
      if (nbCulture >= 20) st.complete++;
      if (renseignee) zones[c.zone] = (zones[c.zone] || 0) + 1;
    });
  });

  parametres.forEach((p) => {
    p.cultures = couverture.filter((c) => (c.cellules[p.id] || 0) > 0).length;
  });
  cultures.forEach((c) => {
    c.completude = Math.round((c.valeurs / (records.length * 20 || 1)) * 100);
  });

  const sources = Array.from(sourcesMap.values())
    .map((s) => ({ texte: s.texte, count: s.count, cultures: Array.from(s.cultures) }))
    .sort((a, b) => b.count - a.count || a.texte.localeCompare(b.texte));

  return {
    total_relectures: records.length,
    total_agronomes: agronomes.size,
    accords,
    valeurs: validees + provisoires,
    validees,
    provisoires,
    cultures,
    parametres,
    zones,
    sources,
    par_jour: Array.from(parJour.entries()).sort().map(([date, n]) => ({ date, n })),
    couverture,
    max_par_culture: records.length * 20
  };
}

/* --- Résumé public, anonyme, par culture --------------------------------- */
export function resumePublic(records) {
  return {
    total_relectures: records.length,
    cultures: CULTURES.map((cul) => {
      const parametres = {};
      PARAMS.forEach((p) => {
        const numeriques = [];
        let validees = 0, sources = 0, total = 0;
        records.forEach((r) => {
          const c = ((r.donnees || {}).cultures || {})[cul.id];
          if (!c) return;
          const v = (c.parametres || {})[p.id] || {};
          const nb = CHAMPS.filter((ch) => !vide(v[ch.id])).length;
          if (nb === 0) return;
          total++;
          if (!vide(v.source)) sources++;
          if (v.statut === 'VALIDATED') {
            validees++;
            CHAMPS.forEach((ch) => {
              const n = nombre(v[ch.id]);
              if (n !== null && !Number.isNaN(n)) numeriques.push({ champ: ch.id, val: n });
            });
          }
        });
        const plages = {};
        CHAMPS.forEach((ch) => {
          const vals = numeriques.filter((x) => x.champ === ch.id).map((x) => x.val);
          plages[ch.id] = vals.length ? { min: Math.min(...vals), max: Math.max(...vals), n: vals.length } : null;
        });
        parametres[p.id] = { relectures: total, validees, sources, plages };
      });
      return {
        id: cul.id, nom: cul.nom, scientifique: cul.scientifique,
        relectures: records.filter((r) => cultureRenseignee(((r.donnees || {}).cultures || {})[cul.id])).length,
        parametres
      };
    })
  };
}

/* --- Résumé de liste ----------------------------------------------------- */
export function resumeRelecture(r) {
  const d = r.donnees || {};
  const a = d.agronome || {};
  const cultures = CULTURES.map((c) => {
    const cc = (d.cultures || {})[c.id];
    const validees = PARAMS.reduce((n, p) => {
      const v = ((cc || {}).parametres || {})[p.id] || {};
      return n + (v.statut === 'VALIDATED' ? CHAMPS.filter((ch) => !vide(v[ch.id])).length : 0);
    }, 0);
    return { id: c.id, nom: c.nom, renseignee: cultureRenseignee(cc), valeurs: nbValeursCulture(cc), validees };
  });
  return {
    id: r.id, reference: r.reference, cree_le: r.cree_le, source_saisie: r.source_saisie || 'web',
    agronome: { nom: a.nom, organisation: a.organisation, contact: a.contact, date_relecture: a.date_relecture, accord: !!a.accord },
    cultures,
    valeurs: cultures.reduce((n, c) => n + c.valeurs, 0),
    cultures_renseignees: cultures.filter((c) => c.renseignee).length,
    alertes: (r.validite && r.validite.alertes ? r.validite.alertes.length : 0)
  };
}
