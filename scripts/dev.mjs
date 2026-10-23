/* ==========================================================================
   scripts/dev.mjs — lance le BACKEND (Express) et le FRONTEND (Vite)
   en une seule commande : « npm run dev » depuis la racine du projet.

   Structure :
     plages-agronomiques/
       frontend/   ->  React + Tailwind (port 3000)
       backend/    ->  Express + MongoDB (port 4000)
   ========================================================================== */
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const RACINE = path.dirname(path.dirname(fileURLToPath(import.meta.url))); // .../plages-agronomiques
const DOSSIER_FRONT = path.join(RACINE, 'frontend');
const DOSSIER_BACK = path.join(RACINE, 'backend');

/* --- Lecture du fichier .env (racine du projet), sans dependance ---------- */
function lireEnv() {
  const fichier = path.join(RACINE, '.env');
  if (!fs.existsSync(fichier)) return;
  for (const ligne of fs.readFileSync(fichier, 'utf8').split(/\r?\n/)) {
    const l = ligne.trim();
    if (!l || l.startsWith('#')) continue;
    const i = l.indexOf('=');
    if (i === -1) continue;
    const cle = l.slice(0, i).trim();
    const valeur = l.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (!(cle in process.env)) process.env[cle] = valeur;
  }
}
lireEnv();

const PORT_API = process.env.PORT || '4000';
const PORT_WEB = process.env.VITE_PORT || '3000';
const URI_MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/plages_agronomiques';
const BASE_MONGO = (() => {
  const sansParams = URI_MONGO.split('?')[0];
  return sansParams.slice(sansParams.lastIndexOf('/') + 1) || 'plages_agronomiques';
})();
const URI_AFFICHEE = String(URI_MONGO).replace(/\/\/[^@/]*@/, '//***:***@');

const COULEURS = { api: '\x1b[32m', web: '\x1b[36m', fin: '\x1b[0m', gris: '\x1b[90m' };
const prefixe = (nom) => `${COULEURS[nom]}[${nom}]${COULEURS.fin} `;

const processus = [];
let arret = false;

function lancer(nom, cmd, args, cwd) {
  const enfant = spawn(cmd, args, {
    cwd,
    env: { ...process.env, FORCE_COLOR: '1' },
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  processus.push(enfant);

  const ecrire = (flux) => (bloc) => {
    String(bloc)
      .split(/\r?\n/)
      .filter((l) => l.trim() !== '')
      .forEach((l) => flux.write(prefixe(nom) + l + '\n'));
  };
  enfant.stdout.on('data', ecrire(process.stdout));
  enfant.stderr.on('data', ecrire(process.stderr));

  enfant.on('exit', (code) => {
    if (arret) return;
    process.stdout.write(`${prefixe(nom)}${code === 0 ? 'termine' : `arrete (code ${code})`} — l'autre service est arrete aussi.\n`);
    arreter(code || 0);
  });

  enfant.on('error', (err) => {
    process.stderr.write(
      `${prefixe(nom)}impossible de demarrer « ${cmd} » : ${err.message}\n` +
        `${COULEURS.gris}          -> avez-vous lance « npm install » a la racine du projet ?${COULEURS.fin}\n`
    );
    arreter(1);
  });

  return enfant;
}

function arreter(code = 0) {
  if (arret) return;
  arret = true;
  processus.forEach((p) => {
    if (p.exitCode === null) {
      try { p.kill('SIGTERM'); } catch { /* deja arrete */ }
    }
  });
  setTimeout(() => process.exit(code), 250);
}

process.on('SIGINT', () => {
  process.stdout.write(`\n${prefixe('web').replace('[web]', '[dev]')}arret demande (Ctrl + C)...\n`);
  arreter(0);
});
process.on('SIGTERM', () => arreter(0));

/* --- Verifications avant demarrage --------------------------------------- */
if (!fs.existsSync(path.join(RACINE, 'node_modules'))) {
  console.error('');
  console.error('  Les composants ne sont pas installes.');
  console.error('  Tapez d\'abord :  npm install');
  console.error('');
  process.exit(1);
}
const viteBin = path.join(RACINE, 'node_modules', 'vite', 'bin', 'vite.js');

console.log('');
console.log('  +------------------------------------------------------------+');
console.log('  |  Plages agronomiques - mode developpement                  |');
console.log('  |  frontend/  ->  React + Tailwind                           |');
console.log('  |  backend/   ->  Express + MongoDB                          |');
console.log('  +------------------------------------------------------------+');
console.log(`   Frontend (React/Vite)  : http://localhost:${PORT_WEB}   <- ouvrez cette adresse`);
console.log(`   Backend  (API Express) : http://localhost:${PORT_API}`);
console.log(`   Base de donnees        : MongoDB « ${BASE_MONGO} » (${URI_AFFICHEE})`);
console.log('   Arret : Ctrl + C');
console.log('');

lancer('api', process.execPath, ['server/index.js'], DOSSIER_BACK);
lancer('web', process.execPath, [viteBin, '--port', PORT_WEB, '--host'], DOSSIER_FRONT);
