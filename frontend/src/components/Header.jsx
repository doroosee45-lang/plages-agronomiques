import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { IconeFermer, IconeMenu, IconeFeuille } from './Icons.jsx';

const LIENS = [
  { to: '/', label: 'Accueil', exact: true },
  { to: '/cultures', label: 'Cultures & plages' },
  { to: '/guide', label: 'Guide de remplissage' },
  { to: '/analyse', label: 'Analyse' },
  { to: '/partenaires', label: 'Partenariat', accent: true }
];

export default function Header() {
  const [ouvert, setOuvert] = useState(false);
  const [defile, setDefile] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { setOuvert(false); }, [pathname]);

  useEffect(() => {
    const surDefilement = () => setDefile(window.scrollY > 8);
    surDefilement();
    window.addEventListener('scroll', surDefilement, { passive: true });
    return () => window.removeEventListener('scroll', surDefilement);
  }, []);

  useEffect(() => {
    document.body.style.overflow = ouvert ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [ouvert]);

  const lienClasse = ({ isActive }) =>
    `relative whitespace-nowrap px-2 py-2 text-[13.5px] font-medium transition-colors duration-200 xl:px-3 xl:text-sm ${
      isActive ? 'text-vert-900' : 'text-encre-700 hover:text-vert-800'
    }`;

  return (
    <header className="sticky top-0 z-50 px-4 pt-3">
      <div className={`conteneur relative flex h-[68px] items-center justify-between gap-4 rounded-full border px-2 shadow-[0_6px_24px_rgba(6,48,31,0.14)] backdrop-blur-md transition-all duration-300 ${
        defile ? 'border-vert-800/15 bg-white/95' : 'border-white/70 bg-white/90'
      }`}>
        <Link to="/" className="group flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-vert-100 bg-white text-vert-800 transition-transform duration-300 group-hover:-rotate-6">
            <IconeFeuille className="text-[22px]" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="whitespace-nowrap font-display text-[15px] font-semibold text-vert-900 sm:text-[17px]">Plages agronomiques</span>
            <span className="text-[10.5px] font-semibold uppercase tracking-[.16em] text-terre-700">Équateur · Bandundu</span>
            <span className="sr-only">— retour à l’accueil</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navigation principale">
          {LIENS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.exact} className={lienClasse}>
              {({ isActive }) => (
                <>
                  {l.label}
                  <span
                    className={`absolute inset-x-3 -bottom-0.5 h-[2px] origin-left rounded-full transition-transform duration-300 ${
                      l.accent ? 'bg-vert-500' : 'bg-terre-500'
                    } ${isActive ? 'scale-x-100' : 'scale-x-0'}`}
                  />
                </>
              )}
            </NavLink>
          ))}
          <Link to="/formulaire" className="btn-primaire ml-2 whitespace-nowrap px-4 xl:ml-3">
            <span className="hidden xl:inline">Remplir le formulaire</span>
            <span className="xl:hidden">Formulaire</span>
          </Link>
        </nav>

        <button
          type="button"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-vert-900 text-white transition-colors hover:bg-vert-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terre-500 lg:hidden"
          aria-expanded={ouvert}
          aria-controls="menu-mobile"
          onClick={() => setOuvert((v) => !v)}
        >
          {ouvert ? <IconeFermer className="text-2xl" /> : <IconeMenu className="text-2xl" />}
          <span className="sr-only">{ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
        </button>
      </div>

      {/* Menu mobile */}
      <div
        id="menu-mobile"
        className={`conteneur absolute left-4 right-4 top-[88px] overflow-hidden rounded-[28px] bg-white shadow-[0_12px_36px_rgba(6,48,31,0.2)] transition-[max-height,opacity,padding] duration-300 ease-doux lg:hidden ${
          ouvert ? 'max-h-[620px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col gap-1 p-3" aria-label="Navigation mobile">
          {LIENS.map((l, i) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.exact}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-colors ${
                  isActive ? 'bg-vert-100 text-vert-900 font-bold' : 'text-encre-700 hover:bg-vert-50'
                }`
              }
              style={{ animation: ouvert ? `monte .35s ease-out ${i * 40}ms both` : undefined }}
            >
              {l.label}
            </NavLink>
          ))}
          <div className="my-2 h-px bg-vert-800/10" />
          <Link to="/partenaires/rejoindre" className="btn-terre mt-1 w-full rounded-full">Devenir partenaire</Link>
          <Link to="/formulaire" className="btn-primaire mt-1 w-full rounded-full">Remplir le formulaire</Link>
        </nav>
      </div>
    </header>
  );
}
