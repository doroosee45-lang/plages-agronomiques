import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, apiUrl } from '../lib/api.js';
import { CULTURES, PARAMS } from '@shared/model.js';
import { BadgeStatut, Encadre, Progression, TitreSection } from '../components/Ui.jsx';
import Reveal from '../components/Reveal.jsx';
import Photo from '../components/Photo.jsx';
import { IMAGES } from '../assets/images.js';
import { useCompteur } from '../hooks/useReveal.js';
import {
  IconeBouclier, IconeTelephone, IconeCsv, IconePdf, IconeLoupe, IconeGraphique,
  IconeArchive, IconeFleche, IconeAttention, IconeInfo, IconeCheck
} from '../components/Icons.jsx';

const pl = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;

const dateFr = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

function Kpi({ valeur, label, detail }) {
  const n = useCompteur(valeur);
  return (
    <div className="kpi">
      <p className="kpi__valeur">{n}</p>
      <p className="kpi__label">{label}</p>
      {detail && <p className="mt-1 text-[11.5px] text-encre-500">{detail}</p>}
    </div>
  );
}

function Barre({ label, valeur, max, detail, couleur = 'from-vert-600 to-vert-400' }) {
  const p = max > 0 ? Math.max(2, Math.round((valeur / max) * 100)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
        <span className="truncate font-medium text-vert-900">{label}</span>
        <span className="shrink-0 tabular-nums text-encre-500">{detail ?? valeur}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-vert-800/10">
        {valeur > 0 && (
          <div className={`h-full rounded-full bg-gradient-to-r ${couleur} transition-[width] duration-700 ease-doux`} style={{ width: `${p}%` }} />
        )}
      </div>
    </div>
  );
}

function Connexion({ onConnexion }) {
  const [code, setCode] = useState('');
  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(false);

  const soumettre = async (e) => {
    e.preventDefault();
    setEnCours(true);
    setErreur(null);
    try {
      await api.connexion(code);
      onConnexion();
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnCours(false);
    }
  };

  return (
    <section className="conteneur py-16 sm:py-20">
      <div className="mx-auto max-w-md">
        <Reveal className="carte overflow-hidden">
          <div className="relative">
            <Photo
              src={IMAGES.sonde.grand}
              alt="Sonde de mesure des paramètres du sol dans une parcelle cultivée"
              ratio="aspect-[16/7]"
              arrondi="rounded-none"
              voile="moyen"
            />
            <p className="absolute bottom-3 left-4 right-4 text-[11px] font-semibold uppercase tracking-[.14em] text-creme-100">
              Données de terrain consolidées
            </p>
          </div>
          <div className="p-6 sm:p-8">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-vert-800 text-xl text-creme-100">
            <IconeBouclier />
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold">Analyse des réponses</h1>
          <p className="mt-2 text-sm leading-relaxed text-encre-500">
            Cet espace est réservé à l’équipe du projet : il contient les coordonnées des agronomes
            et le détail des relectures.
          </p>
          <form onSubmit={soumettre} className="mt-6">
            <label htmlFor="code" className="etiquette-champ">Code d’accès</label>
            <input
              id="code"
              type="password"
              className="champ"
              autoComplete="current-password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-invalid={!!erreur}
              required
            />
            {erreur && <p className="mt-1.5 text-[12.5px] font-medium text-red-700" role="alert">{erreur}</p>}
            <button type="submit" className="btn-primaire mt-4 w-full" disabled={enCours}>
              {enCours ? 'Vérification…' : 'Ouvrir le tableau de bord'}
            </button>
          </form>
          <p className="mt-4 rounded-lg bg-creme-100 px-3 py-2 text-[11.5px] leading-relaxed text-encre-500">
            Code de la démonstration : <code className="font-semibold text-vert-900">agro2026</code>.
            Il se change avec la variable d’environnement <code>ADMIN_CODE</code>.
          </p>
          </div>
        </Reveal>
        <p className="mt-4 text-center text-[12px] text-encre-500">
          Les agrégats publics (nombre de relectures, valeurs validées) restent visibles sur la page d’accueil.
        </p>
      </div>
    </section>
  );
}

