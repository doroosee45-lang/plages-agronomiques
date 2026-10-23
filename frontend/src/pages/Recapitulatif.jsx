import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api, lienPdf } from '../lib/api.js';
import { CULTURES, PARAMS, CHAMPS } from '@shared/model.js';
import { BadgeStatut, Encadre, Valeur } from '../components/Ui.jsx';
import Reveal from '../components/Reveal.jsx';
import Photo from '../components/Photo.jsx';
import { IMAGES_CULTURES, ALT_CULTURES } from '../assets/images.js';
import {
  IconeCheck, IconeImprimer, IconePdf, IconeFleche, IconeAttention, IconeFeuille
} from '../components/Icons.jsx';

const dateFr = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' });
};

export default function Recapitulatif() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const jeton = params.get('jeton') || '';
  const [relecture, setRelecture] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [pdfDisponible, setPdfDisponible] = useState(false);

  useEffect(() => {
    let vivant = true;
    api.detail(id, jeton)
      .then((r) => { if (vivant) setRelecture(r.relecture); })
      .catch((e) => { if (vivant) setErreur(e.statut === 401 ? 'Ce lien de récapitulatif n’est plus valable. Si vous venez d’envoyer le formulaire, utilisez le lien affiché après l’envoi.' : e.message); });
    api.sante().then((s) => { if (vivant) setPdfDisponible(!!s.pdf); }).catch(() => {});
    return () => { vivant = false; };
  }, [id, jeton]);

  if (erreur) {
    return (
      <section className="conteneur py-16">
        <div className="mx-auto max-w-lg text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-terre-100 text-2xl text-terre-700"><IconeAttention /></span>
          <h1 className="mt-5 font-display text-2xl font-semibold">Récapitulatif indisponible</h1>
          <p className="mt-2 text-sm leading-relaxed text-encre-500">{erreur}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/formulaire" className="btn-primaire">Remplir le formulaire</Link>
            <Link to="/" className="btn-secondaire">Accueil</Link>
          </div>
        </div>
      </section>
    );
  }

  if (!relecture) {
    return (
      <section className="conteneur py-20 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-vert-800/20 border-t-vert-700" aria-hidden="true" />
        <p className="mt-4 text-sm text-encre-500">Chargement du récapitulatif…</p>
      </section>
    );
  }

  const d = relecture.donnees;
  const a = d.agronome;
  const culturesRenseignees = CULTURES.filter((c) => {
    const cc = d.cultures[c.id];
    return PARAMS.some((p) => CHAMPS.some((ch) => String(cc?.parametres?.[p.id]?.[ch.id] || '').trim() !== ''))
      || String(cc?.remarques || '').trim() !== '';
  });
  const alertes = (relecture.validite && relecture.validite.alertes) || [];

  return (
    <section className="conteneur py-10 sm:py-14">
      <Reveal className="mx-auto max-w-4xl">
        <div className="rounded-xl3 border border-vert-500/25 bg-white p-6 shadow-carte sm:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-vert-800/10 pb-5">
            <div className="flex items-start gap-3.5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-vert-100 text-2xl text-vert-700">
                <IconeCheck />
              </span>
              <div>
                <p className="surtitre">Relecture enregistrée</p>
                <h1 className="mt-1 font-display text-2xl font-semibold leading-tight sm:text-[30px]">
                  Merci, {a.nom.split(' ')[0] || 'cher agronome'}.
                </h1>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-encre-500">
                  Votre relecture a bien été enregistrée. Conservez la référence ci-dessous pour tout échange.
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-vert-800 px-4 py-3 text-right text-creme-100">
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-creme-200/70">Référence</p>
              <p className="font-display text-xl font-semibold tabular-nums">{relecture.reference}</p>
            </div>
          </div>

          <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {[
              ['Agronome', a.nom],
              ['Fonction / organisation', a.organisation],
              ['Téléphone ou e-mail', a.contact],
              ['Date de relecture', a.date_relecture],
              ['Citation du nom', a.accord ? 'Acceptée (nom + date cités pour les valeurs VALIDATED)' : 'Refusée — relecture anonyme'],
              ['Reçu le', dateFr(relecture.cree_le)],
              ['Source de saisie', relecture.source_saisie === 'csv' ? 'Import CSV' : 'Formulaire en ligne'],
              ['Cultures renseignées', `${culturesRenseignees.length} / ${CULTURES.length}`]
            ].map(([k, v]) => (
              <div key={k} className="border-b border-vert-800/10 pb-2">
                <dt className="text-[11px] font-semibold uppercase tracking-[.1em] text-encre-500">{k}</dt>
                <dd className="mt-0.5 text-[14px] text-encre-900">{v || '—'}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-8 flex items-center gap-2 font-display text-lg font-semibold">
            <IconeFeuille className="text-vert-600" /> Valeurs transmises
          </h2>
          <div className="mt-3 space-y-3">
            {culturesRenseignees.length === 0 && <p className="text-sm text-encre-500">Aucune valeur n’a été transmise.</p>}
            {culturesRenseignees.map((c) => {
              const cc = d.cultures[c.id];
              const lignes = PARAMS.map((p) => ({ p, v: cc.parametres?.[p.id] })).filter(({ v }) => v && CHAMPS.some((ch) => String(v[ch.id] || '').trim() !== ''));
              return (
                <div key={c.id} className="rounded-xl border border-vert-800/10 bg-creme-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-[14px] font-semibold text-vert-900">
                      {c.nom}
                      <span className="ml-2 font-normal italic text-encre-500">{cc.nom_scientifique || c.scientifique}</span>
                    </h3>
                    <span className="etiquette bg-creme-200 text-encre-700">Zone : {cc.zone}</span>
                  </div>
                  {lignes.length > 0 && (
                    <div className="mt-2.5 relative overflow-x-auto" role="region" aria-label="Valeurs transmises pour cette culture (défilement horizontal si nécessaire)" tabIndex={0}>
                      <table className="w-full min-w-[560px] border-collapse text-[12.5px]">
                        <thead>
                          <tr className="text-left text-[10.5px] uppercase tracking-[.06em] text-encre-500">
                            <th className="py-1 pr-3 font-semibold">Paramètre</th>
                            {CHAMPS.map((ch) => <th key={ch.id} className="px-2 py-1 text-center font-semibold">{ch.label}</th>)}
                            <th className="px-2 py-1 font-semibold">Source</th>
                            <th className="px-2 py-1 font-semibold">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lignes.map(({ p, v }) => (
                            <tr key={p.id} className="border-t border-vert-800/10">
                              <th className="py-1.5 pr-3 text-left font-medium text-vert-900">{p.nom}</th>
                              {CHAMPS.map((ch) => (
                                <td key={ch.id} className="px-2 py-1.5 text-center"><Valeur v={v[ch.id]} /></td>
                              ))}
                              <td className="max-w-[180px] px-2 py-1.5 text-[11.5px] text-encre-500">{v.source || '—'}</td>
                              <td className="px-2 py-1.5"><BadgeStatut statut={v.statut} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {cc.remarques && (
                    <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-[12.5px] leading-relaxed text-encre-700">
                      <span className="font-semibold text-vert-900">Remarques : </span>{cc.remarques}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {alertes.length > 0 && (
            <div className="mt-6">
              <Encadre ton="attention" titre="Points signalés (non bloquants)">
                <ul className="mt-1 space-y-1">
                  {alertes.slice(0, 6).map((al, i) => <li key={i}>• {al.message}</li>)}
                </ul>
              </Encadre>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3 border-t border-vert-800/10 pt-5 sans-impression">
            <button type="button" className="btn-secondaire" onClick={() => window.print()}>
              <IconeImprimer className="text-base" /> Imprimer le récapitulatif
            </button>
            {pdfDisponible ? (
              <a href={lienPdf(relecture.id, jeton)} className="btn-secondaire" download>
                <IconePdf className="text-base" /> Télécharger le formulaire PDF rempli
              </a>
            ) : (
              <span className="btn-secondaire cursor-not-allowed opacity-60" aria-disabled="true" title="Python et PyMuPDF ne sont pas installés sur ce serveur.">
                <IconePdf className="text-base" /> PDF rempli indisponible
              </span>
            )}
            <Link to="/formulaire" className="btn-primaire ml-auto">
              Nouvelle relecture <IconeFleche className="text-base" />
            </Link>
          </div>
          {!pdfDisponible && (
            <p className="mt-2 text-[11.5px] leading-relaxed text-encre-500 sans-impression">
              Le PDF rempli est une fonction facultative : il nécessite Python et PyMuPDF sur le serveur.
              Vos données sont enregistrées et l’impression de cette page reste possible.
            </p>
          )}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3 sans-impression">
          {['manioc', 'mais', 'riz'].map((id) => (
            <Photo
              key={id}
              src={IMAGES_CULTURES[id].petit}
              alt={ALT_CULTURES[id]}
              ratio="aspect-[4/3]"
              arrondi="rounded-xl"
              voile="aucun"
            />
          ))}
        </div>
        <p className="mt-4 text-center text-[12px] text-encre-500 sans-impression">
          Merci de faire avancer le référentiel : chaque relecture rapproche ces neuf cultures de la réalité du terrain.
        </p>
      </Reveal>
    </section>
  );
}
