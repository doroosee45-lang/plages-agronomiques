import { useEffect, useRef, useState } from 'react';

/* Révélation au défilement : ajoute « est-visible » la première fois que
   l'élément entre dans la fenêtre. Respecte « animations réduites ». */
export function useReveal({ seuil = 0.15, uneSeuleFois = true } = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const obs = new IntersectionObserver((entrees) => {
      entrees.forEach((e) => {
        if (e.isIntersecting) {
          setVisible(true);
          if (uneSeuleFois) obs.unobserve(e.target);
        } else if (!uneSeuleFois) {
          setVisible(false);
        }
      });
    }, { threshold: seuil, rootMargin: '0px 0px -8% 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [seuil, uneSeuleFois]);

  return [ref, visible];
}

/* Compteur animé (KPI) */
export function useCompteur(cible, duree = 900) {
  const [valeur, setValeur] = useState(0);
  useEffect(() => {
    const fin = Number(cible) || 0;
    if (fin === 0) { setValeur(0); return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setValeur(fin); return; }
    let raf;
    const debut = performance.now();
    const pas = (t) => {
      const p = Math.min(1, (t - debut) / duree);
      const ease = 1 - Math.pow(1 - p, 3);
      setValeur(Math.round(fin * ease));
      if (p < 1) raf = requestAnimationFrame(pas);
    };
    raf = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(raf);
  }, [cible, duree]);
  return valeur;
}

/* Brouillon conservé localement (le formulaire est long : 9 cultures) */
export function useBrouillon(cle, valeurInitiale) {
  const [valeur, setValeur] = useState(() => {
    try {
      const brut = localStorage.getItem(cle);
      if (brut) {
        const sauve = JSON.parse(brut);
        if (sauve && typeof sauve === 'object') return { ...valeurInitiale, ...sauve };
      }
    } catch { /* stockage indisponible */ }
    return valeurInitiale;
  });

  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(cle, JSON.stringify(valeur)); } catch { /* quota */ }
    }, 400);
    return () => clearTimeout(t);
  }, [cle, valeur]);

  const effacer = () => {
    try { localStorage.removeItem(cle); } catch { /* ignore */ }
  };

  return [valeur, setValeur, effacer];
}
