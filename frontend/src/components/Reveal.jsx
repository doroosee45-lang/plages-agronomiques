import { useReveal } from '../hooks/useReveal.js';

export default function Reveal({ children, as: Balise = 'div', delai = 0, className = '', ...reste }) {
  const [ref, visible] = useReveal();
  return (
    <Balise
      ref={ref}
      className={`reveal ${visible ? 'est-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delai}ms` }}
      {...reste}
    >
      {children}
    </Balise>
  );
}
