import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import Photo from '../components/Photo.jsx';
import { IMAGES, IMAGES_CULTURES, ALT_CULTURES } from '../assets/images.js';
import Reveal from '../components/Reveal.jsx';
import { Encadre, TitreSection, BadgeStatut } from '../components/Ui.jsx';
import { CULTURES, PARAMS, CHAMPS } from '@shared/model.js';
import {
  IconeFleche, IconeBouclier, IconeAttention, IconeCheck, IconeInfo, IconeLien, IconeCible,
  IconeEnveloppe, IconeTelephone
} from '../components/Icons.jsx';

const REGLES = [
  {
    n: '1',
    titre: 'Une case vide signifie « valeur inconnue »',
    texte: 'Ne mettez pas 0 pour dire « je ne sais pas ». Laissez vide. Une plage partiellement renseignée est acceptable ; une valeur inventée ne l’est pas.',
    ton: 'info'
  },
  {
    n: '2',
    titre: 'Toute valeur saisie doit avoir sa source',
    texte: 'Ouvrage, article, fiche EcoCrop/GAEZ, essai de terrain, observation locale… Indiquez une source précise, vérifiable. Sans source, la valeur ne peut pas être exploitée.',
    ton: 'attention'
  },
  {
    n: '3',
    titre: 'Plage idéale d’abord, plage tolérée si vous savez',
    texte: 'La plage idéale est celle que le logiciel utilise pour recommander une culture. La plage tolérée décrit les limites de survie : elle est facultative.',
    ton: 'info'
  },
  {
    n: '4',
    titre: 'PROVISIONAL ou VALIDATED',
    texte: 'PROVISIONAL : valeur proposée, non encore relue. VALIDATED : vous avez relu, corrigé si besoin, et vous l’acceptez. Une valeur validée peut être citée à votre nom, avec votre accord.',
    ton: 'succes'
  },
  {
    n: '5',
    titre: 'Salinité : seule la valeur maximale compte',
    texte: 'Pour la salinité (EC, en dS/m), le logiciel n’utilise que le maximum supporté. Le minimum n’est pas demandé.',
    ton: 'info'
  },
  {
    n: '6',
    titre: 'Température de l’air ≠ température du sol',
    texte: 'Les fiches EcoCrop donnent une température de l’air ; les sondes du projet mesurent le sol. Notez l’écart et vos réserves dans les remarques de la culture.',
    ton: 'attention'
  }
];

