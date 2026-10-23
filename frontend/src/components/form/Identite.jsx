import { IconeBouclier, IconeEnveloppe, IconeTelephone } from '../Icons.jsx';
import { aujourdhuiFr } from '@shared/model.js';

function Erreur({ messages }) {
  if (!messages || !messages.length) return null;
  return (
    <p className="mt-1.5 flex items-start gap-1.5 text-[12.5px] font-medium text-red-700" role="alert">
      <span aria-hidden="true" className="mt-[3px] text-[10px]">●</span>
      <span>{messages[0]}</span>
    </p>
  );
}

export default function Identite({ agronome, setChamp, erreurs = [], afficherErreurs }) {
  const err = (cle) => (afficherErreurs ? erreurs.filter((e) => e.champ === `agronome.${cle}`).map((e) => e.message) : []);

  return (
    <div className="space-y-6">
      <div className="carte p-5 sm:p-7">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">Votre identité d’agronome</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-encre-500">
          Ces informations permettent de vous joindre si une valeur doit être précisée. Elles ne sont
          pas publiées : seuls des agrégats sont visibles sur la page d’analyse.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="nom" className="etiquette-champ">Nom et prénom <span className="text-terre-600">*</span></label>
            <input
              id="nom" name="nom" className="champ" autoComplete="name" maxLength={120}
              placeholder="Ex. : Kabasele Mbuyi Jean"
              value={agronome.nom}
              aria-invalid={err('nom').length > 0}
              aria-describedby="nom-aide nom-err"
              onChange={(e) => setChamp('nom', e.target.value)}
            />
            <span id="nom-aide" className="aide-champ">Tel qu’il devra être cité si vous acceptez la citation.</span>
            <div id="nom-err"><Erreur messages={err('nom')} /></div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="organisation" className="etiquette-champ">Fonction / organisation <span className="text-terre-600">*</span></label>
            <input
              id="organisation" name="organisation" className="champ" maxLength={160}
              placeholder="Ex. : Ingénieur agronome — Institut national de recherche"
              value={agronome.organisation}
              aria-invalid={err('organisation').length > 0}
              onChange={(e) => setChamp('organisation', e.target.value)}
            />
            <div id="organisation-err"><Erreur messages={err('organisation')} /></div>
          </div>

          <div>
            <label htmlFor="contact" className="etiquette-champ">Téléphone ou e-mail <span className="text-terre-600">*</span></label>
            <input
              id="contact" name="contact" className="champ" maxLength={160} inputMode="email"
              placeholder="+243 … ou nom@exemple.cd"
              value={agronome.contact}
              aria-invalid={err('contact').length > 0}
              aria-describedby="contact-aide contact-err"
              onChange={(e) => setChamp('contact', e.target.value)}
            />
            <span id="contact-aide" className="aide-champ inline-flex items-center gap-1.5">
              <IconeTelephone className="text-[13px]" /> appel possible
              <span className="text-encre-500/50">·</span>
              <IconeEnveloppe className="text-[13px]" /> retour par e-mail ou WhatsApp
            </span>
            <div id="contact-err"><Erreur messages={err('contact')} /></div>
          </div>

          <div>
            <label htmlFor="date_relecture" className="etiquette-champ">Date de relecture <span className="text-terre-600">*</span></label>
            <div className="flex gap-2">
              <input
                id="date_relecture" name="date_relecture" className="champ" placeholder="jj/mm/aaaa"
                inputMode="numeric" maxLength={10}
                value={agronome.date_relecture}
                aria-invalid={err('date_relecture').length > 0}
                aria-describedby="date-aide date-err"
                onChange={(e) => setChamp('date_relecture', e.target.value)}
              />
              <button
                type="button"
                className="btn-secondaire shrink-0 px-3 text-[13px]"
                onClick={() => setChamp('date_relecture', aujourdhuiFr())}
              >
                Aujourd’hui
              </button>
            </div>
            <span id="date-aide" className="aide-champ">Format attendu : jj/mm/aaaa.</span>
            <div id="date-err"><Erreur messages={err('date_relecture')} /></div>
          </div>
        </div>
      </div>

      <div className="carte border-vert-500/25 p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-vert-100 text-vert-700">
            <IconeBouclier className="text-lg" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold">Consentement de citation</h3>
            <label htmlFor="accord" className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl bg-creme-50 p-4 ring-1 ring-inset ring-vert-800/10 transition-colors hover:bg-creme-100/70 has-[:checked]:bg-vert-50 has-[:checked]:ring-vert-500/30">
              <input
                id="accord" name="accord" type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-vert-700"
                checked={agronome.accord}
                onChange={(e) => setChamp('accord', e.target.checked)}
              />
              <span className="text-[13.5px] leading-relaxed text-encre-700">
                J’accepte que mon nom et la date de relecture soient cités comme validation des
                valeurs que j’ai marquées <strong className="font-semibold text-vert-900">VALIDATED</strong>.
              </span>
            </label>
            <p className="mt-2 text-[12.5px] leading-relaxed text-encre-500">
              Cette case n’est pas obligatoire. Si vous ne la cochez pas, votre relecture est
              conservée mais votre nom n’est pas cité comme validation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
