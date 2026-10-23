/* ==========================================================================
   server/courriel.js — envoi des e-mails de la plateforme
   Un seul fournisseur : RESEND (API HTTP).
     CONTACT_EMAIL  → destinataire de l'équipe
     RESEND_API_KEY → clé d'API Resend (commence par « re_ »)
     MAIL_FROM      → expéditeur (domaine vérifié dans Resend)
   Si la clé manque, l'envoi n'échoue pas : il est journalisé et signalé
   comme « non configuré ». Les dossiers restent enregistrés en base.
   ========================================================================== */

const env = (cle, defaut = '') => String(process.env[cle] || defaut).trim();

const cleResend = () => env('RESEND_API_KEY') || env('RESEND_API_');

export const destinataireEquipe = () => env('CONTACT_EMAIL') || env('NOTIF_EMAIL');

export function etatCourriel() {
  const cle = cleResend();
  const dest = destinataireEquipe();
  const expediteur = env('MAIL_FROM') || 'Omedev services <onboarding@resend.dev>';
  return {
    destinataire: dest || null,
    expediteur,
    resend: Boolean(cle),
    fournisseur: 'resend',
    actif: Boolean(dest && cle),
    message: !dest
      ? 'Aucun destinataire : renseignez CONTACT_EMAIL dans .env.'
      : !cle
        ? 'Destinataire défini, mais la clé RESEND_API_KEY est vide : créez une clé sur resend.com puis collez-la dans .env.'
        : 'Envoi e-mail actif (Resend).'
  };
}

export async function envoyerCourriel({ sujet, texte, html, repondreA, destinataire }) {
  const dest = destinataire || destinataireEquipe();
  if (!dest) return { envoye: false, raison: 'destinataire_absent' };
  const cle = cleResend();
  if (!cle) return { envoye: false, raison: 'resend_non_configure' };

  const corps = {
    from: env('MAIL_FROM') || 'Omedev services <onboarding@resend.dev>',
    to: Array.isArray(dest) ? dest : [dest],
    subject: sujet,
    text: texte,
    html
  };
  if (repondreA) corps.reply_to = repondreA;

  const ctrl = new AbortController();
  const minuteur = setTimeout(() => ctrl.abort(), 15000);
  try {
    const rep = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(corps),
      signal: ctrl.signal
    });
    const brut = await rep.text();
    let data = null;
    try { data = JSON.parse(brut); } catch { /* réponse non JSON */ }
    if (!rep.ok) {
      const message = (data && (data.message || data.error)) || brut.slice(0, 300) || `HTTP ${rep.status}`;
      console.error('[courriel] Resend a refusé l’envoi :', rep.status, message);
      return { envoye: false, raison: 'resend_refus', message, statut: rep.status };
    }
    return { envoye: true, fournisseur: 'resend', id: data && data.id };
  } catch (e) {
    const raison = e.name === 'AbortError' ? 'resend_delai_depasse' : 'resend_injoignable';
    console.error('[courriel] Resend injoignable :', e.message);
    return { envoye: false, raison, message: e.message };
  } finally {
    clearTimeout(minuteur);
  }
}

/* Bloc HTML commun : sobre, lisible dans tous les clients de messagerie. */
export function gabaritHtml({ titre, sousTitre, corps, pied }) {
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!doctype html><html lang="fr"><body style="margin:0;padding:24px;background:#faf6ec;font-family:Segoe UI,Arial,Helvetica,sans-serif;color:#16211b">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e1ece5;border-radius:16px;overflow:hidden">
    <div style="background:#123d2a;padding:22px 26px">
      <p style="margin:0;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#c3d9cb">AGRIKONNECT AFRICA</p>
      <h1 style="margin:6px 0 0;font-size:21px;line-height:1.3;color:#fdfbf6">${esc(titre)}</h1>
      ${sousTitre ? `<p style="margin:6px 0 0;font-size:13px;color:#c3d9cb">${esc(sousTitre)}</p>` : ''}
    </div>
    <div style="padding:24px 26px">${corps}</div>
    <div style="padding:16px 26px 22px;border-top:1px solid #e9dfc9">
      <p style="margin:0;font-size:12px;color:#5c665f;line-height:1.6">${pied || 'Message automatique de la plateforme. Aucune donnée n’est transmise à un tiers sans votre accord.'}</p>
    </div>
  </div>
</body></html>`;
}
