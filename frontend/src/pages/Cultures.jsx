import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';
import { BadgeStatut, Encadre } from '../components/Ui.jsx';
import { api } from '../lib/api.js';
import Photo from '../components/Photo.jsx';
import { IMAGES, IMAGES_CULTURES, ALT_CULTURES } from '../assets/images.js';
import { CULTURES, PARAMS, CHAMPS, ECOCROP_CHAMPS } from '@shared/model.js';
import {
  IconeFleche, IconeGoutte, IconeThermometre, IconeSel, IconeRacine, IconeCible, IconeInfo, IconeLien
} from '../components/Icons.jsx';

const ICONES = { ph: IconeGoutte, temp: IconeThermometre, hum: IconeGoutte, ec: IconeSel, racine: IconeRacine };

/* 5.5 -> 5,5 (écriture française) */
const fr = (v) => String(v).replace('.', ',');

const TIRET = <span className="text-encre-500/40" title="Case vide : valeur inconnue">—</span>;

function TablePlage({ culture, agregat }) {
  return (
    <div
      className="relative overflow-x-auto rounded-xl border border-vert-800/10 bg-white/70"
      role="region"
      aria-label={`Tableau des plages — ${culture.nom} (défilement horizontal si nécessaire)`}
      tabIndex={0}
    >
      <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
        <caption className="sr-only">
          Plages agronomiques de la culture {culture.nom} : valeurs idéales et tolérées par paramètre
        </caption>
        <thead>
          <tr className="bg-vert-800 text-creme-100">
            <th scope="col" className="px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[.08em]">Paramètre</th>
            {CHAMPS.map((ch) => (
              <th key={ch.id} scope="col" className="px-2.5 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[.08em]">
                {ch.label}
              </th>
            ))}
            <th scope="col" className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[.08em]">Source</th>
            <th scope="col" className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[.08em]">Statut</th>
          </tr>
        </thead>
        <tbody>
          {PARAMS.map((p, i) => {
            const Icone = ICONES[p.id];
            const agg = agregat && agregat.parametres ? agregat.parametres[p.id] : null;
            const plages = (agg && agg.plages) || {};
            const aDesValeurs = CHAMPS.some((ch) => plages[ch.id]);
            return (
              <tr key={p.id} className={i % 2 ? 'bg-white/40' : 'bg-white/80'}>
                <th scope="row" className="px-3.5 py-2.5 font-medium text-vert-900">
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <Icone className="shrink-0 text-[15px] text-vert-500" />
                    {p.nom}
                    <span className="rounded bg-vert-800/5 px-1.5 py-0.5 text-[10.5px] font-semibold text-encre-500">{p.unite}</span>
                  </span>
                </th>
                {CHAMPS.map((ch) => (
                  <td key={ch.id} className="whitespace-nowrap px-2.5 py-2.5 text-center">
                    {plages[ch.id]
                      ? <span className="tabular-nums text-encre-900">
                          {plages[ch.id].min === plages[ch.id].max
                            ? fr(plages[ch.id].min)
                            : <>{fr(plages[ch.id].min)} – {fr(plages[ch.id].max)}</>}
                        </span>
                      : TIRET}
                  </td>
                ))}
                <td className="whitespace-nowrap px-3 py-2.5">
                  {agg && agg.sources > 0
                    ? <span className="inline-flex items-center gap-1 text-[12px] text-vert-700"><IconeInfo className="text-[13px]" />{agg.sources} source{agg.sources > 1 ? 's' : ''}</span>
                    : <span className="text-[12px] text-terre-700">à citer</span>}
                </td>
                <td className="px-3 py-2.5">
                  {agg && agg.validees > 0
                    ? <BadgeStatut statut="VALIDATED" />
                    : agg && agg.relectures > 0
                      ? <BadgeStatut statut="PROVISIONAL" />
                      : <span className="whitespace-nowrap text-[12px] text-encre-500/70">à renseigner</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-vert-800/10 bg-creme-50/60 px-3.5 py-2 text-[11.5px] leading-relaxed text-encre-500">
        Les plages affichées consolident uniquement les valeurs marquées VALIDATED. « — » signifie
        qu’aucune valeur validée n’est disponible pour cette borne.
      </p>
    </div>
  );
}

function BlocEcocrop() {
  const groupes = [
    { titre: 'pH (sol)', champs: ['ph_imin', 'ph_imax', 'ph_tmin', 'ph_tmax'] },
    { titre: 'Température de l’air', champs: ['t_imin', 't_imax', 't_tmin', 't_tmax'] }
  ];
  const libelle = (id) => ECOCROP_CHAMPS.find((c) => c.id === id)?.label || id;
  return (
    <div className="rounded-xl border border-dashed border-vert-800/25 bg-creme-50/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-[13px] font-semibold text-vert-900">Référence EcoCrop (FAO), provisoire</h4>
        <span className="etiquette bg-terre-100 text-terre-800">À confirmer</span>
      </div>

      <dl className="mt-3 space-y-2.5 text-[12.5px]">
        {groupes.map((g) => (
          <div key={g.titre}>
            <dt className="text-[11px] font-semibold uppercase tracking-[.08em] text-encre-500">{g.titre}</dt>
            <dd className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-encre-700">
              {g.champs.map((c) => (
                <span key={c} className="inline-flex items-baseline gap-1.5">
                  <span className="text-[11.5px] text-encre-500">{libelle(c)}</span>
                  {TIRET}
                </span>
              ))}
            </dd>
          </div>
        ))}
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[.08em] text-encre-500">Fiche GAEZ consultée</dt>
          <dd className="mt-1 flex items-center gap-1.5 text-[12px] text-encre-500">
            <IconeLien className="shrink-0 text-[13px]" /> Adresse et date de consultation : à indiquer lors de la relecture
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-[11.5px] leading-relaxed text-encre-500">
        Ces valeurs servent de point de départ : votre relecture les corrige et les source.
      </p>
    </div>
  );
}

export default function Cultures() {
  const [resume, setResume] = useState(null);

  useEffect(() => {
    api.resumePublic().then((r) => setResume(r.resume)).catch(() => {});
  }, []);

  const agregatDe = (id) => resume?.cultures.find((c) => c.id === id) || null;

  return (
    <>
      <section className="conteneur pb-6 pt-12 sm:pt-16">
        <Reveal className="mb-10 grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <div>
            <p className="surtitre">Référentiel du formulaire</p>
            <h1 className="mt-2 font-display text-[30px] font-semibold leading-tight sm:text-4xl">
              Neuf cultures, cinq paramètres, quatre bornes
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-encre-500">
              Voici la structure exacte du document. Chaque culture possède un nom scientifique à
              confirmer, une zone, une référence EcoCrop provisoire et cinq paramètres mesurés.
              Les cellules vides restent inconnues tant qu’un agronome ne les a pas renseignées et sourcées.
            </p>
          </div>
          <Photo
            src={IMAGES.sonde.grand}
            alt="Sonde d’humidité enfoncée dans le sol d’une parcelle agricole"
            etiquette="Mesures de terrain"
            legende="pH, humidité, salinité, température : ce que les sondes relèvent, culture par culture."
            ratio="aspect-[16/10]"
            priorite
          />
        </Reveal>
        <Reveal delai={80} className="mt-8 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[11px] font-bold uppercase tracking-[.14em] text-encre-500">Aller à</span>
          {CULTURES.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="group flex items-center gap-2 rounded-full border border-vert-800/15 bg-white/70 py-1 pl-1 pr-3 text-[12.5px] font-medium text-vert-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-vert-700 hover:bg-white hover:shadow-doux"
            >
              <img
                src={IMAGES_CULTURES[c.id].petit}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="h-7 w-7 rounded-full object-cover"
              />
              {c.nom}
            </a>
          ))}
        </Reveal>

        <Reveal delai={120} className="mt-6 grid gap-4 md:grid-cols-3">
          <Encadre ton="info" titre="Plage idéale">
            Valeurs utilisées par le logiciel pour recommander une culture.
          </Encadre>
          <Encadre ton="info" titre="Plage tolérée (facultative)">
            Limites de survie de la culture. Elles encadrent la plage idéale.
          </Encadre>
          <Encadre ton="attention" titre="Toute valeur a sa source">
            Une valeur sans source précise ne peut pas être retenue. La case vide signifie « inconnue ».
          </Encadre>
        </Reveal>
      </section>

      <section className="conteneur space-y-14 pb-8">
        {CULTURES.map((c, index) => {
          const agg = agregatDe(c.id);
          return (
            <Reveal as="article" key={c.id} delai={40} className="scroll-mt-24" id={c.id}>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-vert-800/10 pb-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[.16em] text-terre-700">
                    Culture {String(index + 1).padStart(2, '0')}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-semibold sm:text-[28px]">{c.nom}</h2>
                  <p className="mt-0.5 text-sm italic text-encre-500">
                    {c.scientifique} <span className="not-italic text-encre-500/70">(nom scientifique à confirmer)</span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="etiquette bg-creme-200 text-encre-700" title="Zone par défaut du formulaire : à confirmer lors de la relecture">
                    Zone : à préciser
                  </span>
                  {agg && agg.relectures > 0 && (
                    <span className="etiquette bg-vert-100 text-vert-800">{agg.relectures} relecture{agg.relectures > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:items-start">
                <Photo
                  src={IMAGES_CULTURES[c.id].petit}
                  alt={ALT_CULTURES[c.id]}
                  ratio="aspect-[4/3] lg:aspect-[4/5]"
                  arrondi="rounded-xl"
                  voile="aucun"
                  className="hidden lg:block"
                />
                <TablePlage culture={c} agregat={agg} />
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
                <BlocEcocrop />
                <div className="flex flex-col justify-between gap-3 rounded-xl bg-vert-800/[.04] p-4">
                  <div>
                    <h4 className="text-[13px] font-semibold text-vert-900">Remarques</h4>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-encre-500">
                      Écart entre la température de l’air (EcoCrop) et celle du sol mesurée par les
                      sondes, doutes, précisions locales, besoin d’un appel : à compléter dans le formulaire.
                    </p>
                  </div>
                  <Link to={`/formulaire?culture=${c.id}`} className="btn-secondaire self-start px-4 py-2 text-[13px]">
                    Relire {c.nom} <IconeFleche className="text-sm" />
                  </Link>
                </div>
              </div>
            </Reveal>
          );
        })}
      </section>

      <section className="conteneur py-10">
        <Reveal className="carte flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <IconeCible className="mt-0.5 shrink-0 text-xl text-terre-600" />
            <div>
              <h2 className="font-display text-lg font-semibold">Une plage vous semble fausse ?</h2>
              <p className="mt-1 text-sm text-encre-500">
                Indiquez la valeur corrigée, sa source précise et marquez-la VALIDATED. C’est exactement ce que le document attend de vous.
              </p>
            </div>
          </div>
          <Link to="/formulaire" className="btn-primaire shrink-0">Contribuer</Link>
        </Reveal>
      </section>
    </>
  );
}
