/* Chargement minimal d'un fichier .env (aucune dépendance).
   Les variables déjà définies dans l'environnement sont prioritaires. */
import fs from 'node:fs';
import path from 'node:path';

/* On cherche .env dans le dossier courant, puis dans le dossier parent
   (le .env du projet est à la racine de « plages-agronomiques »). */
const candidats = [
  path.join(process.cwd(), '.env'),
  path.resolve(process.cwd(), '..', '.env'),
  path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '.env')
];
const fichier = candidats.find((f) => fs.existsSync(f));
if (fichier) {
  const lignes = fs.readFileSync(fichier, 'utf8').split(/\r?\n/);
  for (const ligne of lignes) {
    const l = ligne.trim();
    if (!l || l.startsWith('#')) continue;
    const i = l.indexOf('=');
    if (i === -1) continue;
    const cle = l.slice(0, i).trim();
    let valeur = l.slice(i + 1).trim();
    if (/^".*"$/.test(valeur) || /^'.*'$/.test(valeur)) valeur = valeur.slice(1, -1);
    if (!(cle in process.env)) process.env[cle] = valeur;
  }
}
