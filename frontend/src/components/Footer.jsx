import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconeFeuille, IconeEnveloppe, IconeTelephone } from './Icons.jsx';
import { api } from '../lib/api.js';

export default function Footer() {
  const [contact, setContact] = useState(null);

  useEffect(() => {
    api.config().then((c) => setContact(c.contact || null)).catch(() => {});
  }, []);

  return (
    <footer className="mt-24 border-t border-vert-800/10 bg-vert-900 text-creme-200">
      <div className="conteneur grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-creme-100/10 text-creme-100">
              <IconeFeuille className="text-[22px]" />
            </span>
            <span className="font-display text-lg font-semibold text-creme-100">Plages agronomiques par culture</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-creme-200/80">
            Plateforme de collecte, de centralisation et d’analyse des relectures des plages
            agronomiques (pH, température, humidité, salinité, profondeur racinaire) pour les
            cultures de l’Équateur et du Bandundu.
          </p>
          <p className="mt-4 text-xs leading-relaxed text-creme-200/60">
            Document de référence : « Plages agronomiques par culture : formulaire à remplir » —
            Meya Dorodoro, ingénieur en informatique, développeur Full Stack (RDC).
          </p>
        </div>

        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[.18em] text-terre-300">Le formulaire</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="text-creme-200/85 transition-colors hover:text-white" to="/formulaire">Remplir une relecture</Link></li>
            <li><Link className="text-creme-200/85 transition-colors hover:text-white" to="/guide">Comment remplir</Link></li>
            <li><Link className="text-creme-200/85 transition-colors hover:text-white" to="/cultures">Les 9 cultures</Link></li>
            <li><Link className="text-creme-200/85 transition-colors hover:text-white" to="/analyse">Analyse des réponses</Link></li>
          </ul>

          <h2 className="mt-6 text-[11px] font-bold uppercase tracking-[.18em] text-terre-300">Programme partenaire</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="text-creme-200/85 transition-colors hover:text-white" to="/partenaires">Le dossier de projet</Link></li>
            <li><Link className="text-creme-200/85 transition-colors hover:text-white" to="/partenaires/rejoindre">Devenir partenaire</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[.18em] text-terre-300">Nous joindre</h2>
          <ul className="mt-4 space-y-3 text-sm text-creme-200/85">
            <li className="flex items-start gap-2.5">
              <IconeEnveloppe className="mt-0.5 shrink-0 text-base text-terre-300" />
              <span>
                Retour par e-mail<br />
                {contact?.email ? (
                  <a href={`mailto:${contact.email}`} className="font-medium text-creme-100 underline decoration-terre-400/60 underline-offset-4 transition-colors hover:decoration-terre-300">
                    {contact.email}
                  </a>
                ) : (
                  <span className="text-creme-200/60">(adresse non renseignée)</span>
                )}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <IconeTelephone className="mt-0.5 shrink-0 text-base text-terre-300" />
              <span>
                Retour par WhatsApp<br />
                {contact?.whatsapp ? (
                  <a href={contact.whatsapp_lien} target="_blank" rel="noreferrer" className="font-medium text-creme-100 underline decoration-terre-400/60 underline-offset-4 transition-colors hover:decoration-terre-300">
                    {contact.whatsapp}
                  </a>
                ) : (
                  <span className="text-creme-200/60">(numéro non renseigné)</span>
                )}
              </span>
            </li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-creme-200/55">
            Une question sur une valeur ? Indiquez-le dans les remarques : un appel peut être organisé.
          </p>
        </div>
      </div>

      <div className="border-t border-creme-100/10">
        <div className="conteneur flex flex-col gap-2 py-5 text-xs text-creme-200/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Plages agronomiques · AGRIKONNECT AFRICA — usage interne du projet.</p>
          <p>Les valeurs VALIDATED ne sont citées (nom + date) qu’avec votre accord explicite.</p>
        </div>
      </div>
    </footer>
  );
}
