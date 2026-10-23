/* Accès à l'API du serveur Express (mêmes routes que la version classique) */

/* Version portable ouverte par double-clic : aucun serveur ne répond.
   On évite une requête vouée à l'échec et on renvoie un message clair. */
const HORS_LIGNE = typeof window !== 'undefined' && window.location.protocol === 'file:';

async function demander(url, options = {}) {
  if (HORS_LIGNE) {
    const err = new Error('Version hors ligne : l’envoi nécessite le serveur de la plateforme (npm run dev).');
    err.horsLigne = true;
    throw err;
  }
  const rep = await fetch(url, {
    credentials: 'same-origin',
    headers: options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    ...options
  });
  let donnees = null;
  const type = rep.headers.get('content-type') || '';
  if (type.includes('application/json')) donnees = await rep.json();
  if (!rep.ok) {
    const message = (donnees && (donnees.message || (donnees.erreurs && donnees.erreurs[0] && donnees.erreurs[0].message)))
      || `Erreur ${rep.status}`;
    const err = new Error(message);
    err.statut = rep.status;
    err.donnees = donnees;
    throw err;
  }
  return donnees;
}

export const api = {
  sante: () => demander('/api/health'),
  config: () => demander('/api/config'),
  resumePublic: () => demander('/api/resume-public'),

  envoyer: (donnees) => demander('/api/relectures', { method: 'POST', body: JSON.stringify(donnees) }),
  liste: (q = '') => demander(`/api/relectures${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  detail: (id, jeton) => demander(`/api/relectures/${id}${jeton ? `?jeton=${encodeURIComponent(jeton)}` : ''}`),
  supprimer: (id) => demander(`/api/relectures/${id}`, { method: 'DELETE' }),

  stats: () => demander('/api/stats'),
  notifications: () => demander('/api/admin/notifications'),
  testerNotification: () => demander('/api/admin/notifications/test', { method: 'POST' }),
  importer: (csv) => demander('/api/import', { method: 'POST', body: JSON.stringify({ csv }) }),

  partenaires: (q = '') => demander(`/api/admin/partenaires${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  statutPartenaire: (id, statut) => demander(`/api/admin/partenaires/${id}`, { method: 'PATCH', body: JSON.stringify({ statut }) }),
  testerEmailPartenaire: () => demander('/api/admin/partenaires/test-email', { method: 'POST' }),
  envoyerDossierPartenaire: (donnees) => demander('/api/partenaires', { method: 'POST', body: JSON.stringify({ donnees }) }),

  session: () => demander('/api/admin/session'),
  connexion: (code) => demander('/api/admin/connexion', { method: 'POST', body: JSON.stringify({ code }) }),
  deconnexion: () => demander('/api/admin/deconnexion', { method: 'POST' })
};

export const lienPdf = (id, jeton) => `/api/relectures/${id}/pdf${jeton ? `?jeton=${encodeURIComponent(jeton)}` : ''}`;
