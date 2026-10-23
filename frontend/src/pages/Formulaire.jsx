import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useBrouillon } from '../hooks/useReveal.js';
import { api } from '../lib/api.js';
import { CULTURES, relectureVide, valider, nbValeursCulture, cultureRenseignee } from '@shared/model.js';
import { Progression, Encadre } from '../components/Ui.jsx';
import Identite from '../components/form/Identite.jsx';
import CultureFiche from '../components/form/CultureFiche.jsx';
import Verification from '../components/form/Verification.jsx';
import { IconeCheck, IconeFleche, IconeInfo, IconeFeuille } from '../components/Icons.jsx';
import Photo from '../components/Photo.jsx';
import { IMAGES } from '../assets/images.js';

const CLE_BROUILLON = 'plages-agronomiques-brouillon-v2';
const ETAPES = [
  { titre: 'Votre identité', court: 'Identité' },
  { titre: 'Les cultures', court: 'Cultures' },
  { titre: 'Vérification', court: 'Envoi' }
];

export default function Formulaire() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [donnees, setDonnees, effacer] = useBrouillon(CLE_BROUILLON, relectureVide());
  const [etape, setEtape] = useState(0);
  const [erreursAffichees, setErreursAffichees] = useState(false);
  const [ouvertes, setOuvertes] = useState(() => new Set(params.get('culture') ? [params.get('culture')] : []));
  const [enCours, setEnCours] = useState(false);
  const [erreurEnvoi, setErreurEnvoi] = useState(null);
  const [sauvegarde, setSauvegarde] = useState(null);

  const resultat = useMemo(() => valider(donnees), [donnees]);
  const totalValeurs = useMemo(
    () => CULTURES.reduce((n, c) => n + nbValeursCulture(donnees.cultures[c.id]), 0),
    [donnees]
  );
  const culturesRenseignees = useMemo(
    () => CULTURES.filter((c) => cultureRenseignee(donnees.cultures[c.id])).length,
    [donnees]
  );

  /* Horodatage discret de la sauvegarde automatique */
  useEffect(() => {
    const t = setTimeout(() => {
      setSauvegarde(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    }, 700);
    return () => clearTimeout(t);
  }, [donnees]);

  /* Ouverture d'une culture demandée par l'URL */
  useEffect(() => {
    const cible = params.get('culture');
    if (!cible) return;
    setOuvertes((s) => (s.has(cible) ? s : new Set([...s, cible])));
    // La fiche n'existe qu'à l'étape « Les cultures » : on ne défile qu'une fois affichée.
    if (etape !== 1) return undefined;
    const doux = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => {
      document.getElementById(`culture-${cible}`)?.scrollIntoView({ behavior: doux ? 'smooth' : 'auto', block: 'start' });
    }, 250);
    return () => clearTimeout(t);
  }, [params, etape]);

  const setChampAgronome = (champ, valeur) =>
    setDonnees((d) => ({ ...d, agronome: { ...d.agronome, [champ]: valeur } }));

  const setCulture = (id, valeur) =>
    setDonnees((d) => ({ ...d, cultures: { ...d.cultures, [id]: valeur } }));

  const erreursEtape = (n) => {
    if (n === 0) return resultat.erreurs.filter((e) => e.champ.startsWith('agronome.'));
    return [];
  };

  const allerA = (n, forcer = false) => {
    if (n > 0 && !forcer) {
      const bloque = erreursEtape(0);
      if (bloque.length) { setErreursAffichees(true); setEtape(0); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    }
    setEtape(n);
    setErreursAffichees(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editerCulture = (id) => {
    setEtape(1);
    setOuvertes((s) => new Set([...s, id]));
    setTimeout(() => document.getElementById(`culture-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  };

  const envoyer = async () => {
    setErreursAffichees(true);
    if (!resultat.valide) {
      setErreurEnvoi(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setEnCours(true);
    setErreurEnvoi(null);
    try {
      const r = await api.envoyer(donnees);
      effacer();
      setDonnees(relectureVide());
      navigate(`/recapitulatif/${r.id}?jeton=${encodeURIComponent(r.jetons_pdf)}`, { replace: true });
    } catch (e) {
      setErreurEnvoi(
        window.location.protocol === 'file:'
          ? 'Vous consultez la version hors ligne : l’envoi nécessite le serveur de la plateforme. Votre brouillon est conservé dans ce navigateur.'
          : (e.message || 'Le serveur n’a pas répondu. Vérifiez votre connexion puis réessayez.')
      );
    } finally {
      setEnCours(false);
    }
  };

  const reinitialiser = () => {
    if (!window.confirm('Effacer le brouillon et toutes les valeurs déjà saisies ? Cette action est irréversible.')) return;
    effacer();
    setDonnees(relectureVide());
    setOuvertes(new Set());
    setEtape(0);
    setErreursAffichees(false);
  };

  const toutesOuvertes = ouvertes.size === CULTURES.length;

  return (
    <>
      {/* En-tête du formulaire */}
      <section className="border-b border-vert-800/10 bg-white/40">
        <div className="conteneur py-8 sm:py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="surtitre">Formulaire de relecture</p>
              <h1 className="mt-2 font-display text-[26px] font-semibold leading-tight sm:text-4xl">
                Plages agronomiques par culture
              </h1>
              <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-encre-500">
                Renseignez uniquement ce que vous maîtrisez. Une case vide signifie « valeur inconnue » ;
                toute valeur saisie doit porter une source précise.
              </p>
            </div>
            <div className="text-left lg:text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-encre-500">Brouillon</p>
              <p className="mt-0.5 text-[12.5px] text-vert-700">
                {sauvegarde ? `Enregistré à ${sauvegarde}` : 'Sauvegarde automatique'}
              </p>
              <button type="button" onClick={reinitialiser} className="mt-1 text-[11.5px] text-encre-500 underline decoration-dotted underline-offset-2 hover:text-red-700">
                Effacer le brouillon
              </button>
            </div>
            <Photo
              src={IMAGES.sonde.petit}
              alt="Sonde de mesure des paramètres du sol dans une parcelle maraîchère"
              ratio="aspect-[16/10]"
              voile="aucun"
              className="hidden w-60 shrink-0 self-center lg:block"
            />
          </div>

          {/* Fil d'étapes */}
          <ol className="mt-7 grid gap-2 sm:grid-cols-3" aria-label="Étapes du formulaire">
            {ETAPES.map((e, i) => {
              const actif = i === etape;
              const fait = i < etape;
              return (
                <li key={e.titre}>
                  <button
                    type="button"
                    onClick={() => allerA(i, i <= etape)}
                    aria-current={actif ? 'step' : undefined}
                    className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-300 ${
                      actif
                        ? 'border-vert-700 bg-vert-800 text-creme-100 shadow-doux'
                        : fait
                          ? 'border-vert-500/30 bg-vert-50 text-vert-800'
                          : 'border-vert-800/10 bg-white/60 text-encre-500 hover:border-vert-800/25'
                    }`}
                  >
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                      actif ? 'bg-creme-100 text-vert-900' : fait ? 'bg-vert-600 text-white' : 'bg-vert-800/10 text-encre-500'
                    }`}>
                      {fait ? <IconeCheck className="text-[12px]" /> : i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-[.12em] opacity-70">Étape {i + 1}</span>
                      <span className="block truncate text-[13px] font-semibold">{e.titre}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <Progression
            className="mt-4"
            valeur={etape === 0 ? 5 : etape === 1 ? Math.min(90, 20 + totalValeurs) : 100}
            label={etape === 1
              ? `Progression : ${culturesRenseignees} culture${culturesRenseignees > 1 ? 's' : ''} renseignée${culturesRenseignees > 1 ? 's' : ''} sur ${CULTURES.length} · ${totalValeurs} borne${totalValeurs > 1 ? 's' : ''}`
              : undefined}
          />
        </div>
      </section>

      <section className="conteneur py-8 sm:py-10">
        {etape === 0 && (
          <div className="mx-auto max-w-3xl">
            {params.get('culture') && (
              <div className="mb-5">
                <Encadre ton="info" titre="Culture présélectionnée">
                  Vous avez choisi de relire{' '}
                  <strong className="font-semibold text-vert-900">
                    {CULTURES.find((c) => c.id === params.get('culture'))?.nom || 'cette culture'}
                  </strong>
                  . Complétez d’abord votre identité : la fiche de la culture s’ouvrira automatiquement à l’étape suivante.
                </Encadre>
              </div>
            )}
            <Identite
              agronome={donnees.agronome}
              setChamp={setChampAgronome}
              erreurs={resultat.erreurs}
              afficherErreurs={erreursAffichees}
            />
            <div className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link to="/guide" className="btn-fantome justify-center text-[13px]">
                <IconeInfo className="text-base" /> Revoir le guide
              </Link>
              <button type="button" className="btn-primaire" onClick={() => allerA(1)}>
                Continuer vers les cultures <IconeFleche className="text-base" />
              </button>
            </div>
          </div>
        )}

        {etape === 1 && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-vert-800/10 text-vert-700"><IconeFeuille className="text-lg" /></span>
                <div>
                  <h2 className="font-display text-xl font-semibold sm:text-2xl">Les neuf cultures</h2>
                  <p className="text-[12.5px] text-encre-500">Ouvrez une culture pour saisir ses plages. {culturesRenseignees} / {CULTURES.length} renseignée(s).</p>
                </div>
              </div>
              <button
                type="button"
                className="btn-secondaire px-4 py-2 text-[12.5px]"
                onClick={() => setOuvertes(toutesOuvertes ? new Set() : new Set(CULTURES.map((c) => c.id)))}
              >
                {toutesOuvertes ? 'Tout replier' : 'Tout déplier'}
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {CULTURES.map((c) => (
                <CultureFiche
                  key={c.id}
                  culture={c}
                  donnees={donnees.cultures[c.id]}
                  erreurs={resultat.erreurs}
                  alertes={resultat.alertes}
                  afficherErreurs={erreursAffichees}
                  ouvert={ouvertes.has(c.id)}
                  onToggle={() => setOuvertes((s) => {
                    const n = new Set(s);
                    n.has(c.id) ? n.delete(c.id) : n.add(c.id);
                    return n;
                  })}
                  onChange={(v) => setCulture(c.id, v)}
                />
              ))}
            </div>

            {totalValeurs === 0 && culturesRenseignees === 0 && (
              <div className="mt-5">
                <Encadre ton="info" titre="Aucune valeur pour l’instant">
                  Ouvrez une culture et saisissez au moins une valeur — ou une remarque — pour continuer.
                  Les cultures que vous ne connaissez pas peuvent rester vides.
                </Encadre>
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" className="btn-secondaire justify-center" onClick={() => allerA(0, true)}>
                Retour à l’identité
              </button>
              <button type="button" className="btn-primaire" onClick={() => allerA(2)}>
                Vérifier et envoyer <IconeFleche className="text-base" />
              </button>
            </div>
          </div>
        )}

        {etape === 2 && (
          <div className="mx-auto max-w-3xl">
            <Verification
              donnees={donnees}
              resultat={resultat}
              alertes={resultat.alertes}
              onEditer={editerCulture}
              onEnvoyer={envoyer}
              enCours={enCours}
              erreurEnvoi={erreurEnvoi}
            />
            <div className="mt-6">
              <button type="button" className="btn-secondaire" onClick={() => allerA(1, true)}>
                Retour aux cultures
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
