#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fill_pdf.py — remplit le formulaire PDF d'origine (champs AcroForm)
avec les valeurs saisies sur le site, pour archivage / impression.

Usage : python3 fill_pdf.py entree.json sortie.pdf
Le JSON contient : {"donnees": {...}, "reference": "PA-2026-0001"}
"""
import json
import sys
import os

try:
    import pymupdf  # PyMuPDF >= 1.24
except ImportError:  # pragma: no cover
    try:
        import fitz as pymupdf
    except ImportError:
        sys.stderr.write("PyMuPDF absent\n")
        sys.exit(2)

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELE = os.path.join(BASE, "media", "Plages_agronomiques_formulaire.pdf")

PREFIXES = {
    "manioc": "manioc", "mais": "mais", "haricot": "haricot",
    "arachide": "arachide", "riz": "riz", "bananier": "plantain",
    "palmier": "palmier", "cafe": "cafe", "cacao": "cacao",
}
PARAMS = ["ph", "temp", "hum", "ec", "racine"]
CHAMPS = ["imin", "imax", "tmin", "tmax"]
ECOCROP = ["ph_imin", "ph_imax", "ph_tmin", "ph_tmax", "t_imin", "t_imax", "t_tmin", "t_tmax", "url", "date"]
ZONE_MAP = {"Équateur": "Equateur", "Equateur": "Equateur", "Bandundu": "Bandundu", "Les deux": "Les deux"}


CHAMPS_NUMERIQUES = {"imin", "imax", "tmin", "tmax"} | {"ph_imin", "ph_imax", "ph_tmin", "ph_tmax",
                                                      "t_imin", "t_imax", "t_tmin", "t_tmax"}


def txt(v, numerique=False):
    if v is None:
        return ""
    s = str(v)
    # Le document est en français : les décimales sont écrites avec une virgule.
    if numerique:
        s = s.replace(".", ",")
    return s


def main():
    if len(sys.argv) != 3:
        sys.stderr.write("Usage: fill_pdf.py entree.json sortie.pdf\n")
        return 1
    with open(sys.argv[1], encoding="utf-8") as f:
        contenu = json.load(f)
    donnees = contenu.get("donnees", {})
    agronome = donnees.get("agronome", {}) or {}
    cultures = donnees.get("cultures", {}) or {}
    reference = contenu.get("reference", "")

    doc = pymupdf.open(MODELE)

    valeurs = {}
    valeurs["agro_nom"] = txt(agronome.get("nom"))
    valeurs["agro_org"] = txt(agronome.get("organisation"))
    valeurs["agro_contact"] = txt(agronome.get("contact"))
    valeurs["agro_date"] = txt(agronome.get("date_relecture"))

    for cid, prefixe in PREFIXES.items():
        c = cultures.get(cid) or {}
        valeurs[prefixe + "_sci"] = txt(c.get("nom_scientifique"))
        valeurs[prefixe + "_zone"] = ZONE_MAP.get(txt(c.get("zone")), "Les deux")
        eco = c.get("ecocrop") or {}
        for champ in ECOCROP:
            valeurs[prefixe + "_eco_" + champ] = txt(eco.get(champ), numerique=champ in CHAMPS_NUMERIQUES)
        params = c.get("parametres") or {}
        for p in PARAMS:
            v = params.get(p) or {}
            for champ in CHAMPS:
                valeurs[prefixe + "_" + p + "_" + champ] = txt(v.get(champ), numerique=True)
            valeurs[prefixe + "_" + p + "_source"] = txt(v.get("source"))
            valeurs[prefixe + "_" + p + "_statut"] = "VALIDATED" if v.get("statut") == "VALIDATED" else "PROVISIONAL"
        valeurs[prefixe + "_remarques"] = txt(c.get("remarques"))

    # Case « J'accepte que mon nom et la date de relecture soient cités »
    accord = bool(agronome.get("accord"))

    remplis = 0
    for page in doc:
        for w in page.widgets():
            nom = w.field_name
            if nom == "agro_accord":
                w.field_value = accord
                w.update()
                continue
            if nom in valeurs:
                val = valeurs[nom]
                if w.field_type_string == "ComboBox":
                    if val not in (w.choice_values or []):
                        continue
                if val == "":
                    w.field_value = ""
                else:
                    w.field_value = val
                w.update()
                if val != "":
                    remplis += 1

    # Note de traçabilité en pied de la première page (hors champs)
    try:
        p = doc[0]
        texte = "Relecture enregistrée sur la plateforme — référence %s" % (reference or "—")
        p.insert_text((28, 560), texte, fontsize=7.5, fontname="helv", color=(0.25, 0.29, 0.27))
    except Exception:
        pass

    doc.save(sys.argv[2], deflate=True, garbage=3, clean=True)
    doc.close()
    sys.stdout.write("ok %d\n" % remplis)
    return 0


if __name__ == "__main__":
    sys.exit(main())
