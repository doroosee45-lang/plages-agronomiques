/* ==========================================================================
   server/pdf.js — remplissage du formulaire PDF d'origine (facultatif)
   Nécessite Python + PyMuPDF ; sinon le serveur le signale sans bloquer.
   ========================================================================== */
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SCRIPT = path.join(ROOT, 'scripts', 'fill_pdf.py');
const CANDIDATS = process.platform === 'win32' ? ['python', 'py', 'python3'] : ['python3', 'python'];

export const etatPdf = { disponible: false, python: null, message: '' };

export function detecterPython() {
  return new Promise((resolve) => {
    if (!fs.existsSync(SCRIPT)) {
      etatPdf.message = 'script fill_pdf.py absent';
      return resolve(false);
    }
    const essai = (i) => {
      if (i >= CANDIDATS.length) {
        etatPdf.disponible = false;
        etatPdf.message = 'Python ou le module PyMuPDF est absent';
        return resolve(false);
      }
      const exe = CANDIDATS[i];
      execFile(exe, ['-c', 'import pymupdf'], { timeout: 20000 }, (err) => {
        if (err) return essai(i + 1);
        etatPdf.disponible = true;
        etatPdf.python = exe;
        etatPdf.message = `disponible (via « ${exe} »)`;
        resolve(true);
      });
    };
    essai(0);
  });
}

export function genererPdf(record) {
  return new Promise((resolve, reject) => {
    if (!etatPdf.disponible) {
      return reject(Object.assign(new Error(
        'Le téléchargement du PDF rempli n’est pas disponible sur ce serveur (Python et PyMuPDF absents). ' +
        'Vos données sont bien enregistrées ; l’impression de la page reste possible.'
      ), { statut: 503 }));
    }
    const base = path.join(os.tmpdir(), `pa-${record.id}-${Date.now()}`);
    const jsonPath = `${base}.json`;
    const pdfPath = `${base}.pdf`;
    fs.writeFile(jsonPath, JSON.stringify({ reference: record.reference, donnees: record.donnees }), 'utf8', (err) => {
      if (err) return reject(err);
      execFile(etatPdf.python, [SCRIPT, jsonPath, pdfPath], { timeout: 60000 }, (err2) => {
        fs.unlink(jsonPath, () => {});
        if (err2) {
          const detail = String((err2 && (err2.stderr || err2.message)) || '').split('\n')[0];
          return reject(Object.assign(new Error(`Le PDF n’a pas pu être généré${detail ? ` : ${detail}` : '.'}`), { statut: 500 }));
        }
        fs.readFile(pdfPath, (err3, buf) => {
          fs.unlink(pdfPath, () => {});
          if (err3) return reject(err3);
          resolve(buf);
        });
      });
    });
  });
}
