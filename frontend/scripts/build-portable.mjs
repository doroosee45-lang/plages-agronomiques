/* ==========================================================================
   build-portable.mjs — construit une version « double-clic » (sans serveur)
   Sortie : dist-portable/index.html + app.js + app.css + images
   Le fichier index.html s'ouvre directement dans le navigateur (file://).
   ========================================================================== */
import { build } from 'esbuild';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = path.dirname(path.dirname(fileURLToPath(import.meta.url))); // …/frontend
const BACKEND = path.resolve(RACINE, '..', 'backend');
const SORTIE = path.join(RACINE, 'dist-portable');

fs.rmSync(SORTIE, { recursive: true, force: true });
fs.mkdirSync(SORTIE, { recursive: true });

/* 1. JavaScript (React + Tailwind) en un seul fichier lisible en file:// */
await build({
  absWorkingDir: RACINE,
  entryPoints: ['src/main.jsx'],
  bundle: true,
  format: 'iife',
  jsx: 'automatic',
  minify: true,
  target: ['es2018'],
  define: { 'process.env.NODE_ENV': '"production"' },
  alias: { '@shared': path.join(BACKEND, 'shared') },
  loader: { '.jpg': 'file', '.jpeg': 'file', '.png': 'file', '.svg': 'file' },
  publicPath: '.',
  outfile: path.join(SORTIE, 'app.js'),
  logLevel: 'info'
});

/* 2. Feuille de style compilée par Tailwind */
const css = fs.readFileSync(path.join(RACINE, 'src/index.css'), 'utf8');
const resultat = await postcss([
  tailwindcss(path.join(RACINE, 'tailwind.config.js')),
  autoprefixer()
]).process(css, { from: path.join(RACINE, 'src/index.css') });
fs.writeFileSync(path.join(SORTIE, 'app.css'), resultat.css);

/* 3. Page d'entrée */
fs.writeFileSync(path.join(SORTIE, 'index.html'), `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#123d2a" />
    <title>Plages agronomiques — version de consultation</title>
    <meta name="description" content="Version de consultation hors ligne de la plateforme de collecte et d’analyse des plages agronomiques par culture (Équateur, Bandundu)." />
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23123d2a'/%3E%3Cpath d='M16 25V13' stroke='%23f3ecdc' stroke-width='2' stroke-linecap='round'/%3E%3Cpath d='M16 15c0-4 3-6 7-6 0 4-3 6-7 6Zm0 5c0-3-2.5-5-6-5 0 3 2.5 5 6 5Z' fill='%23db8a4c'/%3E%3C/svg%3E" />
    <link rel="stylesheet" href="./app.css" />
  </head>
  <body>
    <div id="racine"></div>
    <script src="./app.js" defer></script>
  </body>
</html>
`);

console.log('Version portable prête : dist-portable/index.html (double-clic).');
