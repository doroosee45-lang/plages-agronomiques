import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';
import Photo from '../components/Photo.jsx';
import { TitreSection, Encadre, Etiquette } from '../components/Ui.jsx';
import { useCompteur } from '../hooks/useReveal.js';
import { api } from '../lib/api.js';
import { IMAGES_PARTENAIRES as PH, ALT_PARTENAIRES as ALTP } from '../assets/images.js';
import { CULTURES, PARAMS, CHAMPS } from '@shared/model.js';
import { IMAGES, IMAGES_CULTURES, ALT_CULTURES } from '../assets/images.js';
import {
  IconeFleche, IconeCible, IconeArchive, IconeGraphique, IconeFeuille, IconeBouclier, IconeInfo,
  IconeCheck
} from '../components/Icons.jsx';

function Chiffre({ valeur, label }) {
  const n = useCompteur(valeur);
  return (
    <div className="text-center">
      <p className="font-display text-[34px] font-semibold leading-none text-vert-900 tabular-nums sm:text-[42px]">{n}</p>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[.14em] text-encre-500">{label}</p>
    </div>
  );
}

const ETAPES = [
  { n: '01', titre: 'Vous vous identifiez', texte: 'Nom et prénom, fonction / organisation, téléphone ou e-mail, date de relecture au format jj/mm/aaaa.' },
  { n: '02', titre: 'Vous relisez les valeurs', texte: 'Pour chaque culture : pH, température de l’air, humidité volumique, salinité maximale et profondeur racinaire.' },
  { n: '03', titre: 'Chaque valeur reçoit sa source', texte: 'Une valeur sans source ne peut pas être retenue. Une case laissée vide signifie « valeur inconnue ».' },
  { n: '04', titre: 'Vous marquez le statut', texte: 'PROVISIONAL tant que la valeur n’est pas relue, VALIDATED quand vous l’acceptez. Votre nom et la date sont cités avec votre accord.' }
];

