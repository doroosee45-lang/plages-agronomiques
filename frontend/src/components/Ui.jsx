import { IconeCheck, IconeInfo, IconeAttention } from './Icons.jsx';

/* Étiquette de statut : PROVISIONAL / VALIDATED */
export function BadgeStatut({ statut }) {
  const valide = statut === 'VALIDATED';
  return (
    <span
      className={`etiquette ${
        valide ? 'bg-vert-100 text-vert-800 ring-1 ring-inset ring-vert-500/30' : 'bg-terre-100 text-terre-800 ring-1 ring-inset ring-terre-400/40'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${valide ? 'bg-vert-600' : 'bg-terre-500'}`} aria-hidden="true" />
      {valide ? 'VALIDATED' : 'PROVISIONAL'}
    </span>
  );
}

export function Etiquette({ children, ton = 'vert', className = '' }) {
  const tons = {
    vert: 'bg-vert-100 text-vert-800',
    terre: 'bg-terre-100 text-terre-800',
    creme: 'bg-creme-200 text-encre-700',
    rouge: 'bg-red-100 text-red-800'
  };
  return <span className={`etiquette ${tons[ton]} ${className}`}>{children}</span>;
}

/* Encadré d'information / d'alerte */
export function Encadre({ ton = 'info', titre, children, className = '' }) {
  const config = {
    info: { fond: 'bg-vert-50 border-vert-300/60', icone: IconeInfo, couleur: 'text-vert-700' },
    attention: { fond: 'bg-terre-50 border-terre-300/70', icone: IconeAttention, couleur: 'text-terre-700' },
    succes: { fond: 'bg-vert-50 border-vert-400/60', icone: IconeCheck, couleur: 'text-vert-700' },
    erreur: { fond: 'bg-red-50 border-red-300/70', icone: IconeAttention, couleur: 'text-red-700' }
  }[ton];
  const Icone = config.icone;
  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${config.fond} ${className}`}>
      <div className="flex gap-3">
        <Icone className={`mt-0.5 shrink-0 text-lg ${config.couleur}`} />
        <div className="min-w-0 text-sm leading-relaxed text-encre-700">
          {titre && <p className="mb-1 font-semibold text-vert-900">{titre}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

/* Titre de section homogène */
export function TitreSection({ surtitre, titre, intro, centre = false, className = '', niveau = 2 }) {
  // `niveau` permet de produire un <h1> quand l’intitulé est le titre principal de la page.
  const Titre = niveau === 1 ? 'h1' : 'h2';
  return (
    <div className={`${centre ? 'mx-auto max-w-2xl text-center' : 'max-w-3xl'} ${className}`}>
      {surtitre && <p className="surtitre">{surtitre}</p>}
      <Titre className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight sm:text-[32px]">{titre}</Titre>
      {intro && <p className="mt-3 text-[15px] leading-relaxed text-encre-500 sm:text-base">{intro}</p>}
    </div>
  );
}

/* Barre de progression accessible */
export function Progression({ valeur, max = 100, label, className = '' }) {
  const p = Math.max(0, Math.min(100, Math.round((valeur / max) * 100)));
  return (
    <div className={className}>
      {label && (
        <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs font-semibold text-encre-500">
          <span>{label}</span><span className="tabular-nums text-vert-800">{p} %</span>
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-vert-800/10"
        role="progressbar"
        aria-valuenow={p}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progression'}
      >
        <div className="h-full rounded-full bg-gradient-to-r from-vert-600 to-vert-400 transition-[width] duration-700 ease-doux" style={{ width: `${p}%` }} />
      </div>
    </div>
  );
}

/* Valeur vide = inconnue (règle du document) */
export function Valeur({ v, unite }) {
  if (v === '' || v === null || v === undefined) {
    return <span className="text-encre-500/50" title="Case vide : valeur inconnue">—</span>;
  }
  const texte = typeof v === 'string' ? v.replace(/\./g, ',') : v;
  return <span className="tabular-nums text-encre-900">{texte}{unite ? <span className="ml-0.5 text-[11px] text-encre-500">{unite}</span> : null}</span>;
}
