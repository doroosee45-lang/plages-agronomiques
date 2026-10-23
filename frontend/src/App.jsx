import { BrowserRouter, HashRouter, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Accueil from './pages/Accueil.jsx';
import Cultures from './pages/Cultures.jsx';
import Guide from './pages/Guide.jsx';
import Formulaire from './pages/Formulaire.jsx';
import Recapitulatif from './pages/Recapitulatif.jsx';
import Analyse from './pages/Analyse.jsx';
import Partenaires from './pages/Partenaires.jsx';
import PartenaireFormulaire from './pages/PartenaireFormulaire.jsx';

function Introuvable() {
  return (
    <section className="conteneur py-20 text-center sm:py-28">
      <p className="font-display text-[64px] font-semibold leading-none text-vert-200">404</p>
      <h1 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">Cette page n’existe pas</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-encre-500">
        Le lien est peut-être ancien ou mal recopié. Revenez à l’accueil ou ouvrez directement le formulaire.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primaire">Accueil</Link>
        <Link to="/formulaire" className="btn-secondaire">Formulaire</Link>
      </div>
    </section>
  );
}

/* Ouverture par double-clic (fichier local) : on bascule sur un routage par
   ancre (#/page) pour que les liens fonctionnent sans serveur. */
const Routeur = typeof window !== 'undefined' && window.location.protocol === 'file:' ? HashRouter : BrowserRouter;

export default function App() {
  return (
    <Routeur>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Accueil />} />
          <Route path="/cultures" element={<Cultures />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/formulaire" element={<Formulaire />} />
          <Route path="/recapitulatif/:id" element={<Recapitulatif />} />
          <Route path="/analyse" element={<Analyse />} />
          <Route path="/partenaires" element={<Partenaires />} />
          <Route path="/partenaires/rejoindre" element={<PartenaireFormulaire />} />
          <Route path="*" element={<Introuvable />} />
        </Route>
      </Routes>
    </Routeur>
  );
}
