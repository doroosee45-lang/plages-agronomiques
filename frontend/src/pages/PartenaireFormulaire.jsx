import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../lib/api.js';
import Reveal from '../components/Reveal.jsx';
import Photo from '../components/Photo.jsx';
import { Progression, Encadre, Etiquette } from '../components/Ui.jsx';
import {
  IconeCheck, IconeFleche, IconeInfo, IconeAttention, IconeEnveloppe,
  IconeTelephone, IconeFeuille, IconeLien, IconeTelecharger
} from '../components/Icons.jsx';
import { IMAGES_PARTENAIRES as P, ALT_PARTENAIRES as ALT } from '../assets/images.js';
import {
  TYPES_PARTIE, APPORTS, DOMAINES, NIVEAUX, PAYS, PROVINCES_RDC, ZONES_ACTION,
  PORTEES, DEVISES, TICKETS, DISPONIBILITES, CANAUX, ETAPES_PARTENAIRE,
  LIMITES, dossierVide, normaliserDossier, validerDossier
} from '@shared/partenaires.js';

const CLE_BROUILLON = 'agrikonnect-partenaire-v1';
const PREFIXES = [
  ['identite.'],
  ['apport.'],
  ['domaines'],
  ['localisation.'],
  ['autres.']
];

/* Brouillon local : même logique que le formulaire de relecture, sans dépendance. */
function useBrouillon(cle, initial) {
  const [valeur, setValeur] = useState(() => {
    try {
      const brut = localStorage.getItem(cle);
      if (brut) {
        const sauve = JSON.parse(brut);
        if (sauve && typeof sauve === 'object') {
          return {
            ...initial,
            ...sauve,
            identite: { ...initial.identite, ...(sauve.identite || {}) },
            apport: { ...initial.apport, ...(sauve.apport || {}) },
            localisation: { ...initial.localisation, ...(sauve.localisation || {}) },
            autres: { ...initial.autres, ...(sauve.autres || {}) },
            domaines: Array.isArray(sauve.domaines) ? sauve.domaines : initial.domaines
          };
        }
      }
    } catch { /* stockage indisponible */ }
    return initial;
  });
  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(cle, JSON.stringify(valeur)); } catch { /* quota */ }
    }, 350);
    return () => clearTimeout(t);
  }, [cle, valeur]);
  const effacer = () => { try { localStorage.removeItem(cle); } catch { /* ignore */ } };
  return [valeur, setValeur, effacer];
}

/* Champ texte simple, avec libellé, aide et message d'erreur relié. */
function Champ({ id, label, aide, erreur, requis, children }) {
  return (
    <div>
      <label htmlFor={id} className="etiquette-champ">
        {label} {requis && <span className="text-terre-600" aria-hidden="true">*</span>}
      </label>
      {children}
      {aide && !erreur && <p className="aide-champ">{aide}</p>}
      {erreur && (
        <p id={`${id}-erreur`} className="mt-1 flex items-start gap-1.5 text-[12px] font-medium text-red-700">
          <IconeAttention className="mt-0.5 shrink-0 text-[12px]" aria-hidden="true" />
          {erreur}
        </p>
      )}
    </div>
  );
}

