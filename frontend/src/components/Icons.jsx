/* Jeu d'icônes SVG intégrées (aucune ressource externe). */

const base = {
  width: '1em',
  height: '1em',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false
};

const Icone = ({ children, ...props }) => (
  <svg {...base} {...props}>{children}</svg>
);

export const IconeFeuille = (p) => (
  <Icone {...p}>
    <path d="M12 21V11" />
    <path d="M12 12c0-4.5 3.5-7 8-7 0 4.5-3.5 7-8 7Z" />
    <path d="M12 15c0-3.5-2.8-6-6.5-6 0 3.5 2.8 6 6.5 6Z" />
  </Icone>
);

export const IconeGoutte = (p) => (
  <Icone {...p}><path d="M12 3.5c3 3.4 5.5 6.2 5.5 9.2A5.5 5.5 0 0 1 12 18.2a5.5 5.5 0 0 1-5.5-5.5c0-3 2.5-5.8 5.5-9.2Z" /><path d="M9.8 13.2a2.4 2.4 0 0 0 2.4 2.4" /></Icone>
);

export const IconeThermometre = (p) => (
  <Icone {...p}><path d="M14 14.8V5.5a2 2 0 1 0-4 0v9.3a4 4 0 1 0 4 0Z" /><path d="M12 9v6" /></Icone>
);

export const IconeSel = (p) => (
  <Icone {...p}><path d="M12 3v18M5 8h14M5 16h14" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /></Icone>
);

export const IconeRacine = (p) => (
  <Icone {...p}><path d="M12 3v8" /><path d="M12 11c0 3-2 4.5-4.5 6M12 11c0 3 2 4.5 4.5 6M12 11v8" /></Icone>
);

export const IconeFleche = (p) => (
  <Icone {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Icone>
);

export const IconeMenu = (p) => (
  <Icone {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Icone>
);

export const IconeFermer = (p) => (
  <Icone {...p}><path d="M6 6l12 12M18 6L6 18" /></Icone>
);

export const IconeCheck = (p) => (
  <Icone {...p}><path d="M4.5 12.5l5 5 10-11" /></Icone>
);

export const IconeInfo = (p) => (
  <Icone {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.8v.2" /></Icone>
);

export const IconeAttention = (p) => (
  <Icone {...p}><path d="M12 4.5 21 20H3l9-15.5Z" /><path d="M12 10v4M12 17v.2" /></Icone>
);

export const IconeTelecharger = (p) => (
  <Icone {...p}><path d="M12 4v11M8 11.5l4 4 4-4" /><path d="M4.5 19.5h15" /></Icone>
);

export const IconeImprimer = (p) => (
  <Icone {...p}><path d="M7 9V4h10v5" /><rect x="4" y="9" width="16" height="7" rx="2" /><path d="M7 16h10v4H7z" /></Icone>
);

export const IconeLoupe = (p) => (
  <Icone {...p}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></Icone>
);

export const IconeBouclier = (p) => (
  <Icone {...p}><path d="M12 3.5 19 6v5.5c0 4.3-2.9 7.6-7 9-4.1-1.4-7-4.7-7-9V6l7-2.5Z" /><path d="M9 12l2 2 4-4.5" /></Icone>
);

export const IconePlus = (p) => (
  <Icone {...p}><path d="M12 5v14M5 12h14" /></Icone>
);

export const IconeMoins = (p) => (
  <Icone {...p}><path d="M5 12h14" /></Icone>
);

export const IconeOrdinateur = (p) => (
  <Icone {...p}><rect x="3" y="5" width="18" height="11" rx="2" /><path d="M9 20h6M12 16v4" /></Icone>
);

export const IconeTelephone = (p) => (
  <Icone {...p}><rect x="7" y="3" width="10" height="18" rx="2.5" /><path d="M11 18h2" /></Icone>
);

export const IconeEnveloppe = (p) => (
  <Icone {...p}><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3.5 7l8.5 6 8.5-6" /></Icone>
);

export const IconeCible = (p) => (
  <Icone {...p}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r=".6" /></Icone>
);

export const IconeGraphique = (p) => (
  <Icone {...p}><path d="M4 19.5h16" /><path d="M7 16V9M12 16V5.5M17 16v-4.5" /></Icone>
);

export const IconeArchive = (p) => (
  <Icone {...p}><rect x="3.5" y="4.5" width="17" height="4.5" rx="1.4" /><path d="M5 9v9.5a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V9" /><path d="M10 13h4" /></Icone>
);

export const IconeLien = (p) => (
  <Icone {...p}><path d="M10 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1.5 1.5" /><path d="M14 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5L12.5 17" /></Icone>
);

export const IconePdf = (p) => (
  <Icone {...p}><path d="M14 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8L14 3.5Z" /><path d="M14 3.5V8h4.5" /><path d="M9 15.5h1.2a1.3 1.3 0 0 0 0-2.6H9v4.1M13.5 12.9v4.1h1a1.4 1.4 0 0 0 1.4-1.4v-1.3a1.4 1.4 0 0 0-1.4-1.4h-1Z" /></Icone>
);

export const IconeCsv = (p) => (
  <Icone {...p}><path d="M14 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8L14 3.5Z" /><path d="M14 3.5V8h4.5" /><path d="M8.5 16.5l-1.3-1.4 1.3-1.4M15.5 13.7l1.3 1.4-1.3 1.4M12.6 12.6l-1.2 4" /></Icone>
);

export const IconeFlecheHaut = (p) => (
  <Icone {...p}><path d="M12 19V5M6 11l6-6 6 6" /></Icone>
);
