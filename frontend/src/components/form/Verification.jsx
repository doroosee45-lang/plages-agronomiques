import { CULTURES, PARAMS, CHAMPS, cultureRenseignee, nbValeursCulture } from '@shared/model.js';
import { Encadre } from '../Ui.jsx';
import { IconeCheck, IconeAttention, IconeFleche } from '../Icons.jsx';

export default function Verification({ donnees, resultat, onEditer, onEnvoyer, enCours, erreurEnvoi, alertes }) {
  const a = donnees.agronome;
  const culturesRenseignees = CULTURES.filter((c) => cultureRenseignee(donnees.cultures[c.id]));
  const culturesVides = CULTURES.filter((c) => !cultureRenseignee(donnees.cultures[c.id]));
  const totalValeurs = CULTURES.reduce((n, c) => n + nbValeursCulture(donnees.cultures[c.id]), 0);

  return (
    <div className="space-y-6">
      <div className="carte p-5 sm:p-7">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">Vérification avant envoi</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-encre-500">
          Relisez une dernière fois. Vous pouvez revenir sur n’importe quelle culture avant d’envoyer.
        </p>

        <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {[
            ['Nom et prénom', a.nom || '—'],
            ['Fonction / organisation', a.organisation || '—'],
            ['Téléphone ou e-mail', a.contact || '—'],
            ['Date de relecture', a.date_relecture || '—'],
            ['Citation du nom', a.accord ? 'Acceptée' : 'Refusée (relecture anonyme)'],
            ['Cultures renseignées', `${culturesRenseignees.length} / ${CULTURES.length} — ${totalValeurs} borne${totalValeurs > 1 ? 's' : ''}`]
          ].map(([k, v]) => (
            <div key={k} className="border-b border-vert-800/10 pb-2">
              <dt className="text-[11px] font-semibold uppercase tracking-[.1em] text-encre-500">{k}</dt>
              <dd className="mt-0.5 text-[14.5px] text-encre-900">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {culturesRenseignees.length > 0 && (
        <div className="carte overflow-hidden">
          <div className="border-b border-vert-800/10 px-5 py-3.5">
            <h3 className="font-display text-lg font-semibold">Détail par culture</h3>
          </div>
          <ul className="divide-y divide-vert-800/10">
            {culturesRenseignees.map((c) => {
              const d = donnees.cultures[c.id];
              const remplies = PARAMS.filter((p) => CHAMPS.some((ch) => String(d.parametres?.[p.id]?.[ch.id] || '').trim() !== ''));
              const validees = PARAMS.filter((p) => d.parametres?.[p.id]?.statut === 'VALIDATED').length;
              return (
                <li key={c.id} className="flex flex-wrap items-start gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] font-semibold text-vert-900">{c.nom}</p>
                    <p className="mt-0.5 text-[12.5px] text-encre-500">
                      {remplies.length > 0 ? remplies.map((p) => p.nom).join(' · ') : 'Remarques uniquement'}
                      {validees > 0 ? ` — ${validees} paramètre${validees > 1 ? 's' : ''} VALIDATED` : ' — aucun paramètre VALIDATED'}
                    </p>
                    {d.remarques && <p className="mt-1 line-clamp-2 text-[12px] italic text-encre-500">« {d.remarques} »</p>}
                  </div>
                  <button type="button" onClick={() => onEditer(c.id)} className="btn-fantome shrink-0 px-3 py-1.5 text-[12.5px]">
                    Modifier <IconeFleche className="text-xs" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {resultat.erreurs.length > 0 && (
        <div className="rounded-xl2 border border-red-300/70 bg-red-50 p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-red-800">
            <IconeAttention /> {resultat.erreurs.length} point{resultat.erreurs.length > 1 ? 's' : ''} à corriger avant l’envoi
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {resultat.erreurs.slice(0, 8).map((e, i) => (
              <li key={i} className="text-[13px] leading-relaxed text-red-700">• {e.message}</li>
            ))}
          </ul>
          {resultat.erreurs.length > 8 && (
            <p className="mt-2 text-[12px] text-red-700">… et {resultat.erreurs.length - 8} autre(s).</p>
          )}
        </div>
      )}

      {alertes.length > 0 && (
        <Encadre ton="attention" titre={`${alertes.length} remarque${alertes.length > 1 ? 's' : ''} non bloquante${alertes.length > 1 ? 's' : ''}`}>
          <ul className="mt-1 space-y-1.5">
            {alertes.slice(0, 6).map((al, i) => <li key={i}>• {al.message}</li>)}
          </ul>
          <p className="mt-2 text-[12px] text-encre-500">Vous pouvez envoyer malgré ces remarques.</p>
        </Encadre>
      )}

      {culturesVides.length > 0 && (
        <Encadre ton="info" titre={`${culturesVides.length} culture${culturesVides.length > 1 ? 's' : ''} non renseignée${culturesVides.length > 1 ? 's' : ''}`}>
          {culturesVides.map((c) => c.nom).join(', ')}. Ce n’est pas un problème : une relecture partielle est acceptée.
        </Encadre>
      )}

      {erreurEnvoi && <Encadre ton="erreur" titre="L’envoi n’a pas abouti">{erreurEnvoi}</Encadre>}

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12.5px] leading-relaxed text-encre-500">
          En envoyant, vous confirmez l’exactitude des informations saisies et de leurs sources.
        </p>
        <button type="button" className="btn-primaire w-full shrink-0 sm:w-auto" onClick={onEnvoyer} disabled={enCours || resultat.erreurs.length > 0}>
          {enCours ? 'Envoi en cours…' : 'Envoyer ma relecture'}
          {!enCours && <IconeCheck className="text-base" />}
        </button>
      </div>
    </div>
  );
}