export default function PartenaireFormulaire() {
  const [donnees, setDonnees, effacer] = useBrouillon(CLE_BROUILLON, dossierVide());
  const [etape, setEtape] = useState(0);
  const [touche, setTouche] = useState(false);
  const [erreursAffichees, setErreursAffichees] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreurEnvoi, setErreurEnvoi] = useState(null);
  const [resultat, setResultat] = useState(null);

  const resultatValidation = useMemo(() => validerDossier(normaliserDossier(donnees)), [donnees]);
  const erreurs = resultatValidation.erreurs;

  const erreursEtape = (n) =>
    erreurs.filter((e) => PREFIXES[n].some((p) => e.champ === p || e.champ.startsWith(p)));

  const messagePour = (champ) =>
    (touche || erreursAffichees ? erreurs.find((e) => e.champ === champ)?.message : undefined);

  const set = (bloc, champ, valeur) =>
    setDonnees((d) => ({ ...d, [bloc]: { ...d[bloc], [champ]: valeur } }));

  const basculerNature = (id) =>
    setDonnees((d) => {
      const deja = d.apport.natures.includes(id);
      return {
        ...d,
        apport: { ...d.apport, natures: deja ? d.apport.natures.filter((x) => x !== id) : [...d.apport.natures, id] }
      };
    });

  const basculerDomaine = (id) =>
    setDonnees((d) => {
      const existe = d.domaines.some((x) => x.id === id);
      return {
        ...d,
        domaines: existe
          ? d.domaines.filter((x) => x.id !== id)
          : [...d.domaines, { id, annees: 1, niveau: 'pratique' }]
      };
    });

  const majDomaine = (id, champ, valeur) =>
    setDonnees((d) => ({
      ...d,
      domaines: d.domaines.map((x) => (x.id === id ? { ...x, [champ]: valeur } : x))
    }));

  const aller = (n) => {
    setEtape(n);
    setErreursAffichees(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const suivant = () => {
    const bloque = erreursEtape(etape);
    if (bloque.length) {
      setErreursAffichees(true);
      const premier = document.getElementById(bloque[0].champ);
      if (premier) premier.focus();
      else document.getElementById('formulaire-partenaire')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (etape < 4) aller(etape + 1);
  };

  const envoyer = async (e) => {
    e.preventDefault();
    setTouche(true);
    if (!resultatValidation.valide) {
      setErreursAffichees(true);
      const premiereEtape = [0, 1, 2, 3, 4].find((n) => erreursEtape(n).length);
      if (premiereEtape !== undefined && premiereEtape !== etape) aller(premiereEtape);
      return;
    }
    setEnvoi(true);
    setErreurEnvoi(null);
    try {
      const rep = await fetch(apiUrl('/api/partenaires'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donnees, site_web: '' })
      });
      const data = await rep.json().catch(() => null);
      if (!rep.ok) {
        const msg = (data && data.erreurs && data.erreurs[0] && data.erreurs[0].message)
          || (data && data.message) || 'L’envoi n’a pas abouti. Réessayez dans un instant.';
        throw Object.assign(new Error(msg), { donnees: data });
      }
      setResultat({ ...data, donnees });
      effacer();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErreurEnvoi(
        window.location.protocol === 'file:'
          ? 'Cette version hors ligne (double-clic) ne peut pas envoyer de dossier : ouvrez le site avec npm run dev, ou écrivez-nous directement par e-mail. Votre brouillon reste conservé dans ce navigateur.'
          : err.message
      );
    } finally {
      setEnvoi(false);
    }
  };

  const reinitialiser = () => {
    if (!window.confirm('Effacer le brouillon et recommencer le dossier ?')) return;
    effacer();
    setDonnees(dossierVide());
    setEtape(0);
    setErreursAffichees(false);
    setResultat(null);
    setTouche(false);
  };

  const progression = Math.round(((etape + (resultatValidation.valide ? 1 : 0)) / 5) * 100);

  /* ------------------------------ Succès -------------------------------- */
  if (resultat) {
    const d = resultat.donnees;
    return (
      <section className="conteneur py-12 sm:py-16">
        <Reveal className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-xl3 border border-vert-500/25 bg-white shadow-carte">
            <div className="relative">
              <Photo
                src={P.hero.grand}
                alt={ALT.hero}
                ratio="aspect-[16/7]"
                arrondi="rounded-none"
                voile="fort"
                className="border-0"
              >
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                  <p className="text-[11px] font-bold uppercase tracking-[.2em] text-terre-300">Dossier reçu</p>
                  <h1 className="mt-1 font-display text-2xl font-semibold leading-tight text-creme-50 sm:text-4xl">
                    Merci, {d.identite.prenom || 'cher partenaire'}.
                  </h1>
                  <p className="mt-1 text-[13px] text-creme-200/80">
                    Votre candidature est enregistrée sous la référence
                    <strong className="ml-1 rounded bg-creme-100/15 px-1.5 py-0.5 font-mono text-[12.5px] text-creme-50">
                      {resultat.reference}
                    </strong>
                  </p>
                </div>
              </Photo>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ['Enregistré', 'Dans notre base de dossiers'],
                  ['Notifié', resultat.email?.envoye ? `E-mail envoyé à l’équipe` : 'Journalisé pour l’équipe'],
                  ['Prochaine étape', 'Un premier échange sous 5 jours ouvrés']
                ].map(([t, s]) => (
                  <div key={t} className="rounded-xl border border-vert-800/10 bg-creme-50/60 p-3.5">
                    <p className="text-[10.5px] font-bold uppercase tracking-[.12em] text-terre-700">{t}</p>
                    <p className="mt-1 text-[12.5px] leading-snug text-encre-600">{s}</p>
                  </div>
                ))}
              </div>

              {!resultat.email?.envoye && (
                <div className="mt-4">
                  <Encadre ton="attention" titre="Dossier bien enregistré, e-mail non parti">
                    Votre dossier est conservé et visible dans l’espace d’analyse de l’équipe.
                    La plateforme n’a pas pu confirmer l’envoi automatique du courriel.
                    {resultat.email?.raison === 'resend_non_configure' && ' La clé Resend manque dans la configuration du serveur.'}
                    {resultat.email?.raison === 'destinataire_absent' && ' L’adresse de réception manque dans la configuration du serveur.'}
                    {resultat.email?.raison === 'resend_refus' && ' Le fournisseur e-mail a refusé l’envoi; vérifiez la clé API et le domaine expéditeur dans Resend.'}
                    {resultat.email?.raison === 'resend_injoignable' && ' Le fournisseur e-mail est momentanément injoignable.'}
                    {resultat.email?.raison === 'resend_delai_depasse' && ' Le fournisseur e-mail n’a pas répondu à temps.'}
                    {' '}Vous pouvez aussi écrire directement à l’adresse indiquée ci-dessous en rappelant votre référence.
                  </Encadre>
                </div>
              )}

              <h2 className="mt-6 font-display text-lg font-semibold">Récapitulatif du dossier</h2>
              <dl className="mt-3 divide-y divide-vert-800/10 rounded-xl border border-vert-800/10 text-[13px]">
                {[
                  ['Référence', resultat.reference],
                  ['Candidat', `${d.identite.prenom} ${d.identite.nom}`],
                  ['Organisation', d.identite.organisation],
                  ['Type de partie prenante', (TYPES_PARTIE.find((t) => t.id === d.identite.type_partie) || {}).nom],
                  ['Apports', d.apport.natures.map((x) => (APPORTS.find((a) => a.id === x) || {}).nom).join(', ')],
                  ['Domaines', d.domaines.map((x) => `${(DOMAINES.find((dd) => dd.id === x.id) || {}).nom} (${x.annees} an${x.annees > 1 ? 's' : ''})`).join(' · ')],
                  ['Origine', [d.localisation.pays, d.localisation.province, d.localisation.ville].filter(Boolean).join(' · ')],
                  ['Contact', `${d.identite.email} · ${d.identite.telephone}`]
                ].map(([t, v]) => (
                  <div key={t} className="flex flex-col gap-0.5 px-4 py-2.5 sm:flex-row sm:gap-4">
                    <dt className="w-52 shrink-0 text-[12px] font-semibold uppercase tracking-[.06em] text-encre-500">{t}</dt>
                    <dd className="text-encre-900">{v || '—'}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 flex flex-wrap gap-3 sans-impression">
                <Link to="/partenaires" className="btn-primaire">Revenir au dossier de projet</Link>
                <button
                  type="button"
                  className="btn-secondaire"
                  onClick={() => window.print()}
                  aria-label="Imprimer ou enregistrer le récapitulatif en PDF"
                >
                  <IconeTelecharger className="text-base" /> Enregistrer en PDF
                </button>
                <button type="button" className="btn-fantome" onClick={() => { setResultat(null); setTouche(false); }}>
                  Déposer un autre dossier
                </button>
              </div>

              {resultat.contact && (
                <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-vert-800/10 pt-4 text-[12px] text-encre-500">
                  <span className="inline-flex items-center gap-1.5"><IconeEnveloppe className="text-vert-600" /> {resultat.contact.email}</span>
                  {resultat.contact.whatsapp && (
                    <a className="inline-flex items-center gap-1.5 hover:text-vert-800" href={resultat.contact.whatsapp_lien} target="_blank" rel="noreferrer">
                      <IconeTelephone className="text-vert-600" /> {resultat.contact.whatsapp}
                    </a>
                  )}
                </p>
              )}
            </div>
          </div>
        </Reveal>
      </section>
    );
  }

  /* ------------------------------ Formulaire ---------------------------- */
  const E = ETAPES_PARTENAIRE[etape];

  return (
    <>
      <section className="border-b border-vert-800/10 bg-white/50">
        <div className="conteneur py-8 sm:py-10">
          <div className="grid items-end gap-5 lg:grid-cols-[1fr_auto]">
            <div className="min-w-0">
              <p className="surtitre">AGRIKONNECT AFRICA · Programme partenaires</p>
              <h1 className="mt-2 font-display text-[26px] font-semibold leading-tight sm:text-4xl">
                Déposer un dossier de partenariat
              </h1>
              <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-encre-500">
                Cinq étapes, aucune pièce jointe. Vos réponses servent uniquement à qualifier le dossier :
                aucun engagement n’est pris à ce stade, dans un sens comme dans l’autre.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <div className="flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-vert-800/10 bg-white/80 px-4 py-2.5 text-[12px] text-encre-500">
                <span><span className="font-semibold text-vert-900">Brouillon</span> conservé dans ce navigateur</span>
                <button type="button" onClick={reinitialiser} className="whitespace-nowrap px-1 py-0.5 underline decoration-dotted underline-offset-2 transition-colors hover:text-red-700">
                  Effacer
                </button>
              </div>
              <Photo src={P.sol.petit} alt={ALT.sol} ratio="aspect-[5/3]" arrondi="rounded-xl" voile="aucun" className="hidden w-40 xl:block" />
            </div>
          </div>

          <ol className="mt-7 grid gap-2 sm:grid-cols-5" aria-label="Étapes du dossier partenaire">
            {ETAPES_PARTENAIRE.map((e, i) => {
              const actif = i === etape;
              const fait = i < etape;
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => (i <= etape ? aller(i) : null)}
                    aria-current={actif ? 'step' : undefined}
                    disabled={i > etape}
                    className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-300 ${
                      actif
                        ? 'border-vert-700 bg-vert-800 text-creme-100 shadow-doux'
                        : fait
                          ? 'border-vert-500/30 bg-vert-50 text-vert-800'
                          : 'border-vert-800/10 bg-white/60 text-encre-500'
                    } ${i > etape ? 'cursor-not-allowed opacity-70' : ''}`}
                  >
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                      actif ? 'bg-creme-100 text-vert-900' : fait ? 'bg-vert-600 text-white' : 'bg-vert-800/10 text-encre-500'
                    }`}>
                      {fait ? <IconeCheck className="text-[12px]" /> : i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[9.5px] font-bold uppercase tracking-[.1em] opacity-70">Étape {i + 1}</span>
                      <span className="block truncate text-[12.5px] font-semibold">{e.court}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <Progression className="mt-4" valeur={Math.max(6, progression)} label={`Étape ${etape + 1} sur 5 — ${E.court}`} />
        </div>
      </section>

      <section className="conteneur py-8 sm:py-12" id="formulaire-partenaire">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
          <form onSubmit={envoyer} noValidate className="carte p-5 sm:p-8">
            <Reveal key={etape}>
              <p className="surtitre">Étape {etape + 1} sur 5</p>
              <h2 className="mt-1.5 font-display text-[22px] font-semibold leading-tight sm:text-[27px]">{E.titre}</h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-encre-500">{E.intro}</p>

              {erreursAffichees && erreursEtape(etape).length > 0 && (
                <div className="mt-4">
                  <Encadre ton="erreur" titre={`${erreursEtape(etape).length} information(s) à compléter`}>
                    Les champs concernés sont signalés en rouge ci-dessous.
                  </Encadre>
                </div>
              )}

              {/* ------------------------- ÉTAPE 1 ------------------------ */}
              {etape === 0 && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Champ id="identite.prenom" label="Prénom" requis erreur={messagePour('identite.prenom')}>
                    <input
                      id="identite.prenom" className="champ" autoComplete="given-name" maxLength={LIMITES.prenom}
                      value={donnees.identite.prenom}
                      onChange={(e) => set('identite', 'prenom', e.target.value)}
                      aria-invalid={Boolean(messagePour('identite.prenom'))}
                    />
                  </Champ>
                  <Champ id="identite.nom" label="Nom" requis erreur={messagePour('identite.nom')}>
                    <input
                      id="identite.nom" className="champ" autoComplete="family-name" maxLength={LIMITES.nom}
                      value={donnees.identite.nom}
                      onChange={(e) => set('identite', 'nom', e.target.value)}
                      aria-invalid={Boolean(messagePour('identite.nom'))}
                    />
                  </Champ>
                  <Champ id="identite.organisation" label="Organisation / structure" requis erreur={messagePour('identite.organisation')}
                    aide="Écrivez « Indépendant » si vous candidatez à titre personnel.">
                    <input
                      id="identite.organisation" className="champ" maxLength={LIMITES.organisation}
                      value={donnees.identite.organisation}
                      onChange={(e) => set('identite', 'organisation', e.target.value)}
                      aria-invalid={Boolean(messagePour('identite.organisation'))}
                    />
                  </Champ>
                  <Champ id="identite.fonction" label="Fonction" erreur={messagePour('identite.fonction')}
                    aide="Ex. : Directrice, analyste, responsable coopérative, chercheur.">
                    <input
                      id="identite.fonction" className="champ" maxLength={LIMITES.fonction}
                      value={donnees.identite.fonction}
                      onChange={(e) => set('identite', 'fonction', e.target.value)}
                    />
                  </Champ>

                  <div className="sm:col-span-2">
                    <fieldset>
                      <legend className="etiquette-champ">Type de partie prenante <span className="text-terre-600" aria-hidden="true">*</span></legend>
                      <div className="mt-1 grid gap-2 sm:grid-cols-2">
                        {TYPES_PARTIE.map((t) => {
                          const choisi = donnees.identite.type_partie === t.id;
                          return (
                            <label
                              key={t.id}
                              className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition-all duration-200 ${
                                choisi ? 'border-vert-600 bg-vert-50 ring-2 ring-vert-600/15' : 'border-vert-800/15 bg-white hover:border-vert-800/30'
                              }`}
                            >
                              <input
                                type="radio"
                                name="type_partie"
                                id={t.id === TYPES_PARTIE[0].id ? 'identite.type_partie' : undefined}
                                value={t.id}
                                checked={choisi}
                                onChange={() => set('identite', 'type_partie', t.id)}
                                className="mt-0.5 h-4 w-4 shrink-0 accent-[#123d2a]"
                              />
                              <span className="min-w-0">
                                <span className="block text-[13px] font-semibold leading-snug text-vert-900">{t.nom}</span>
                                <span className="mt-0.5 block text-[11.5px] leading-snug text-encre-500">{t.desc}</span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                    {messagePour('identite.type_partie') && (
                      <p className="mt-1.5 text-[12px] font-medium text-red-700">{messagePour('identite.type_partie')}</p>
                    )}
                  </div>

                  <Champ id="identite.email" label="Adresse e-mail" requis erreur={messagePour('identite.email')}
                    aide="C’est par ce canal que nous répondons au dossier.">
                    <input
                      id="identite.email" type="email" inputMode="email" className="champ" autoComplete="email" maxLength={LIMITES.email}
                      value={donnees.identite.email}
                      onChange={(e) => set('identite', 'email', e.target.value)}
                      aria-invalid={Boolean(messagePour('identite.email'))}
                    />
                  </Champ>
                  <Champ id="identite.telephone" label="Téléphone / WhatsApp" requis erreur={messagePour('identite.telephone')}
                    aide="Avec l’indicatif pays, ex. +243 8XX XXX XXX.">
                    <input
                      id="identite.telephone" type="tel" inputMode="tel" className="champ" autoComplete="tel" maxLength={LIMITES.telephone}
                      value={donnees.identite.telephone}
                      onChange={(e) => set('identite', 'telephone', e.target.value)}
                      aria-invalid={Boolean(messagePour('identite.telephone'))}
                    />
                  </Champ>
                </div>
              )}

              {/* ------------------------- ÉTAPE 2 ------------------------ */}
              {etape === 1 && (
                <div className="mt-6 space-y-6">
                  <fieldset>
                    <legend className="etiquette-champ">Nature de votre apport <span className="text-terre-600" aria-hidden="true">*</span></legend>
                    <p className="aide-champ -mt-1 mb-2">Plusieurs choix possibles. Un apport non financier est un apport à part entière.</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {APPORTS.map((a) => {
                        const choisi = donnees.apport.natures.includes(a.id);
                        return (
                          <label
                            key={a.id}
                            className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition-all duration-200 ${
                              choisi ? 'border-vert-600 bg-vert-50 ring-2 ring-vert-600/15' : 'border-vert-800/15 bg-white hover:border-vert-800/30'
                            }`}
                          >
                            <input
                              type="checkbox"
                              value={a.id}
                              checked={choisi}
                              onChange={() => basculerNature(a.id)}
                              className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#123d2a]"
                            />
                            <span className="min-w-0">
                              <span className="block text-[13px] font-semibold leading-snug text-vert-900">{a.nom}</span>
                              <span className="mt-0.5 block text-[11.5px] leading-snug text-encre-500">{a.desc}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {messagePour('apport.natures') && <p className="mt-1.5 text-[12px] font-medium text-red-700">{messagePour('apport.natures')}</p>}
                  </fieldset>

                  {donnees.apport.natures.includes('financement') && (
                    <div className="rounded-xl border border-terre-300/60 bg-terre-50/60 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[.14em] text-terre-700">Apport financier</p>
                      <div className="mt-3 grid gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <Champ id="apport.ticket" label="Fourchette envisagée" erreur={messagePour('apport.ticket')}>
                            <select
                              id="apport.ticket" className="champ"
                              value={donnees.apport.ticket}
                              onChange={(e) => set('apport', 'ticket', e.target.value)}
                              aria-invalid={Boolean(messagePour('apport.ticket'))}
                            >
                              <option value="">Choisir une fourchette…</option>
                              {TICKETS.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </Champ>
                        </div>
                        <Champ id="apport.montant" label="Ou montant estimé" aide="Facultatif, chiffres uniquement.">
                          <div className="flex gap-2">
                            <input
                              id="apport.montant" className="champ" inputMode="numeric" maxLength={40}
                              value={donnees.apport.montant}
                              onChange={(e) => set('apport', 'montant', e.target.value)}
                            />
                            <select
                              aria-label="Devise"
                              className="champ w-[92px] shrink-0"
                              value={donnees.apport.devise}
                              onChange={(e) => set('apport', 'devise', e.target.value)}
                            >
                              {DEVISES.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                        </Champ>
                      </div>
                      <p className="mt-2 flex gap-2 text-[11.5px] leading-relaxed text-terre-800">
                        <IconeInfo className="mt-0.5 shrink-0" />
                        Aucun fonds n’est collecté par la plateforme. Cette information sert seulement à
                        rattacher le dossier à une étape de la feuille de route.
                      </p>
                    </div>
                  )}

                  <Champ id="apport.disponibilite" label="Sous quel délai pourriez-vous vous engager ?" requis erreur={messagePour('apport.disponibilite')}>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {DISPONIBILITES.map((d) => (
                        <label
                          key={d}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-[13px] transition-colors ${
                            donnees.apport.disponibilite === d ? 'border-vert-600 bg-vert-50 font-semibold text-vert-900' : 'border-vert-800/15 bg-white text-encre-700 hover:border-vert-800/30'
                          }`}
                        >
                          <input
                            type="radio"
                            name="disponibilite"
                            id={d === DISPONIBILITES[0] ? 'apport.disponibilite' : undefined}
                            value={d}
                            checked={donnees.apport.disponibilite === d}
                            onChange={() => set('apport', 'disponibilite', d)}
                            className="h-4 w-4 shrink-0 accent-[#123d2a]"
                          />
                          {d}
                        </label>
                      ))}
                    </div>
                  </Champ>

                  <Champ id="apport.precision" label="Précisions sur l’apport"
                    aide="Facultatif : ce que vous pouvez mobiliser concrètement, et en combien de temps.">
                    <textarea
                      id="apport.precision" className="champ min-h-[92px]" maxLength={1200}
                      value={donnees.apport.precision}
                      onChange={(e) => set('apport', 'precision', e.target.value)}
                    />
                  </Champ>
                </div>
              )}

              {/* ------------------------- ÉTAPE 3 ------------------------ */}
              {etape === 2 && (
                <div className="mt-6">
                  <fieldset>
                    <legend className="etiquette-champ">Vos domaines de compétence <span className="text-terre-600" aria-hidden="true">*</span></legend>
                    <p className="aide-champ -mt-1 mb-2">
                      Cochez un domaine, puis précisez le nombre d’années d’expérience réelle et votre niveau.
                    </p>
                    <div className="grid gap-2">
                      {DOMAINES.map((dm) => {
                        const choisi = donnees.domaines.find((x) => x.id === dm.id);
                        return (
                          <div
                            key={dm.id}
                            className={`rounded-xl border transition-all duration-200 ${
                              choisi ? 'border-vert-600 bg-vert-50/70' : 'border-vert-800/15 bg-white hover:border-vert-800/30'
                            }`}
                          >
                            <label className="flex cursor-pointer items-start gap-3 p-3">
                              <input
                                type="checkbox"
                                checked={Boolean(choisi)}
                                onChange={() => basculerDomaine(dm.id)}
                                className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#123d2a]"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block text-[13px] font-semibold leading-snug text-vert-900">{dm.nom}</span>
                                <span className="mt-0.5 block text-[11.5px] leading-snug text-encre-500">{dm.desc}</span>
                              </span>
                            </label>
                            {choisi && (
                              <div className="grid gap-3 border-t border-vert-800/10 px-3 pb-3 pt-3 sm:grid-cols-2">
                                <div>
                                  <label htmlFor={`annees-${dm.id}`} className="mb-1 block text-[11.5px] font-semibold text-vert-900">
                                    Années d’expérience
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      id={`annees-${dm.id}`}
                                      type="number"
                                      min="0"
                                      max="60"
                                      step="1"
                                      className="champ w-24"
                                      value={choisi.annees}
                                      onChange={(e) => majDomaine(dm.id, 'annees', e.target.value === '' ? '' : Math.max(0, Math.min(60, Number(e.target.value))))}
                                    />
                                    <span className="text-[12px] text-encre-500">an(s)</span>
                                  </div>
                                </div>
                                <div>
                                  <label htmlFor={`niveau-${dm.id}`} className="mb-1 block text-[11.5px] font-semibold text-vert-900">
                                    Niveau
                                  </label>
                                  <select
                                    id={`niveau-${dm.id}`}
                                    className="champ"
                                    value={choisi.niveau}
                                    onChange={(e) => majDomaine(dm.id, 'niveau', e.target.value)}
                                  >
                                    {NIVEAUX.map((n) => <option key={n.id} value={n.id}>{n.nom}</option>)}
                                  </select>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {messagePour('domaines') && <p className="mt-1.5 text-[12px] font-medium text-red-700">{messagePour('domaines')}</p>}
                  </fieldset>

                  <div className="mt-4">
                    <Encadre ton="info" titre="Pourquoi les années d’expérience ?">
                      Elles nous permettent de composer des binômes crédibles devant un bailleur et de
                      distinguer un soutien d’intention d’une compétence mobilisable. Une seule case suffit
                      pour commencer.
                    </Encadre>
                  </div>
                </div>
              )}

              {/* ------------------------- ÉTAPE 4 ------------------------ */}
              {etape === 3 && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Champ id="localisation.pays" label="Pays d’origine" requis erreur={messagePour('localisation.pays')}>
                    <select
                      id="localisation.pays" className="champ"
                      value={donnees.localisation.pays}
                      onChange={(e) => set('localisation', 'pays', e.target.value)}
                      aria-invalid={Boolean(messagePour('localisation.pays'))}
                    >
                      {PAYS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Champ>

                  <Champ id="localisation.province" label="Province (si RDC)"
                    aide="Facultatif pour les partenaires hors RDC.">
                    <select
                      id="localisation.province" className="champ"
                      value={donnees.localisation.province}
                      onChange={(e) => set('localisation', 'province', e.target.value)}
                    >
                      <option value="">Non concerné / à préciser</option>
                      {PROVINCES_RDC.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Champ>

                  <Champ id="localisation.ville" label="Ville, territoire ou secteur"
                    aide="Ex. : Kinshasa (N’sele), Mbandaka, Kikwit, Bandundu.">
                    <input
                      id="localisation.ville" className="champ" maxLength={LIMITES.ville}
                      value={donnees.localisation.ville}
                      onChange={(e) => set('localisation', 'ville', e.target.value)}
                    />
                  </Champ>

                  <Champ id="localisation.zone_action" label="Zone d’action principale" requis erreur={messagePour('localisation.zone_action')}>
                    <select
                      id="localisation.zone_action" className="champ"
                      value={donnees.localisation.zone_action}
                      onChange={(e) => set('localisation', 'zone_action', e.target.value)}
                      aria-invalid={Boolean(messagePour('localisation.zone_action'))}
                    >
                      <option value="">Choisir…</option>
                      {ZONES_ACTION.map((z) => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </Champ>

                  <div className="sm:col-span-2">
                    <Champ id="localisation.portee" label="Portée de votre action" requis erreur={messagePour('localisation.portee')}>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {PORTEES.map((p) => (
                          <label
                            key={p}
                            className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-[12.5px] transition-colors ${
                              donnees.localisation.portee === p ? 'border-vert-600 bg-vert-50 font-semibold text-vert-900' : 'border-vert-800/15 bg-white text-encre-700 hover:border-vert-800/30'
                            }`}
                          >
                            <input
                              type="radio"
                              name="portee"
                              id={p === PORTEES[0] ? 'localisation.portee' : undefined}
                              value={p}
                              checked={donnees.localisation.portee === p}
                              onChange={() => set('localisation', 'portee', p)}
                              className="h-4 w-4 shrink-0 accent-[#123d2a]"
                            />
                            {p}
                          </label>
                        ))}
                      </div>
                    </Champ>
                  </div>

                  <div className="sm:col-span-2">
                    <Champ id="localisation.couverture" label="Territoires, provinces ou pays couverts"
                      aide="Facultatif : listez les zones où vous êtes réellement présent.">
                      <textarea
                        id="localisation.couverture" className="champ min-h-[80px]" maxLength={600}
                        value={donnees.localisation.couverture}
                        onChange={(e) => set('localisation', 'couverture', e.target.value)}
                      />
                    </Champ>
                  </div>
                </div>
              )}

              {/* ------------------------- ÉTAPE 5 ------------------------ */}
              {etape === 4 && (
                <div className="mt-6 space-y-5">
                  <Champ id="autres.message" label="Votre message"
                    aide="Ce que vous attendez du projet, une question précise, une contrainte de calendrier.">
                    <textarea
                      id="autres.message" className="champ min-h-[130px]" maxLength={LIMITES.message}
                      value={donnees.autres.message}
                      onChange={(e) => set('autres', 'message', e.target.value)}
                    />
                  </Champ>

                  <Champ id="autres.canal" label="Comment avez-vous connu le projet ?">
                    <select
                      id="autres.canal" className="champ"
                      value={donnees.autres.canal}
                      onChange={(e) => set('autres', 'canal', e.target.value)}
                    >
                      <option value="">Choisir…</option>
                      {CANAUX.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Champ>

                  <div className="rounded-xl border border-vert-800/15 bg-white p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[.14em] text-terre-700">Consentements</p>
                    <div className="mt-3 space-y-3">
                      <label className="flex cursor-pointer items-start gap-3 text-[12.5px] leading-relaxed text-encre-700">
                        <input
                          id="autres.consentement_contact"
                          type="checkbox"
                          checked={donnees.autres.consentement_contact}
                          onChange={(e) => set('autres', 'consentement_contact', e.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#123d2a]"
                          aria-invalid={Boolean(messagePour('autres.consentement_contact'))}
                        />
                        <span>
                          <strong className="font-semibold text-vert-900">J’accepte d’être recontacté</strong> au sujet de
                          ce dossier par e-mail, téléphone ou WhatsApp. <span className="text-terre-600">*</span>
                        </span>
                      </label>
                      {messagePour('autres.consentement_contact') && (
                        <p className="pl-7 text-[12px] font-medium text-red-700">{messagePour('autres.consentement_contact')}</p>
                      )}
                      <label className="flex cursor-pointer items-start gap-3 text-[12.5px] leading-relaxed text-encre-700">
                        <input
                          type="checkbox"
                          checked={donnees.autres.consentement_citation}
                          onChange={(e) => set('autres', 'consentement_citation', e.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#123d2a]"
                        />
                        <span>
                          J’accepte que mon nom et la date soient cités si ce partenariat est rendu public.
                          <span className="ml-1 text-encre-500">(facultatif)</span>
                        </span>
                      </label>
                      <label className="flex cursor-pointer items-start gap-3 text-[12.5px] leading-relaxed text-encre-700">
                        <input
                          type="checkbox"
                          checked={donnees.autres.appel}
                          onChange={(e) => set('autres', 'appel', e.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#123d2a]"
                        />
                        <span>Je préfère un premier échange par appel téléphonique plutôt que par e-mail.</span>
                      </label>
                    </div>
                  </div>

                  {/* Piège à robots — invisible pour les humains */}
                  <input
                    type="text"
                    name="site_web"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="pointer-events-none absolute h-0 w-0 opacity-0"
                    value={donnees.site_web || ''}
                    onChange={(e) => setDonnees((d) => ({ ...d, site_web: e.target.value }))}
                  />

                  <div className="rounded-xl border border-vert-800/10 bg-creme-50/70 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[.14em] text-terre-700">Avant d’envoyer</p>
                    <ul className="mt-2 space-y-1.5 text-[12.5px] text-encre-600">
                      <li>{donnees.domaines.length} domaine(s) renseigné(s)</li>
                      <li>{donnees.apport.natures.length} nature(s) d’apport</li>
                      <li>{donnees.localisation.pays} · {donnees.localisation.zone_action || 'zone à préciser'}</li>
                    </ul>
                    {resultatValidation.valide
                      ? <p className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-vert-700"><IconeCheck /> Dossier complet, prêt à envoyer.</p>
                      : <p className="mt-2 flex items-center gap-1.5 text-[12px] text-terre-700"><IconeInfo /> {erreurs.length} information(s) encore manquante(s).</p>}
                  </div>

                  {erreurEnvoi && (
                    <Encadre ton="erreur" titre="Envoi impossible">{erreurEnvoi}</Encadre>
                  )}
                </div>
              )}

              {/* ----------------------- Navigation ---------------------- */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-vert-800/10 pt-5">
                <button
                  type="button"
                  className="btn-secondaire"
                  onClick={() => aller(Math.max(0, etape - 1))}
                  disabled={etape === 0 || envoi}
                >
                  Retour
                </button>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[11.5px] text-encre-500">Étape {etape + 1} / 5</span>
                  {etape < 4 ? (
                    <button type="button" className="btn-primaire" onClick={suivant}>
                      Continuer <IconeFleche className="text-base" />
                    </button>
                  ) : (
                    <button type="submit" className="btn-terre" disabled={envoi}>
                      {envoi ? 'Envoi en cours…' : 'Envoyer mon dossier'}
                      {!envoi && <IconeFleche className="text-base" />}
                    </button>
                  )}
                </div>
              </div>
            </Reveal>
          </form>

          {/* -------------------------- Colonne d'aide ------------------- */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="carte overflow-hidden">
              <Photo
                src={etape === 2 ? P.carte.grand : etape === 1 ? P.sol.grand : P.hero.grand}
                alt={etape === 2 ? ALT.carte : etape === 1 ? ALT.sol : ALT.hero}
                ratio="aspect-[16/10]"
                arrondi="rounded-none"
                voile="moyen"
                className="border-0"
              />
              <div className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-[.14em] text-terre-700">Pourquoi cette étape ?</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-encre-600">{E.pourquoi}</p>
              </div>
            </div>

            <div className="carte p-4">
              <p className="text-[11px] font-bold uppercase tracking-[.14em] text-terre-700">Ce que vous ne trouverez pas ici</p>
              <ul className="mt-2 space-y-2 text-[12px] leading-relaxed text-encre-600">
                {[
                  'Aucune promesse de rendement ou de gain.',
                  'Aucun paiement ni collecte de fonds par la plateforme.',
                  'Aucune transmission de vos données à un tiers sans accord écrit.',
                  'Aucune pièce confidentielle demandée à ce stade.'
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <IconeCheck className="mt-0.5 shrink-0 text-[12px] text-vert-600" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="carte p-4">
              <p className="text-[11px] font-bold uppercase tracking-[.14em] text-terre-700">Besoin d’aide ?</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-encre-600">
                Vous pouvez déposer le dossier par e-mail si le formulaire ne passe pas
                (connexion instable, handicap, langue).
              </p>
              <Link to="/partenaires" className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-vert-800 hover:text-terre-700">
                <IconeLien className="text-sm" /> Retour au dossier de projet
              </Link>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-vert-800/10 bg-white/60 p-3 text-[11.5px] text-encre-500">
              <IconeFeuille className="shrink-0 text-vert-600" />
              Votre brouillon est conservé même si vous fermez la page.
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
