/* ==========================================================================
   scripts/db-statut.mjs — « npm run db:statut »
   Vérifie la connexion MongoDB, affiche la base, la version et le nombre
   de relectures enregistrées. Aucun risque : lecture seule.
   ========================================================================== */
import "../server/env.js";
import { verifier, URI_PAR_DEFAUT } from '../server/db.js';

const uri = process.env.MONGO_URI || URI_PAR_DEFAUT;

console.log('');
console.log('  Vérification de la connexion MongoDB…');
console.log(`  Adresse : ${String(uri).replace(/\/\/[^@/]*@/, '//***:***@')}`);
console.log('');

try {
  const r = await verifier(uri);
  console.log('  ✔ MongoDB répond.');
  console.log(`    Base de données   : ${r.base}`);
  console.log(`    Version du serveur: ${r.version}`);
  console.log(`    Relectures        : ${r.documents}`);
  console.log(`    Temps de réponse  : ${r.duree_ms} ms`);
  console.log('');
  console.log('  → Lancez maintenant « npm run dev » : les relectures seront');
  console.log('    enregistrées directement dans cette base.');
  console.log('');
  process.exit(0);
} catch (e) {
  console.log('  ✘ MongoDB ne répond pas.');
  console.log(`    Détail : ${e.message}`);
  console.log('');
  console.log('  Que faire ?');
  console.log('   • Windows : menu Démarrer → « Services » → MongoDB Server → Démarrer');
  console.log('   • macOS   : brew services start mongodb-community');
  console.log('   • Linux   : sudo systemctl start mongod');
  console.log('   • MongoDB Atlas (en ligne) : copiez la chaîne de connexion dans');
  console.log('     le fichier .env, ligne MONGO_URI=…');
  console.log('');
  console.log('  Sans MongoDB, le serveur bascule sur data/relectures.json (le site');
  console.log('  fonctionne, mais les données ne sont pas dans la base).');
  console.log('');
  process.exit(1);
}
