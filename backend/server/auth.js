/* ==========================================================================
   server/auth.js — session administrateur simple (cookie HttpOnly signé)
   ========================================================================== */
import crypto from 'node:crypto';

const SECRET = process.env.SECRET_SEL || crypto.randomBytes(24).toString('hex');
const CODE = process.env.ADMIN_CODE || 'agro2026';
const TTL = 8 * 60 * 60 * 1000; // 8 heures
const sessions = new Map();
const ATTRIBUTS_COOKIE = process.env.RENDER === 'true' ? 'SameSite=None; Secure' : 'SameSite=Lax';

export function creerSession() {
  const id = crypto.randomBytes(24).toString('hex');
  sessions.set(id, Date.now() + TTL);
  return { id, cookie: `session=${id}; Path=/; HttpOnly; ${ATTRIBUTS_COOKIE}; Max-Age=${Math.floor(TTL / 1000)}` };
}

export function detruireSession(req) {
  const cookies = lireCookies(req);
  if (cookies.session) sessions.delete(cookies.session);
}

export function estAdmin(req) {
  const { session } = lireCookies(req);
  if (!session || !sessions.has(session)) return false;
  if (sessions.get(session) < Date.now()) { sessions.delete(session); return false; }
  return true;
}

export function verifierCode(code) {
  if (typeof code !== 'string' || code.length !== CODE.length) return false;
  return crypto.timingSafeEqual(Buffer.from(code), Buffer.from(CODE));
}

export function jetonPdf(id) {
  return crypto.createHmac('sha256', SECRET).update(`pdf:${id}`).digest('hex').slice(0, 32);
}

export function lireCookies(req) {
  const brut = req.headers.cookie || '';
  return brut.split(';').reduce((acc, part) => {
    const i = part.indexOf('=');
    if (i > -1) acc[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
    return acc;
  }, {});
}

/* Limitation de débit très simple, en mémoire */
const compteurs = new Map();
export function tropDeRequetes(cle, max, fenetreMs) {
  const maintenant = Date.now();
  const c = compteurs.get(cle) || { n: 0, jusqu: maintenant + fenetreMs };
  if (maintenant > c.jusqu) { c.n = 0; c.jusqu = maintenant + fenetreMs; }
  c.n += 1;
  compteurs.set(cle, c);
  return c.n > max;
}
