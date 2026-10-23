import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

const TITRES = {
  '/': 'Plages agronomiques — collecte et analyse des relectures',
  '/cultures': 'Cultures & plages — Plages agronomiques',
  '/guide': 'Guide de remplissage — Plages agronomiques',
  '/formulaire': 'Formulaire de relecture — Plages agronomiques',
  '/analyse': 'Analyse des réponses — Plages agronomiques',
  '/partenaires': 'Programme partenaires (AGRIKONNECT AFRICA) — Plages agronomiques',
  '/partenaires/rejoindre': 'Déposer un dossier de partenariat — Plages agronomiques'
};

/* Titres des routes à paramètre (/recapitulatif/:id) */
const TITRES_PREFIXES = [
  ['/recapitulatif', 'Récapitulatif de votre relecture — Plages agronomiques']
];

const HORS_LIGNE = typeof window !== 'undefined' && window.location.protocol === 'file:';

function titreDe(pathname) {
  if (TITRES[pathname]) return TITRES[pathname];
  const trouve = TITRES_PREFIXES.find(([prefixe]) => pathname.startsWith(prefixe));
  return trouve ? trouve[1] : 'Plages agronomiques';
}

export default function Layout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    document.title = titreDe(pathname);
  }, [pathname]);

  /* Changement de page : on revient en haut, sauf si un ancre est demandée.
     Les images sont en chargement différé : on réessaie une fois la mise en page stabilisée. */
  useEffect(() => {
    const cible = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (!cible) {
      window.scrollTo(0, 0);
      return undefined;
    }
    const aller = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!el) return;
      const haut = el.getBoundingClientRect().top;
      if (Math.abs(haut) > 8) el.scrollIntoView({ behavior: 'auto', block: 'start' });
    };
    aller();
    const t1 = setTimeout(aller, 200);
    const t2 = setTimeout(aller, 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [pathname, hash]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-vert-800 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-creme-100"
      >
        Aller au contenu principal
      </a>
      <Header />
      {HORS_LIGNE && (
        <div className="border-b border-terre-300/60 bg-terre-50/80">
          <p className="conteneur py-2.5 text-[12.5px] leading-relaxed text-terre-800">
            <strong className="font-semibold">Version de consultation hors ligne.</strong> Vous pouvez
            parcourir les pages et remplir le formulaire, mais l’envoi d’une relecture nécessite le
            serveur : démarrez-le avec le fichier <code className="rounded bg-white/70 px-1">DEMARRER.bat</code> (Windows)
            ou <code className="rounded bg-white/70 px-1">./start.sh</code> (Mac/Linux).
          </p>
        </div>
      )}
      <main id="contenu" className="flex-1">
        <div key={pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