/* ---------------------- Message de Meya Dorodoro ------------------------ */
function MessageMeya() {
  return (
    <section className="relative overflow-hidden border-y border-vert-800/10 bg-white/55 py-16 sm:py-20">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-terre-200/30 blur-3xl" aria-hidden="true" />
      <div className="conteneur relative grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-start lg:gap-14">
        <Reveal>
          <p className="surtitre">Message de l’auteur</p>
          <h2 className="mt-2 font-display text-[26px] font-semibold leading-tight sm:text-4xl">
            Message de Meya Dorodoro
          </h2>

          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-encre-700 sm:text-base">
            <p>Bonjour,</p>
            <p>
              Je suis <strong className="font-semibold text-vert-900">Meya Dorodoro</strong>, ingénieur en
              informatique, spécialisé en développement logiciel et développeur Full Stack. Je développe une application d’aide à la
              décision pour des agriculteurs des zones d’<strong className="font-semibold text-vert-900">Équateur</strong>{' '}
              et de <strong className="font-semibold text-vert-900">Bandundu</strong> (RDC). Elle recommande
              des cultures selon l’état du sol, mesuré par des sondes.
            </p>
            <p>
              Pour fonder ces recommandations, j’ai besoin de votre expertise. Ce document contient, pour
              9 cultures, les plages de pH, de température, d’humidité du sol, de salinité et de
              profondeur racinaire. Les valeurs du cadre « Référence EcoCrop » viennent de la base de la
              FAO et sont provisoires.
            </p>
            <p className="font-medium text-vert-900">Pourriez-vous :</p>
            <ol className="space-y-2.5 pl-1">
              {[
                'relire et corriger les valeurs proposées ;',
                'compléter les cases jaunes que vous connaissez, en indiquant la source (publication, institut, expérience de terrain) ;',
                'laisser vide toute case dont vous n’êtes pas sûr.'
              ].map((t, i) => (
                <li key={i} className="flex gap-3 rounded-xl bg-creme-50/80 p-3 ring-1 ring-inset ring-vert-800/10">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-vert-800 text-[12px] font-bold text-creme-100">
                    {i + 1}
                  </span>
                  <span className="text-[14.5px] leading-relaxed">{t}</span>
                </li>
              ))}
            </ol>
            <p>
              Si vous êtes d’accord, je citerai votre nom et la date de relecture comme validation. Je
              peux aussi vous appeler pour parcourir ce document ensemble.
            </p>
            <p className="font-display text-[17px] italic text-vert-800">Merci beaucoup pour votre aide.</p>
          </div>

          <div className="mt-7 flex items-center gap-4 border-t border-vert-800/10 pt-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-vert-800 font-display text-lg font-semibold text-creme-100">
              MD
            </span>
            <div>
              <p className="font-display text-[16px] font-semibold text-vert-900">Meya Dorodoro</p>
              <p className="text-[12.5px] text-encre-500">Ingénieur en informatique · développement logiciel Full Stack · RDC</p>
            </div>
          </div>
        </Reveal>

        <Reveal delai={120} className="lg:sticky lg:top-24">
          <Photo
            src={IMAGES.sonde.grand}
            alt="Sonde d’humidité du sol enfoncée dans une terre meuble, à côté d’une jeune pousse"
            etiquette="État du sol mesuré"
            legende="Les sondes relèvent l’état du sol ; vos relectures disent ce que chaque culture y tolère."
            ratio="aspect-[4/3]"
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Encadre ton="info" titre="Votre relecture">
              Quelques minutes suffisent : vous pouvez ne remplir que les cultures que vous maîtrisez.
            </Encadre>
            <Encadre ton="attention" titre="Une valeur = une source">
              Publication, institut, essai de terrain : précisez toujours l’origine.
            </Encadre>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function Accueil() {
  const [resume, setResume] = useState(null);

  useEffect(() => {
    api.resumePublic().then((r) => setResume(r.resume)).catch(() => setResume(null));
  }, []);

  const totalValeurs = resume
    ? resume.cultures.reduce((n, c) => n + PARAMS.reduce((m, p) => m + (c.parametres[p.id]?.validees || 0), 0), 0)
    : 0;
  const totalRelectures = resume ? resume.total_relectures : 0;

  return (
    <>
      {/* ------------------------------- Héros ------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-vert-300/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-32 top-40 h-[320px] w-[320px] rounded-full bg-terre-200/40 blur-3xl" aria-hidden="true" />

        <div className="conteneur relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <div>
            <Reveal as="p" className="surtitre">Équateur · Bandundu — République démocratique du Congo</Reveal>
            <Reveal as="h1" delai={80} className="mt-4 font-display text-[34px] font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[56px]">
              Les plages agronomiques de neuf cultures, <span className="text-terre-600">relues par vos soins</span>.
            </Reveal>
            <Reveal as="p" delai={160} className="mt-5 max-w-xl text-[15px] leading-relaxed text-encre-500 sm:text-[17px]">
              L’application d’aide à la décision recommande une culture à partir des mesures des
              sondes de sol. Pour que ces recommandations soient justes, elle a besoin de votre
              expertise : ce formulaire recueille, centralise et facilite l’analyse de vos relectures
              des plages idéales et tolérées.
            </Reveal>

            <Reveal delai={240} className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/formulaire" className="btn-primaire group">
                Remplir le formulaire
                <IconeFleche className="text-base transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link to="/guide" className="btn-secondaire">
                <IconeInfo className="text-base" /> Guide de remplissage
              </Link>
            </Reveal>

            <Reveal delai={320} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-encre-500">
              <span className="inline-flex items-center gap-1.5"><IconeFeuille className="text-vert-500" /> 9 cultures</span>
              <span className="inline-flex items-center gap-1.5"><IconeCible className="text-vert-500" /> 5 paramètres</span>
              <span className="inline-flex items-center gap-1.5"><IconeBouclier className="text-vert-500" /> 4 bornes par paramètre</span>
              <span className="inline-flex items-center gap-1.5"><IconeGraphique className="text-vert-500" /> Source obligatoire</span>
            </Reveal>
          </div>

          <Reveal delai={200} className="relative">
            <Photo
              src={IMAGES.hero.grand}
              alt="Agriculteur dans son champ, dans les environs de Kalemie, en République démocratique du Congo"
              etiquette="Relecture agronomique"
              legende="« Toutes les propositions faites par l’IA doivent être relues, corrigées et validées. »"
              ratio="aspect-[4/3] sm:aspect-[3/2]"
              priorite
            >
              <div className="absolute right-4 top-4">
                <Etiquette className="bg-vert-950/55 text-creme-50 backdrop-blur-sm">Plage idéale · plage tolérée</Etiquette>
              </div>
            </Photo>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-vert-800/10 bg-white/85 px-4 py-3 shadow-doux">
              <p className="text-[12.5px] text-encre-500">
                <span className="font-display text-lg font-semibold text-vert-900">20 valeurs</span> par culture
              </p>
              <p className="text-[11.5px] font-medium uppercase tracking-[.1em] text-terre-700">5 paramètres × 4 bornes</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ Bandeau ------------------------------ */}
      <section className="border-y border-vert-800/10 bg-white/50">
        <div className="conteneur grid grid-cols-2 gap-6 py-8 sm:grid-cols-4 sm:py-10">
          <Chiffre valeur={CULTURES.length} label="Cultures à relire" />
          <Chiffre valeur={PARAMS.length} label="Paramètres mesurés" />
          <Chiffre valeur={CHAMPS.length} label="Bornes par paramètre" />
          <Chiffre valeur={totalRelectures} label="Relectures reçues" />
        </div>
      </section>

      {/* --------------------- Message de Meya Dorodoro ---------------------- */}
      <MessageMeya />

      {/* ---------------------------- Objectif ------------------------------- */}
      <section className="conteneur py-16 sm:py-20">
        <Reveal>
          <TitreSection
            surtitre="L’objectif"
            titre="Collecter, centraliser, faciliter l’analyse"
            intro="Le document de référence demande aux agronomes de relire les plages proposées, de les corriger avec une source précise et de valider ou non chaque valeur. Cette plateforme organise ce travail."
          />
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { icone: IconeFeuille, titre: 'Collecter', texte: 'Un formulaire unique, utilisable sur téléphone, tablette et ordinateur, qui suit exactement la structure du document : neuf cultures, cinq paramètres, quatre bornes.' },
            { icone: IconeArchive, titre: 'Centraliser', texte: 'Chaque relecture reçoit une référence (PA-année-numéro) et reste consultable, exportable en CSV et réimportable pour analyse.' },
            { icone: IconeGraphique, titre: 'Analyser', texte: 'Un tableau de bord montre les valeurs validées par culture et par paramètre, les sources citées et les zones couvertes.' }
          ].map((c, i) => (
            <Reveal key={c.titre} delai={i * 90} className="carte-survol group p-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-vert-800/10 text-2xl text-vert-700 transition-colors duration-300 group-hover:bg-vert-800 group-hover:text-creme-100">
                <c.icone />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold">{c.titre}</h3>
              <p className="mt-2 text-sm leading-relaxed text-encre-500">{c.texte}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------- Bandeau photo « du sol au conseil » ------------ */}
      <section className="conteneur">
        <Reveal className="grid gap-6 overflow-hidden rounded-xl3 border border-vert-800/10 bg-vert-900 shadow-leve lg:grid-cols-[1.1fr_1fr]">
          <Photo
            src={IMAGES.sonde.petit}
            alt="Sonde d’humidité du sol dans une parcelle nouvellement travaillée"
            ratio="aspect-[4/3] lg:aspect-auto lg:h-full"
            arrondi="rounded-none"
            voile="leger"
            className="border-0 shadow-none"
          />
          <div className="px-6 py-8 sm:px-10 sm:py-12">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-terre-300">Du sol au conseil</p>
            <h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-creme-50 sm:text-3xl">
              Sans plages fiables, la meilleure sonde ne sert à rien.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-creme-200/85">
              Une sonde dit « pH 5,4, humidité 38 % ». Encore faut-il savoir ce que le manioc, le maïs
              ou le palmier tolèrent réellement dans vos sols. C’est exactement ce que votre relecture
              apporte : la connaissance du terrain, avec sa source.
            </p>
            <ul className="mt-5 space-y-2.5 text-[13.5px] text-creme-200/90">
              {['Plage idéale : ce que le logiciel utilise', 'Plage tolérée : les limites de survie', 'Case vide : valeur inconnue, jamais inventée'].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <IconeCheck className="mt-0.5 shrink-0 text-base text-terre-300" /> {t}
                </li>
              ))}
            </ul>
            <Link to="/guide" className="btn-terre mt-7">
              Lire le guide de remplissage <IconeFleche className="text-base" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------ Étapes ------------------------------- */}
      <section className="py-16 sm:py-20">
        <div className="conteneur">
          <Reveal>
            <TitreSection surtitre="Comment ça se passe" titre="Quatre étapes, aucune surprise" />
          </Reveal>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ETAPES.map((e, i) => (
              <Reveal as="li" key={e.n} delai={i * 80} className="relative carte p-5">
                <span className="font-display text-3xl font-semibold text-vert-200">{e.n}</span>
                <h3 className="mt-2 font-display text-lg font-semibold leading-snug">{e.titre}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-encre-500">{e.texte}</p>
              </Reveal>
            ))}
          </ol>

          <Reveal delai={120} className="mt-8 grid gap-4 md:grid-cols-2">
            <Encadre ton="info" titre="Case vide = valeur inconnue">
              N’inventez rien : si vous ne connaissez pas une valeur, laissez la case vide.
              Une plage incomplète reste exploitable, une valeur fausse non.
            </Encadre>
            <Encadre ton="attention" titre="Température de l’air, pas du sol">
              Les fiches EcoCrop donnent une température de l’air ; les sondes du projet mesurent le
              sol. Signalez l’écart dans les remarques de la culture.
            </Encadre>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------- Cultures ------------------------------ */}
      <section className="border-y border-vert-800/10 bg-white/45 py-16 sm:py-20">
        <div className="conteneur">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <TitreSection
              surtitre="Les cultures du formulaire"
              titre="Neuf cultures, deux zones"
              intro="Chaque culture est identifiée par son nom scientifique, sa zone et une référence EcoCrop (FAO) provisoire à confirmer."
            />
            <Link to="/cultures" className="btn-secondaire shrink-0">
              Voir les plages <IconeFleche className="text-base" />
            </Link>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CULTURES.map((c, i) => (
              <Reveal key={c.id} delai={(i % 3) * 60}>
                <Link
                  to={`/cultures#${c.id}`}
                  className="group block h-full overflow-hidden rounded-xl2 border border-vert-800/10 bg-white shadow-doux transition-all duration-300 ease-doux hover:-translate-y-1 hover:border-vert-800/25 hover:shadow-carte"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-vert-900">
                    <img
                      src={IMAGES_CULTURES[c.id].petit}
                      alt={ALT_CULTURES[c.id]}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] ease-doux group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-vert-950/75 via-vert-950/10 to-transparent" aria-hidden="true" />
                    <span className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-creme-100/90 text-[11px] font-bold text-vert-900">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
                      <div className="min-w-0">
                        <p className="truncate font-display text-[16px] font-semibold text-creme-50">{c.nom}</p>
                        <p className="truncate text-[11px] italic text-creme-200/80">{c.scientifique}</p>
                      </div>
                      <IconeFleche className="shrink-0 text-base text-creme-100 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------- Programme partenaire ------------------------ */}
      <section className="conteneur pt-16">
        <Reveal className="grid overflow-hidden rounded-xl3 border border-vert-800/10 bg-white shadow-carte lg:grid-cols-[0.9fr_1.1fr]">
          <Photo
            src={PH.hero.grand}
            alt={ALTP.hero}
            ratio="aspect-[16/11] lg:aspect-auto lg:h-full"
            arrondi="rounded-none"
            voile="leger"
            className="order-first border-0 lg:order-last"
          />
          <div className="p-6 sm:p-10">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-terre-700">Programme partenaires</p>
            <h2 className="mt-3 font-display text-[24px] font-semibold leading-tight sm:text-[32px]">
              AGRIKONNECT AFRICA : l’infrastructure numérique de l’agriculture africaine.
            </h2>
            <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-encre-500">
              Ce référentiel est la première brique d’un projet plus vaste : identité numérique des
              producteurs, carte agricole, marché B2B, données de sol traçables et projets présentés
              à des partenaires. Nous cherchons des partenaires financiers, techniques, institutionnels
              et de terrain pour construire les étapes suivantes.
            </p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ['V1 à V5', 'étapes finançables séparément'],
                ['RDC d’abord', 'puis Afrique centrale'],
                ['Aucune promesse', 'de rendement, ni collecte de fonds']
              ].map(([t, d]) => (
                <div key={t} className="rounded-xl border border-vert-800/10 bg-creme-50/70 p-3">
                  <dt className="font-display text-[14px] font-semibold text-vert-900">{t}</dt>
                  <dd className="mt-0.5 text-[11.5px] leading-snug text-encre-500">{d}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/partenaires" className="btn-primaire">
                Découvrir le dossier de projet <IconeFleche className="text-base" />
              </Link>
              <Link to="/partenaires/rejoindre" className="btn-secondaire">Devenir partenaire</Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------- Appel final ---------------------------- */}
      <section className="conteneur pb-4 pt-16">
        <Reveal className="relative overflow-hidden rounded-xl3 bg-vert-800 px-6 py-10 text-creme-100 shadow-leve sm:px-12 sm:py-14">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-terre-500/20 blur-2xl" aria-hidden="true" />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_.6fr] lg:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.2em] text-terre-300">Appel aux agronomes</p>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-creme-50 sm:text-3xl">
                Votre relecture vaut mieux que dix valeurs supposées.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-creme-200/85">
                Une relecture prend quelques minutes. Vous pouvez ne remplir que les cultures que
                vous maîtrisez, revenir plus tard, et demander un appel si une définition n’est pas claire.
                Le retour se fait par e-mail ou par WhatsApp.
              </p>
              {totalValeurs > 0 && (
                <p className="mt-4 text-xs text-creme-200/60">
                  À ce jour : {totalValeurs} valeur{totalValeurs > 1 ? 's' : ''} validée{totalValeurs > 1 ? 's' : ''} par les agronomes.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <Link to="/formulaire" className="btn-terre w-full">Commencer ma relecture</Link>
              <Link to="/analyse" className="btn w-full border border-creme-100/30 text-creme-100 hover:bg-creme-100/10">
                Voir l’analyse des réponses
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
