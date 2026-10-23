import { useId } from 'react';
import { PARAMS, CHAMPS, ZONES, ECOCROP_CHAMPS, nbValeursCulture, LIMITS } from '@shared/model.js';
import { IconeGoutte, IconeThermometre, IconeSel, IconeRacine, IconePlus, IconeMoins, IconeInfo, IconeAttention } from '../Icons.jsx';
import { IMAGES_CULTURES, ALT_CULTURES } from '../../assets/images.js';

const ICONES = { ph: IconeGoutte, temp: IconeThermometre, hum: IconeGoutte, ec: IconeSel, racine: IconeRacine };

function Messages({ liste }) {
  if (!liste || !liste.length) return null;
  return (
    <ul className="mt-2 space-y-1">
      {liste.slice(0, 3).map((m, i) => (
        <li key={i} className="flex items-start gap-1.5 text-[12px] font-medium text-red-700">
          <span aria-hidden="true" className="mt-[3px] text-[9px]">●</span>{m}
        </li>
      ))}
    </ul>
  );
}

function ChampParam({ cultureId, param, valeur, erreurs, alertes, afficherErreurs, onChange }) {
  const base = `cultures.${cultureId}.parametres.${param.id}`;
  const erreursDe = (ch) => (afficherErreurs ? erreurs.filter((e) => e.champ === `${base}.${ch}`).map((e) => e.message) : []);
  const alertesDe = (ch) => alertes.filter((e) => e.champ === `${base}.${ch}`).map((e) => e.message);
  const saisies = CHAMPS.filter((ch) => String(valeur[ch.id] || '').trim() !== '').length;
  const Icone = ICONES[param.id];
  const idBase = `p-${cultureId}-${param.id}`;

  return (
    <div className={`rounded-xl border p-4 transition-colors ${saisies > 0 ? 'border-vert-500/30 bg-vert-50/40' : 'border-vert-800/10 bg-white/60'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-[13.5px] font-semibold text-vert-900">
          <Icone className="text-[15px] text-vert-600" />
          {param.nom}
          <span className="rounded bg-vert-800/5 px-1.5 py-0.5 text-[10.5px] font-semibold text-encre-500">{param.unite}</span>
        </h4>
        <span className={`text-[11px] font-semibold ${saisies ? 'text-vert-700' : 'text-encre-500/60'}`}>
          {saisies ? `${saisies} borne${saisies > 1 ? 's' : ''} saisie${saisies > 1 ? 's' : ''}` : 'inconnu (vide)'}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {CHAMPS.map((ch) => {
          const id = `${idBase}-${ch.id}`;
          const estFacultatif = ch.id === 'tmin' || ch.id === 'tmax';
          return (
            <div key={ch.id}>
              <label htmlFor={id} className="mb-1 block text-[11.5px] font-semibold text-encre-700">
                {ch.label}
                {estFacultatif && <span className="ml-1 font-normal text-encre-500/70">facultatif</span>}
              </label>
              <input
                id={id}
                name={id}
                className="champ px-2.5 py-2 text-center text-[14px]"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="—"
                value={valeur[ch.id] ?? ''}
                aria-invalid={erreursDe(ch.id).length > 0}
                onChange={(e) => onChange(ch.id, e.target.value)}
              />
            </div>
          );
        })}
      </div>

      <Messages liste={[...erreursDe('imin'), ...erreursDe('imax'), ...erreursDe('tmin'), ...erreursDe('tmax')]} />

      <div className="mt-3 grid gap-2.5 sm:grid-cols-[1.6fr_.9fr]">
        <div>
          <label htmlFor={`${idBase}-source`} className="mb-1 block text-[11.5px] font-semibold text-encre-700">
            Source précise <span className="text-terre-600">*</span>
            <span className="ml-1 font-normal text-encre-500/70">(obligatoire dès qu’une valeur est saisie)</span>
          </label>
          <input
            id={`${idBase}-source`}
            name={`${idBase}-source`}
            className="champ text-[13.5px]"
            maxLength={LIMITS.sourceMax}
            placeholder="Auteur ou institut, année, page ou lien"
            value={valeur.source || ''}
            aria-invalid={erreursDe('source').length > 0}
            onChange={(e) => onChange('source', e.target.value)}
          />
          <Messages liste={erreursDe('source')} />
        </div>

        <fieldset>
          <legend className="mb-1 block text-[11.5px] font-semibold text-encre-700">Statut</legend>
          <div className="flex rounded-lg bg-vert-800/5 p-1" role="presentation">
            {['PROVISIONAL', 'VALIDATED'].map((s) => (
              <label
                key={s}
                className={`flex-1 cursor-pointer rounded-md px-1.5 py-1.5 text-center text-[10.5px] font-bold uppercase tracking-wide transition-all duration-200 ${
                  valeur.statut === s
                    ? s === 'VALIDATED' ? 'bg-vert-700 text-white shadow-sm' : 'bg-terre-700 text-white shadow-sm'
                    : 'text-encre-500 hover:bg-white/60 hover:text-vert-800'
                }`}
              >
                <input
                  type="radio"
                  name={`${idBase}-statut`}
                  value={s}
                  className="sr-only"
                  checked={valeur.statut === s}
                  onChange={() => onChange('statut', s)}
                />
                {s}
                <span className="sr-only">{s === 'PROVISIONAL' ? ' (non encore relue)' : ' (relue et acceptée)'}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {param.ec && (
        <p className="mt-2 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-terre-700">
          <IconeInfo className="mt-[1px] shrink-0" /> Salinité : seule la valeur maximale est utilisée par le logiciel.
        </p>
      )}
      {param.id === 'temp' && (
        <p className="mt-2 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-terre-700">
          <IconeInfo className="mt-[1px] shrink-0" /> Température de l’air, et non du sol : précisez l’écart dans les remarques.
        </p>
      )}
      {alertesDe('imin').concat(alertesDe('imax'), alertesDe('tmin'), alertesDe('tmax'), alertesDe('statut')).length > 0 && (
        <ul className="mt-2 space-y-1">
          {alertesDe('imin').concat(alertesDe('imax'), alertesDe('tmin'), alertesDe('tmax'), alertesDe('statut')).slice(0, 3).map((a, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11.5px] leading-relaxed text-terre-700">
              <IconeAttention className="mt-[1px] shrink-0" /> {a}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CultureFiche({ culture, donnees, erreurs, alertes, afficherErreurs, ouvert, onToggle, onChange }) {
  const id = useId();
  const nb = nbValeursCulture(donnees);
  const remplie = nb > 0 || String(donnees.remarques || '').trim() !== '';
  const majEco = (champ, valeur) => onChange({ ...donnees, ecocrop: { ...donnees.ecocrop, [champ]: valeur } });

  return (
    <section id={`culture-${culture.id}`} className="scroll-mt-24 overflow-hidden rounded-xl2 border border-vert-800/10 bg-white/70 shadow-doux">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={ouvert}
          aria-controls={`${id}-contenu`}
          className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-vert-800/[.035] sm:px-5"
        >
          <img
            src={IMAGES_CULTURES[culture.id].petit}
            alt={ALT_CULTURES[culture.id]}
            loading="lazy"
            className={`h-12 w-12 shrink-0 rounded-lg object-cover ring-1 transition-all duration-300 ${ouvert ? 'ring-vert-600/40' : 'ring-vert-800/10'}`}
          />
          <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xl transition-transform duration-300 ${ouvert ? 'rotate-180 text-vert-700' : 'text-encre-500'}`}>
            {ouvert ? <IconeMoins /> : <IconePlus />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[17px] font-semibold text-vert-900">{culture.nom}</span>
            <span className="block truncate text-[12px] italic text-encre-500">{donnees.nom_scientifique || culture.scientifique}</span>
          </span>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${
              remplie ? 'bg-vert-100 text-vert-800' : 'bg-creme-200 text-encre-500'
            }`}
          >
            {remplie ? `${nb} valeur${nb > 1 ? 's' : ''}` : 'non renseignée'}
          </span>
        </button>
      </h3>

      <div id={`${id}-contenu`} hidden={!ouvert} className="border-t border-vert-800/10 bg-creme-50/40 px-4 py-5 sm:px-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`ns-${culture.id}`} className="etiquette-champ">
              Nom scientifique <span className="font-normal text-encre-500/70">(à confirmer ou corriger)</span>
            </label>
            <input
              id={`ns-${culture.id}`}
              className="champ italic"
              maxLength={120}
              placeholder={culture.scientifique}
              value={donnees.nom_scientifique || ''}
              onChange={(e) => onChange({ ...donnees, nom_scientifique: e.target.value })}
            />
            <span className="aide-champ">Laissez vide si le nom du document ({culture.scientifique}) est exact.</span>
          </div>
          <div>
            <label htmlFor={`zone-${culture.id}`} className="etiquette-champ">Zone concernée</label>
            <select
              id={`zone-${culture.id}`}
              className="champ"
              value={donnees.zone || 'Les deux'}
              onChange={(e) => onChange({ ...donnees, zone: e.target.value })}
            >
              {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
            <span className="aide-champ">Équateur, Bandundu, ou les deux.</span>
          </div>
        </div>

        {/* Bloc EcoCrop */}
        <details className="mt-5 rounded-xl border border-dashed border-vert-800/25 bg-creme-50 p-3.5 open:bg-white/60">
          <summary className="flex cursor-pointer list-none items-start gap-2 text-[13px] font-semibold text-vert-900 [&::-webkit-details-marker]:hidden">
            <span className="mt-[1px] grid h-5 w-5 shrink-0 place-items-center rounded-full border border-vert-800/20 text-vert-700 transition-transform duration-300 group-open:rotate-45">+</span>
            <span className="min-w-0">
            Référence EcoCrop (FAO), provisoire — à confirmer
            <span className="ml-2 font-normal text-encre-500">(8 plages + fiche GAEZ consultée)</span>
            </span>
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {ECOCROP_CHAMPS.map((ch) => {
              const cid = `eco-${culture.id}-${ch.id}`;
              const errs = afficherErreurs ? erreurs.filter((e) => e.champ === `cultures.${culture.id}.ecocrop.${ch.id}`) : [];
              return (
                <div key={ch.id} className={ch.type === 'url' ? 'col-span-2 sm:col-span-4' : ''}>
                  <label htmlFor={cid} className="mb-1 block text-[11px] font-semibold text-encre-700">{ch.label}</label>
                  <input
                    id={cid}
                    className="champ px-2.5 py-2 text-[13px]"
                    type="text"
                    inputMode={ch.type === 'number' ? 'decimal' : ch.type === 'url' ? 'url' : 'text'}
                    placeholder={ch.type === 'date_fr' ? 'jj/mm/aaaa' : ch.type === 'url' ? 'https://…' : '—'}
                    value={donnees.ecocrop?.[ch.id] || ''}
                    aria-invalid={errs.length > 0}
                    onChange={(e) => majEco(ch.id, e.target.value)}
                  />
                  {errs.length > 0 && <p className="mt-1 text-[11px] font-medium text-red-700">{errs[0].message}</p>}
                </div>
              );
            })}
          </div>
          <p className="mt-2.5 text-[11.5px] leading-relaxed text-encre-500">
            La température EcoCrop est celle de l’air ; les sondes du projet mesurent le sol.
            Signalez l’écart dans les remarques ci-dessous.
          </p>
        </details>

        {/* Paramètres */}
        <div className="mt-5 space-y-3">
          {PARAMS.map((p) => (
            <ChampParam
              key={p.id}
              cultureId={culture.id}
              param={p}
              valeur={donnees.parametres?.[p.id] || { imin: '', imax: '', tmin: '', tmax: '', source: '', statut: 'PROVISIONAL' }}
              erreurs={erreurs}
              alertes={alertes}
              afficherErreurs={afficherErreurs}
              onChange={(champ, valeur) =>
                onChange({
                  ...donnees,
                  parametres: { ...donnees.parametres, [p.id]: { ...(donnees.parametres?.[p.id] || {}), [champ]: valeur } }
                })
              }
            />
          ))}
        </div>

        <div className="mt-5">
          <label htmlFor={`rem-${culture.id}`} className="etiquette-champ">Remarques sur la culture</label>
          <textarea
            id={`rem-${culture.id}`}
            className="champ min-h-[92px] resize-y"
            maxLength={LIMITS.remarquesMax}
            placeholder="Écart entre la température de l’air (EcoCrop) et celle du sol mesurée, doutes, spécificités locales, besoin d’un appel…"
            value={donnees.remarques || ''}
            onChange={(e) => onChange({ ...donnees, remarques: e.target.value })}
          />
          <span className="aide-champ">{(donnees.remarques || '').length} / {LIMITS.remarquesMax} caractères</span>
        </div>
      </div>
    </section>
  );
}