export default function Analyse() {
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState(null);
  const [liste, setListe] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [message, setMessage] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [detail, setDetail] = useState(null);
  const [importEnCours, setImportEnCours] = useState(false);
  const [sante, setSante] = useState(null);
  const [notifs, setNotifs] = useState(null);
  const [partenaires, setPartenaires] = useState(null);
  const [messagePartenaire, setMessagePartenaire] = useState(null);
  const [messageTest, setMessageTest] = useState(null);
  const fichierRef = useRef(null);

  const charger = useCallback(async () => {
    try {
      const [s, l, n] = await Promise.all([api.stats(), api.liste(recherche), api.notifications().catch(() => null)]);
      if (!s?.stats) throw new Error('Le serveur n’a pas renvoyé les statistiques. Vérifiez l’URL API du frontend dans Render.');
      api.partenaires().then(setPartenaires).catch(() => setPartenaires(null));
      setStats(s.stats);
      setListe(l?.relectures || []);
      if (n) setNotifs(n);
      setErreur(null);
    } catch (e) {
      if (e.statut === 401) setAdmin(false);
      else setErreur(e.message);
    }
  }, [recherche]);

  useEffect(() => {
    api.session().then((r) => setAdmin(!!r.admin)).catch(() => setAdmin(false));
    api.sante().then(setSante).catch(() => {});
  }, []);

  useEffect(() => { if (admin) charger(); }, [admin, charger]);

  const deconnexion = async () => {
    await api.deconnexion().catch(() => {});
    setAdmin(false);
    setStats(null);
    setListe([]);
  };

  const supprimer = async (r) => {
    if (!window.confirm(`Supprimer définitivement la relecture ${r.reference} de ${r.agronome.nom} ?`)) return;
    try {
      await api.supprimer(r.id);
      setMessage({ ton: 'succes', texte: `Relecture ${r.reference} supprimée.` });
      charger();
    } catch (e) { setMessage({ ton: 'erreur', texte: e.message }); }
  };

  const changerStatut = async (id, statut) => {
    try {
      await api.statutPartenaire(id, statut);
      setPartenaires((p) => p && ({ ...p, dossiers: p.dossiers.map((d) => (d.id === id ? { ...d, statut } : d)) }));
    } catch (e) {
      setMessagePartenaire({ ton: 'erreur', texte: e.message });
    }
  };

  const testerEmailPartenaire = async () => {
    setMessagePartenaire({ ton: 'info', texte: 'Envoi en cours…' });
    try {
      const r = await api.testerEmailPartenaire();
      setMessagePartenaire({ ton: 'succes', texte: r.message });
    } catch (e) {
      setMessagePartenaire({ ton: 'erreur', texte: e.message });
    }
  };

  const testerNotification = async () => {
    setMessageTest({ ton: 'info', texte: 'Envoi du message de test…' });
    try {
      const r = await api.testerNotification();
      setMessageTest({ ton: 'succes', texte: r.message });
    } catch (e) {
      setMessageTest({ ton: 'erreur', texte: e.message });
    }
  };

  const importer = async (e) => {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setImportEnCours(true);
    setMessage(null);
    try {
      const texte = await fichier.text();
      const r = await api.importer(texte);
      setMessage({
        ton: r.rejetees || r.doublons ? 'attention' : 'succes',
        texte: `Import terminé : ${pl(r.importees, 'relecture')} ajoutée${r.importees > 1 ? 's' : ''}, ${pl(r.doublons, 'doublon')} ignoré${r.doublons > 1 ? 's' : ''}, ${r.rejetees} rejetée${r.rejetees > 1 ? 's' : ''}.`
      });
      charger();
    } catch (err) {
      setMessage({ ton: 'erreur', texte: err.message });
    } finally {
      setImportEnCours(false);
      if (fichierRef.current) fichierRef.current.value = '';
    }
  };

  if (admin === null) {
    return (
      <section className="conteneur py-20 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-vert-800/20 border-t-vert-700" aria-hidden="true" />
      </section>
    );
  }

  if (!admin) return <Connexion onConnexion={() => setAdmin(true)} />;

  const maxCulture = stats ? Math.max(1, ...stats.cultures.map((c) => c.valeurs)) : 1;
  const maxParam = stats ? Math.max(1, ...stats.parametres.map((p) => p.valeurs)) : 1;
  const maxJour = stats ? Math.max(1, ...stats.par_jour.map((j) => j.n)) : 1;

  return (
    <section className="conteneur py-10 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <TitreSection
          niveau={1}
          surtitre="Espace de l’équipe"
          titre="Analyse des relectures"
          intro="Vue consolidée des valeurs reçues, des sources citées et de la couverture par culture et par paramètre."
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondaire px-4 py-2 text-[13px]" onClick={charger}>Actualiser</button>
          <a href={apiUrl('/api/export.csv')} className="btn-secondaire px-4 py-2 text-[13px]"><IconeCsv className="text-base" /> Exporter CSV</a>
          <button type="button" className="btn-secondaire px-4 py-2 text-[13px]" onClick={() => fichierRef.current?.click()} disabled={importEnCours}>
            <IconeArchive className="text-base" /> {importEnCours ? 'Import…' : 'Importer CSV'}
          </button>
          <input ref={fichierRef} type="file" accept=".csv,text/csv" className="sr-only" onChange={importer} aria-label="Choisir un fichier CSV à importer" />
          <a href={apiUrl('/api/modele.csv')} className="btn-fantome px-4 py-2 text-[13px]">Modèle CSV</a>
          <button type="button" className="btn-fantome px-4 py-2 text-[13px]" onClick={deconnexion}>Déconnexion</button>
        </div>
      </div>

      {sante && (
        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-encre-500">
          <span className={`inline-block h-2 w-2 rounded-full ${sante.mongo ? 'bg-vert-600' : 'bg-terre-500'}`} aria-hidden="true" />
          {sante.mongo
            ? <>Stockage : <strong className="font-semibold text-vert-800">MongoDB</strong> — base « {sante.base} » · {sante.documents ?? '—'} relecture(s) en base</>
            : <>Stockage : <strong className="font-semibold text-terre-800">fichier JSON</strong> (MongoDB non joignable) — {sante.documents ?? '—'} relecture(s) enregistrée(s)</>}
        </p>
      )}

      {message && (
        <div className="mt-5">
          <Encadre ton={message.ton === 'erreur' ? 'erreur' : message.ton === 'attention' ? 'attention' : 'succes'}>{message.texte}</Encadre>
        </div>
      )}
      {erreur && <div className="mt-5"><Encadre ton="erreur">{erreur}</Encadre></div>}

      {stats && (
        <>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Kpi valeur={stats.total_relectures} label="Relectures" />
            <Kpi valeur={stats.total_agronomes} label="Agronomes" />
            <Kpi valeur={stats.valeurs} label="Bornes reçues" />
            <Kpi valeur={stats.validees} label="Validées" />
            <Kpi valeur={stats.provisoires} label="Provisoires" />
            <Kpi valeur={stats.accords} label="Citations acceptées" />
          </div>

          {stats.total_relectures === 0 && (
            <div className="mt-6">
              <Encadre ton="info" titre="Aucune relecture pour l’instant">
                Le tableau de bord se remplira dès la première relecture envoyée. Vous pouvez aussi
                importer un fichier CSV produit avec le modèle fourni.
              </Encadre>
            </div>
          )}

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Reveal className="carte p-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><IconeGraphique className="text-vert-600" /> Bornes par culture</h2>
              <div className="mt-4 space-y-3">
                {stats.cultures.map((c) => (
                  <Barre key={c.id} label={c.nom} valeur={c.valeurs} max={maxCulture} detail={`${pl(c.valeurs, 'borne')} · ${c.validees} validée${c.validees > 1 ? 's' : ''}`} />
                ))}
              </div>
            </Reveal>

            <Reveal delai={80} className="space-y-4">
              <div className="carte p-5">
                <h2 className="font-display text-lg font-semibold">Par paramètre</h2>
                <div className="mt-4 space-y-3">
                  {stats.parametres.map((p) => (
                    <Barre key={p.id} label={`${p.nom} (${p.unite})`} valeur={p.valeurs} max={maxParam} detail={`${p.valeurs} · ${p.cultures}/9 cultures`} couleur="from-terre-500 to-terre-300" />
                  ))}
                </div>
              </div>
              <div className="carte p-5">
                <h2 className="font-display text-lg font-semibold">Zones déclarées</h2>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  {Object.entries(stats.zones).map(([z, n]) => (
                    <div key={z} className="rounded-lg bg-vert-800/[.04] px-2 py-3">
                      <p className="font-display text-xl font-semibold tabular-nums text-vert-900">{n}</p>
                      <p className="mt-0.5 text-[11px] text-encre-500">{z}</p>
                    </div>
                  ))}
                </div>
                {stats.par_jour.length > 0 && (
                  <>
                    <p className="mt-5 text-[11px] font-semibold uppercase tracking-[.1em] text-encre-500">Relectures par jour</p>
                    <div className="mt-2 flex h-16 items-end gap-1">
                      {stats.par_jour.slice(-14).map((j) => (
                        <div key={j.date} className="group relative w-5" title={`${j.date} : ${j.n}`}>
                          <div className="w-full rounded-t bg-vert-500/70 transition-colors group-hover:bg-terre-500" style={{ height: `${Math.max(6, (j.n / maxJour) * 60)}px` }} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Reveal>
          </div>

          {/* Couverture */}
          <Reveal className="carte mt-4 overflow-hidden">
            <div className="border-b border-vert-800/10 px-5 py-3.5">
              <h2 className="font-display text-lg font-semibold">Couverture culture × paramètre</h2>
              <p className="mt-0.5 text-[12px] text-encre-500">Nombre de relectures ayant renseigné au moins une borne pour ce paramètre.</p>
            </div>
            <div className="relative overflow-x-auto" role="region" aria-label="Couverture culture × paramètre (défilement horizontal si nécessaire)" tabIndex={0}>
              <table className="w-full min-w-[560px] border-collapse text-[12.5px]">
                <thead>
                  <tr className="text-left text-[10.5px] uppercase tracking-[.06em] text-encre-500">
                    <th className="px-4 py-2 font-semibold">Culture</th>
                    {PARAMS.map((p) => <th key={p.id} className="px-2 py-2 text-center font-semibold">{p.nom.split(' ')[0]}</th>)}
                    <th className="px-4 py-2 text-right font-semibold">Complétude</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.couverture.map((c) => {
                    const ref = stats.cultures.find((x) => x.id === c.culture);
                    return (
                      <tr key={c.culture} className="border-t border-vert-800/10">
                        <th className="px-4 py-2 text-left font-medium text-vert-900">{c.nom}</th>
                        {PARAMS.map((p) => {
                          const n = c.cellules[p.id] || 0;
                          return (
                            <td key={p.id} className="px-2 py-2 text-center">
                              <span className={`inline-grid h-7 w-7 place-items-center rounded-md text-[11px] font-semibold tabular-nums ${
                                n === 0 ? 'bg-vert-800/[.05] text-encre-500/50' : n < 3 ? 'bg-vert-200 text-vert-800' : 'bg-vert-600 text-white'
                              }`}>{n || '–'}</span>
                            </td>
                          );
                        })}
                        <td className="px-4 py-2 text-right text-[11.5px] tabular-nums text-encre-500">{ref ? ref.completude : 0} %</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Reveal>

          {/* Sources */}
          <Reveal className="carte mt-4 p-5">
            <h2 className="font-display text-lg font-semibold">Sources les plus citées</h2>
            {stats.sources.length === 0 ? (
              <p className="mt-2 text-sm text-encre-500">Aucune source pour l’instant.</p>
            ) : (
              <ul className="mt-3 divide-y divide-vert-800/10">
                {stats.sources.slice(0, 8).map((s, i) => (
                  <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
                    <span className="min-w-0 flex-1 text-[13px] leading-relaxed text-encre-700">{s.texte}</span>
                    <span className="shrink-0 text-[11.5px] text-encre-500">{pl(s.count, 'valeur')} · {s.cultures.join(', ')}</span>
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        </>
      )}

      {/* Notifications */}
      {notifs && (
        <div className="carte mt-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">Notifications des formulaires reçus</h2>
              <p className="mt-1 text-[12.5px] leading-relaxed text-encre-500">
                Chaque envoi d’agronome est journalisé et notifié à l’équipe.
              </p>
            </div>
            <button type="button" className="btn-secondaire px-4 py-2 text-[12.5px]" onClick={testerNotification}>
              Envoyer un e-mail de test
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-vert-800/10 bg-creme-50/70 p-3.5">
              <p className="text-[10.5px] font-bold uppercase tracking-[.12em] text-encre-500">E-mail de réception</p>
              <p className="mt-1 break-all text-[13px] font-medium text-vert-900">{notifs.reglages.email_destinataire || 'non renseigné'}</p>
              <p className={`mt-1 text-[11.5px] ${notifs.reglages.email_actif ? 'text-vert-700' : 'text-terre-700'}`}>
                {notifs.reglages.email_actif ? 'envoi automatique actif (Resend)' : 'clé RESEND_API_KEY absente (journal seulement)'}
              </p>
            </div>
            <div className="rounded-xl border border-vert-800/10 bg-creme-50/70 p-3.5">
              <p className="text-[10.5px] font-bold uppercase tracking-[.12em] text-encre-500">WhatsApp</p>
              <p className="mt-1 text-[13px] font-medium text-vert-900">{notifs.reglages.whatsapp_destinataire || 'non renseigné'}</p>
              <p className="mt-1 text-[11.5px] text-encre-500">lien pré-rempli dans le tableau ci-dessous</p>
            </div>
            <div className="rounded-xl border border-vert-800/10 bg-creme-50/70 p-3.5">
              <p className="text-[10.5px] font-bold uppercase tracking-[.12em] text-encre-500">Journal local</p>
              <p className="mt-1 text-[13px] font-medium text-vert-900">{notifs.recentes.length} notification(s)</p>
              <p className="mt-1 text-[11.5px] text-encre-500">backend/data/notifications.jsonl</p>
            </div>
          </div>

          {messageTest && (
            <div className="mt-3">
              <Encadre ton={messageTest.ton === 'erreur' ? 'erreur' : messageTest.ton === 'succes' ? 'succes' : 'info'}>{messageTest.texte}</Encadre>
            </div>
          )}

          <p className="mt-3 text-[11.5px] leading-relaxed text-encre-500">
            Réglages dans le fichier <code className="rounded bg-vert-800/5 px-1">.env</code> : <code className="rounded bg-vert-800/5 px-1">NOTIF_EMAIL</code>,{' '}
            <code className="rounded bg-vert-800/5 px-1">NOTIF_WHATSAPP</code>, puis <code className="rounded bg-vert-800/5 px-1">RESEND_API_KEY</code> et{' '}
            <code className="rounded bg-vert-800/5 px-1">MAIL_FROM</code> pour l’envoi automatique (Resend uniquement, aucun SMTP).
          </p>

          {notifs.recentes.length > 0 && (
            <ul className="mt-4 divide-y divide-vert-800/10">
              {notifs.recentes.slice(0, 5).map((n, i) => (
                <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-2 text-[12.5px]">
                  <span className="text-encre-700">
                    <strong className="font-semibold text-vert-900">{n.reference}</strong> — {n.agronome}
                    <span className="ml-2 text-encre-500">{dateFr(n.date)}</span>
                  </span>
                  <span className="flex items-center gap-2 text-[11.5px]">
                    <span className={n.email?.actif ? 'text-vert-700' : n.email?.erreur ? 'text-red-700' : 'text-encre-500'}>
                      {n.email?.actif ? 'e-mail envoyé' : n.email?.erreur ? 'e-mail en échec' : 'e-mail non configuré'}
                    </span>
                    {n.whatsapp?.lien && (
                      <a href={n.whatsapp.lien} target="_blank" rel="noreferrer" className="font-semibold text-vert-800 underline decoration-terre-400 underline-offset-2">
                        ouvrir WhatsApp
                      </a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Dossiers partenaires */}
      {partenaires && (
        <div className="carte mt-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">Dossiers partenaires (AGRIKONNECT)</h2>
              <p className="mt-1 text-[12.5px] leading-relaxed text-encre-500">
                Candidatures déposées via le formulaire « Devenir partenaire ». {partenaires.total} dossier(s) enregistré(s).
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-secondaire px-4 py-2 text-[12.5px]" onClick={testerEmailPartenaire}>
                Envoyer un e-mail de test
              </button>
              <a href={apiUrl('/api/admin/partenaires.csv')} className="btn-secondaire px-4 py-2 text-[12.5px]">
                Exporter en CSV
              </a>
              <button type="button" className="btn-secondaire px-4 py-2 text-[12.5px]" onClick={charger}>Actualiser</button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-vert-800/10 bg-creme-50/70 p-3.5">
              <p className="text-[10.5px] font-bold uppercase tracking-[.12em] text-encre-500">Réception des dossiers</p>
              <p className="mt-1 break-all text-[13px] font-medium text-vert-900">{partenaires.email?.destinataire || 'non renseigné'}</p>
              <p className={`mt-1 text-[11.5px] ${partenaires.email?.actif ? 'text-vert-700' : 'text-terre-700'}`}>
                {partenaires.email?.actif
                  ? 'envoi actif (Resend)'
                  : partenaires.email?.message}
              </p>
            </div>
            <div className="rounded-xl border border-vert-800/10 bg-creme-50/70 p-3.5">
              <p className="text-[10.5px] font-bold uppercase tracking-[.12em] text-encre-500">Expéditeur</p>
              <p className="mt-1 break-all text-[13px] font-medium text-vert-900">{partenaires.email?.expediteur || 'non renseigné'}</p>
              <p className="mt-1 text-[11.5px] text-encre-500">MAIL_FROM dans le fichier .env</p>
            </div>
          </div>

          {messagePartenaire && (
            <div className="mt-3">
              <Encadre ton={messagePartenaire.ton === 'erreur' ? 'erreur' : messagePartenaire.ton === 'succes' ? 'succes' : 'info'}>
                {messagePartenaire.texte}
              </Encadre>
            </div>
          )}

          {partenaires.dossiers.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-vert-800/20 p-6 text-center text-[13px] text-encre-500">
              Aucun dossier pour l’instant. Le formulaire public est disponible à l’adresse <code className="rounded bg-vert-800/5 px-1">/partenaires/rejoindre</code>.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto" role="region" aria-label="Dossiers partenaires (défilement horizontal si nécessaire)" tabIndex={0}>
              <table className="w-full min-w-[720px] border-collapse text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-vert-800/15 text-[10.5px] uppercase tracking-[.1em] text-encre-500">
                    <th scope="col" className="py-2 pr-3">Référence</th>
                    <th scope="col" className="py-2 pr-3">Candidat</th>
                    <th scope="col" className="py-2 pr-3">Type</th>
                    <th scope="col" className="py-2 pr-3">Apports</th>
                    <th scope="col" className="py-2 pr-3">Pays</th>
                    <th scope="col" className="py-2 pr-3">Reçu le</th>
                    <th scope="col" className="py-2">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {partenaires.dossiers.map((d) => (
                    <tr key={d.id} className="border-b border-vert-800/10 align-top">
                      <td className="py-2.5 pr-3 font-mono text-[11.5px] text-vert-800">{d.reference}</td>
                      <td className="py-2.5 pr-3">
                        <p className="font-semibold text-vert-900">{d.nom}</p>
                        <p className="text-[11.5px] text-encre-500">{d.organisation}</p>
                        <a className="text-[11.5px] text-terre-700 underline decoration-dotted" href={`mailto:${d.email}`}>{d.email}</a>
                      </td>
                      <td className="py-2.5 pr-3 text-encre-600">{d.type_partie}</td>
                      <td className="py-2.5 pr-3 text-encre-600">{d.apports.join(', ') || '—'}</td>
                      <td className="py-2.5 pr-3 text-encre-600">{d.pays}</td>
                      <td className="py-2.5 pr-3 text-encre-500">{dateFr(d.cree_le)}</td>
                      <td className="py-2.5">
                        <select
                          className="champ px-2 py-1 text-[11.5px]"
                          value={d.statut}
                          onChange={(e) => changerStatut(d.id, e.target.value)}
                          aria-label={`Statut du dossier ${d.reference}`}
                        >
                          {['NOUVEAU', 'EN_ECHANGE', 'QUALIFIE', 'ECARTE'].map((s) => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Liste des relectures */}
      <div className="carte mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-vert-800/10 px-5 py-3.5">
          <h2 className="font-display text-lg font-semibold">Relectures reçues <span className="ml-1 text-sm font-normal text-encre-500">({liste.length})</span></h2>
          <div className="relative">
            <IconeLoupe className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-encre-500" />
            <label htmlFor="recherche" className="sr-only">Rechercher une relecture</label>
            <input
              id="recherche"
              className="champ w-full py-2 pl-9 text-[13px] sm:w-72"
              placeholder="Référence, nom, organisation, contact…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>
        </div>

        {liste.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-encre-500">Aucune relecture à afficher.</p>
        ) : (
          <div className="relative overflow-x-auto" role="region" aria-label="Relectures reçues (défilement horizontal si nécessaire)" tabIndex={0}>
            <table className="w-full min-w-[760px] border-collapse text-[13px]">
              <thead>
                <tr className="bg-creme-100/70 text-left text-[10.5px] uppercase tracking-[.06em] text-encre-500">
                  <th className="px-4 py-2.5 font-semibold">Référence</th>
                  <th className="px-4 py-2.5 font-semibold">Agronome</th>
                  <th className="px-4 py-2.5 font-semibold">Date de relecture</th>
                  <th className="px-4 py-2.5 text-center font-semibold">Cultures</th>
                  <th className="px-4 py-2.5 text-center font-semibold">Valeurs</th>
                  <th className="px-4 py-2.5 text-center font-semibold">Citation</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {liste.map((r) => (
                  <tr key={r.id} className="border-t border-vert-800/10 align-top hover:bg-vert-800/[.025]">
                    <td className="px-4 py-3 font-semibold tabular-nums text-vert-900">{r.reference}</td>
                    <td className="px-4 py-3">
                      <span className="block font-medium text-encre-900">{r.agronome.nom}</span>
                      <span className="block text-[11.5px] text-encre-500">{r.agronome.organisation}</span>
                    </td>
                    <td className="px-4 py-3 text-[12.5px] text-encre-500">{r.agronome.date_relecture}</td>
                    <td className="px-4 py-3 text-center text-[12px] text-encre-500">{r.cultures.length}/9</td>
                    <td className="px-4 py-3 text-center tabular-nums">{r.validite?.valeurs ?? 0}</td>
                    <td className="px-4 py-3 text-center text-[12px]">{r.agronome.accord ? <span className="text-vert-700">oui</span> : <span className="text-encre-500">non</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" className="btn-fantome px-2.5 py-1 text-[12px]" onClick={() => setDetail(r)}>Détail</button>
                        <a href={apiUrl(`/api/relectures/${r.id}/pdf`)} className="btn-fantome px-2 py-1 text-[12px]" title="Télécharger le PDF rempli"><IconePdf /></a>
                        <button type="button" className="btn-fantome px-2.5 py-1 text-[12px] text-red-700 hover:bg-red-50" onClick={() => supprimer(r)}>Suppr.</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 flex items-start gap-2 text-[11.5px] leading-relaxed text-encre-500">
        <IconeInfo className="mt-[1px] shrink-0" />
        L’export CSV contient une ligne par culture et par paramètre, sources comprises : il peut être
        réimporté tel quel. Les contacts ne sont visibles que dans cet espace protégé.
      </p>

      {detail && <FicheDetail relecture={detail} onFermer={() => setDetail(null)} />}
    </section>
  );
}

function FicheDetail({ relecture, onFermer }) {
  const d = relecture.donnees;
  const cultures = CULTURES.filter((c) => PARAMS.some((p) => Object.values(d.cultures[c.id]?.parametres?.[p.id] || {}).some((v) => v && String(v).trim() !== '' && v !== 'PROVISIONAL')) || d.cultures[c.id]?.remarques);

  useEffect(() => {
    const surEchap = (e) => { if (e.key === 'Escape') onFermer(); };
    window.addEventListener('keydown', surEchap);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', surEchap); document.body.style.overflow = ''; };
  }, [onFermer]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-vert-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="titre-detail" onClick={onFermer}>
      <div
        className="max-h-[92vh] w-full max-w-3xl animate-monte overflow-y-auto rounded-t-xl3 bg-creme-50 p-5 shadow-leve sm:rounded-xl3 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="surtitre">{relecture.reference} · {dateFr(relecture.cree_le)}</p>
            <h2 id="titre-detail" className="mt-1 font-display text-xl font-semibold">{relecture.donnees.agronome.nom}</h2>
            <p className="text-[12.5px] text-encre-500">{relecture.donnees.agronome.organisation}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-vert-700"><IconeTelephone className="text-[13px]" /> {relecture.donnees.agronome.contact}</p>
            <p className="mt-1 text-[12px] text-encre-500">Date de relecture : {relecture.donnees.agronome.date_relecture} · Citation : {relecture.donnees.agronome.accord ? 'acceptée' : 'refusée'}</p>
          </div>
          <button type="button" className="btn-fantome px-3 py-2" onClick={onFermer}>Fermer</button>
        </div>

        <div className="mt-5 space-y-4">
          {cultures.length === 0 && <p className="text-sm text-encre-500">Aucune culture renseignée.</p>}
          {cultures.map((c) => {
            const cc = d.cultures[c.id];
            return (
              <div key={c.id} className="rounded-xl border border-vert-800/10 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-[14px] font-semibold text-vert-900">{c.nom}</h3>
                  <span className="text-[11.5px] text-encre-500">Zone : {cc.zone}</span>
                </div>
                <div className="mt-2 space-y-2">
                  {PARAMS.map((p) => {
                    const v = cc.parametres?.[p.id];
                    const saisi = v && ['imin', 'imax', 'tmin', 'tmax', 'source'].some((k) => String(v[k] || '').trim() !== '');
                    if (!saisi) return null;
                    return (
                      <div key={p.id} className="rounded-lg bg-creme-50 px-3 py-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[12.5px] font-semibold text-vert-900">{p.nom} <span className="font-normal text-encre-500">({p.unite})</span></span>
                          <BadgeStatut statut={v.statut} />
                        </div>
                        <p className="mt-0.5 text-[12px] tabular-nums text-encre-700">
                          idéal {(v.imin || '—').replace('.', ',')} – {(v.imax || '—').replace('.', ',')} · toléré {(v.tmin || '—').replace('.', ',')} – {(v.tmax || '—').replace('.', ',')}
                        </p>
                        <p className="mt-0.5 text-[11.5px] leading-relaxed text-encre-500">Source : {v.source || <span className="text-red-700">manquante</span>}</p>
                      </div>
                    );
                  })}
                </div>
                {cc.remarques && <p className="mt-2 rounded-lg bg-terre-50 px-3 py-2 text-[12px] leading-relaxed text-encre-700">{cc.remarques}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
