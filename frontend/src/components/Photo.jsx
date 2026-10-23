/* Bloc photo harmonisé : cadre arrondi, voile vert dégradé, légende optionnelle.
   Utilisé partout dans le site pour garder le même rendu. */
export default function Photo({
  src,
  alt,
  legende,
  etiquette,
  ratio = 'aspect-[3/2]',
  className = '',
  voile = 'moyen',
  arrondi = 'rounded-xl2',
  priorite = false,
  children
}) {
  const voiles = {
    aucun: '',
    leger: 'from-vert-950/45 via-transparent to-transparent',
    moyen: 'from-vert-950/75 via-vert-950/15 to-transparent',
    fort: 'from-vert-950/85 via-vert-950/40 to-vert-950/10'
  };
  return (
    <figure className={`group relative overflow-hidden ${arrondi} border border-vert-800/10 bg-vert-900 shadow-doux ${className}`}>
      <div className={`${ratio} w-full overflow-hidden`}>
        <img
          src={src}
          alt={alt}
          loading={priorite ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-doux group-hover:scale-[1.04]"
        />
      </div>
      {voile !== 'aucun' && (
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${voiles[voile]}`} aria-hidden="true" />
      )}
      {(etiquette || legende) && (
        <figcaption className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          {etiquette && (
            <span className="etiquette bg-terre-700/95 text-white shadow-sm">{etiquette}</span>
          )}
          {legende && (
            <p className="mt-2 font-display text-[15px] leading-snug text-creme-50 sm:text-base">{legende}</p>
          )}
        </figcaption>
      )}
      {children}
    </figure>
  );
}