export default function Guide() {
  const [contact, setContact] = useState(null);
  const email = contact?.email || 'oseedoro@gmail.com';
  const whatsapp = contact?.whatsapp || '+21655116324';
  const whatsappHref = contact?.whatsapp_lien || `https://wa.me/${whatsapp.replace(/\D/g, '')}`;

  useEffect(() => {
    api.config().then((c) => setContact(c.contact || null)).catch(() => {});
  }, []);

  return (
    <>
      <section className="conteneur pb-4 pt-12 sm:pt-16">
        <Reveal>
          <TitreSection
            niveau={1}
            surtitre="Comment remplir"
            titre="Un guide court, à garder ouvert pendant la relecture"
            intro="Le formulaire reprend page par page le document « Plages agronomiques par culture ». Voici les règles qui comptent, et ce que devient votre relecture une fois envoyée."
          />
        </Reveal>
        <Reveal delai={80} className="mt-6 flex flex-wrap gap-3">
          <Link to="/formulaire" className="btn-primaire">Ouvrir le formulaire <IconeFleche className="text-base" /></Link>
          <Link to="/cultures" className="btn-secondaire">Voir les 9 cultures</Link>
        </Reveal>

        <Reveal delai={140} className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr]">
          <Photo
            src={IMAGES.sonde.grand}
            alt="Sonde d’humidité du sol plantée près d’un jeune plant"
            etiquette="Sur le terrain"
            legende="La sonde mesure ; l’agronome interprète. Votre relecture relie les deux."
            ratio="aspect-[16/9]"
            priorite
          />
          <Photo
            src={IMAGES_CULTURES.manioc.petit}
            alt={ALT_CULTURES.manioc}
            etiquette="Culture 01"
            legende="Manioc — Manihot esculenta, culture de base en Équateur et au Bandundu."
            ratio="aspect-[16/9]"
          />
        </Reveal>
      </section>

      {/* Les règles */}
      <section className="conteneur py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {REGLES.map((r, i) => (
            <Reveal key={r.n} delai={(i % 3) * 70} className="carte flex flex-col p-5">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-vert-800 text-[13px] font-bold text-creme-100">{r.n}</span>
                <h2 className="font-display text-[17px] font-semibold leading-tight">{r.titre}</h2>
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-encre-500">{r.texte}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Anatomie d'une ligne */}
      <section className="border-y border-vert-800/10 bg-white/45 py-14">
        <div className="conteneur">
          <Reveal>
            <TitreSection surtitre="Repères visuels" titre="Comment lire une ligne du tableau" />
          </Reveal>
          <div className="mt-8 space-y-4">
            <Reveal
              className="relative overflow-x-auto rounded-xl2 border border-vert-800/10 bg-white p-4 sm:p-5"
              role="region"
              aria-label="Exemple de ligne annotée (défilement horizontal si nécessaire)"
              tabIndex={0}
            >
              <table className="w-full min-w-[560px] border-collapse text-[12.5px]">
                <caption className="sr-only">Exemple de ligne annotée</caption>
                <thead>
                  <tr className="text-left text-[10.5px] uppercase tracking-[.08em] text-encre-500">
                    <th className="pb-2 pr-3 font-semibold">Paramètre</th>
                    {CHAMPS.map((ch) => <th key={ch.id} className="pb-2 px-2 text-center font-semibold">{ch.label}</th>)}
                    <th className="pb-2 px-2 font-semibold">Source précise</th>
                    <th className="pb-2 px-2 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-vert-800/10 align-top">
                    <th className="py-3 pr-3 text-left font-semibold text-vert-900">pH du sol</th>
                    <td className="px-2 py-3 text-center"><span className="whitespace-nowrap rounded bg-terre-100 px-2 py-1 text-terre-800">borne basse</span></td>
                    <td className="px-2 py-3 text-center"><span className="whitespace-nowrap rounded bg-terre-100 px-2 py-1 text-terre-800">borne haute</span></td>
                    <td className="px-2 py-3 text-center"><span className="whitespace-nowrap rounded bg-creme-200 px-2 py-1 text-encre-700">facultatif</span></td>
                    <td className="px-2 py-3 text-center"><span className="whitespace-nowrap rounded bg-creme-200 px-2 py-1 text-encre-700">facultatif</span></td>
                    <td className="px-2 py-3"><span className="rounded bg-vert-100 px-2 py-1 text-vert-800">obligatoire dès qu’une valeur est saisie</span></td>
                    <td className="px-2 py-3"><BadgeStatut statut="PROVISIONAL" /></td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-3 text-[11.5px] text-encre-500">
                Les quatre bornes décrivent deux plages : idéale (utilisée par le logiciel) et tolérée (limites de survie).
              </p>
            </Reveal>

            <Reveal delai={100} className="grid gap-4 md:grid-cols-2">
              <Encadre ton="info" titre="Les 5 paramètres" >
                <ul className="mt-1 space-y-1.5">
                  {PARAMS.map((p) => (
                    <li key={p.id} className="flex items-baseline justify-between gap-3">
                      <span>{p.nom}</span>
                      <span className="shrink-0 rounded bg-vert-800/5 px-1.5 py-0.5 text-[11px] font-semibold text-encre-500">{p.unite}</span>
                    </li>
                  ))}
                </ul>
              </Encadre>
              <Encadre ton="attention" titre="Le bloc « Référence EcoCrop (FAO), provisoire »">
                pH idéal et toléré, température idéale et tolérée, adresse de la fiche GAEZ consultée et
                date de consultation. C’est un point de départ : votre relecture le corrige.
              </Encadre>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Statuts */}
      <section className="conteneur py-14">
        <Reveal>
          <TitreSection surtitre="Cycle de vie d’une valeur" titre="Du provisoire au validé" />
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Reveal className="carte p-6">
            <BadgeStatut statut="PROVISIONAL" />
            <h3 className="mt-4 font-display text-xl font-semibold">PROVISIONAL</h3>
            <p className="mt-2 text-sm leading-relaxed text-encre-500">
              Valeur proposée (souvent issue d’EcoCrop ou d’une estimation) qui n’a pas encore été
              relue par un agronome. Elle reste exploitable avec prudence et n’est jamais citée
              comme une validation.
            </p>
          </Reveal>
          <Reveal delai={90} className="carte border-vert-500/30 p-6 ring-1 ring-inset ring-vert-500/10">
            <BadgeStatut statut="VALIDATED" />
            <h3 className="mt-4 font-display text-xl font-semibold">VALIDATED</h3>
            <p className="mt-2 text-sm leading-relaxed text-encre-500">
              Vous avez relu la valeur, vous l’avez corrigée si nécessaire et vous l’acceptez. Avec
              votre accord, votre nom et la date de relecture sont cités comme validation.
            </p>
          </Reveal>
        </div>

        <Reveal delai={120} className="mt-6">
          <Encadre ton="succes" titre="Consentement">
            La case « J’accepte que mon nom et la date de relecture soient cités comme validation des
            valeurs que j’ai marquées VALIDATED » est facultative. Sans elle, votre relecture est
            conservée mais reste anonyme.
          </Encadre>
        </Reveal>
      </section>

      {/* Après l'envoi */}
      <section className="border-y border-vert-800/10 bg-vert-900/[.03] py-14">
        <div className="conteneur">
          <Reveal>
            <TitreSection surtitre="Après l’envoi" titre="Ce que devient votre relecture" />
          </Reveal>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icone: IconeCheck, titre: 'Enregistrée', texte: 'Un récapitulatif s’affiche avec une référence unique au format PA-année-numéro.' },
              { icone: IconeLien, titre: 'Conservée', texte: 'Votre relecture est conservée avec les valeurs, les sources et les statuts que vous avez indiqués.' },
              { icone: IconeCible, titre: 'Analysée', texte: 'Le tableau de bord agrège les valeurs validées par culture et par paramètre.' },
              { icone: IconeBouclier, titre: 'Consultable', texte: 'Le récapitulatif peut être imprimé, et le formulaire PDF rempli si le serveur le permet.' }
            ].map((e, i) => (
              <Reveal as="li" key={e.titre} delai={i * 70} className="carte p-5">
                <e.icone className="text-xl text-vert-600" />
                <h3 className="mt-3 font-display text-lg font-semibold">{e.titre}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-encre-500">{e.texte}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="conteneur py-14">
        <Reveal>
          <TitreSection surtitre="Questions fréquentes" titre="Les cas qui reviennent" />
        </Reveal>
        <div className="mt-8 space-y-3">
          {[
            {
              q: 'Dois-je remplir les neuf cultures ?',
              r: `Non. Renseignez uniquement les cultures que vous maîtrisez. Le formulaire accepte une relecture partielle : au moins une valeur ou une remarque suffit pour l’envoyer. Les ${CULTURES.length} cultures restent disponibles si vous souhaitez compléter plus tard.`
            },
            {
              q: 'Je connais la plage idéale mais pas la plage tolérée.',
              r: 'Aucun problème : la plage tolérée est facultative. Laissez les deux cases vides, le logiciel travaillera avec la plage idéale.'
            },
            {
              q: 'Puis-je revenir sur ma relecture ?',
              r: 'Votre brouillon est conservé dans votre navigateur jusqu’à l’envoi. Une fois envoyée, contactez-nous par e-mail ou WhatsApp en rappelant la référence pour demander une correction.'
            },
            {
              q: 'Le nom scientifique est-il exact ?',
              r: 'Les noms scientifiques du document sont à confirmer ou corriger. Si vous constatez une erreur, corrigez le champ prévu à cet effet dans la fiche de la culture.'
            },
            {
              q: 'Une définition n’est pas claire, puis-je appeler ?',
              r: 'Oui. Indiquez-le dans les remarques ou écrivez-nous : un appel peut être organisé. Le retour du formulaire se fait par e-mail ou WhatsApp.'
            },
            {
              q: 'Mes données sont-elles publiques ?',
              r: 'Non. Le détail des relectures et les contacts sont réservés à l’équipe du projet. Seuls des agrégats (nombre de relectures, valeurs validées) sont visibles publiquement.'
            }
          ].map((item, i) => (
            <Reveal key={item.q} delai={i * 40}>
              <details className="group carte overflow-hidden p-0 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[15px] font-semibold text-vert-900 transition-colors hover:bg-vert-800/[.03]">
                  {item.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-vert-800/15 text-vert-700 transition-transform duration-300 group-open:rotate-45">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                </summary>
                <div className="border-t border-vert-800/10 px-5 py-4 text-[14px] leading-relaxed text-encre-500">{item.r}</div>
              </details>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10">
          <h2 className="font-display text-xl font-semibold">Les cultures que vous allez relire</h2>
          <p className="mt-1.5 text-sm text-encre-500">
            Neuf cultures, deux zones (Équateur, Bandundu). Ouvrez le formulaire pour relire celles que vous maîtrisez.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-9">
            {CULTURES.map((c) => (
              <Link key={c.id} to={`/formulaire?culture=${c.id}`} className="group overflow-hidden rounded-xl border border-vert-800/10 bg-white/70">
                <img
                  src={IMAGES_CULTURES[c.id].petit}
                  alt={ALT_CULTURES[c.id]}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-doux group-hover:scale-105"
                />
                <span className="block truncate px-2 py-1.5 text-center text-[11px] font-semibold text-vert-900">{c.nom}</span>
              </Link>
            ))}
          </div>
        </Reveal>

        <Reveal delai={60} className="mt-10 carte p-6">
          <h2 className="font-display text-xl font-semibold">Nous joindre</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-encre-500">
            Une valeur à discuter, une définition qui n’est pas claire, un besoin d’appel ?
            Écrivez-nous : votre relecture est identifiée par sa référence (PA-année-numéro).
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-vert-800/10 bg-creme-50/70 p-4">
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em] text-encre-500">
                <IconeEnveloppe className="text-[14px]" /> Par e-mail
              </span>
              <a href={`mailto:${email}?subject=Relecture%20des%20plages%20agronomiques`} className="lien-souligne mt-1.5 inline-block break-all text-[14.5px]">
                {email}
              </a>
            </div>
            <div className="rounded-xl border border-vert-800/10 bg-creme-50/70 p-4">
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em] text-encre-500">
                <IconeTelephone className="text-[14px]" /> Par WhatsApp
              </span>
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="lien-souligne mt-1.5 inline-block text-[14.5px]">
                {whatsapp}
              </a>
            </div>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-encre-500">
            Chaque formulaire envoyé déclenche aussi une notification automatique à l’équipe du projet.
          </p>
        </Reveal>

        <Reveal delai={80} className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl2 bg-vert-800 px-6 py-7 text-creme-100">
          <div className="flex items-start gap-3">
            <IconeInfo className="mt-0.5 shrink-0 text-xl text-terre-300" />
            <p className="max-w-xl text-sm leading-relaxed text-creme-200/85">
              Vous êtes prêt ? Le formulaire se remplit en plusieurs étapes, avec sauvegarde
              automatique de votre brouillon.
            </p>
          </div>
          <Link to="/formulaire" className="btn-terre shrink-0">Remplir le formulaire</Link>
        </Reveal>
      </section>
    </>
  );
}
