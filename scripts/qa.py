import json, sys, time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:4000"
SHOTS = "/tmp/shots-react"
import os
os.makedirs(SHOTS, exist_ok=True)

erreurs = []
def defilement(page, pas=700, pause=0.12):
    h = page.evaluate("() => document.body.scrollHeight")
    y = 0
    while y < h:
        page.evaluate(f"() => window.scrollTo(0, {y})")
        page.wait_for_timeout(int(pause * 1000))
        y += pas
    page.evaluate("() => window.scrollTo(0, 0)")
    page.wait_for_timeout(500)
pages = ["/", "/cultures", "/guide", "/formulaire", "/analyse", "/inexistant"]
resultats = []

with sync_playwright() as p:
    nav = p.chromium.launch()
    ctx = nav.new_context(viewport={"width": 1440, "height": 950}, device_scale_factor=1)
    pg = ctx.new_page()
    pg.on("console", lambda m: erreurs.append(f"[console:{m.type}] {m.text}") if m.type in ("error", "warning") else None)
    pg.on("pageerror", lambda e: erreurs.append(f"[pageerror] {e}"))

    for chemin in pages:
        r = pg.goto(BASE + chemin, wait_until="networkidle")
        nom = chemin.strip("/").replace("/", "-") or "accueil"
        defilement(pg)
        pg.screenshot(path=f"{SHOTS}/{nom}.png", full_page=True)
        resultats.append((chemin, r.status, pg.title()))

    # ---- Parcours formulaire complet ----
    pg.goto(BASE + "/formulaire", wait_until="networkidle")
    pg.click("text=Continuer vers les cultures")
    time.sleep(0.4)
    err0 = pg.locator("text=Indiquez votre nom et prénom.").count()
    pg.screenshot(path=f"{SHOTS}/form-erreurs.png", full_page=True)

    pg.fill("#nom", "Kabasele Mbuyi Jean")
    pg.fill("#organisation", "Ingénieur agronome - INERA Mvuazi")
    pg.fill("#contact", "+243 990 111 222")
    pg.fill("#date_relecture", "22/10/2026")
    pg.check("#accord")
    pg.click("text=Continuer vers les cultures")
    time.sleep(0.5)
    pg.screenshot(path=f"{SHOTS}/form-cultures.png", full_page=True)

    # ouvrir le manioc
    pg.click("section#culture-manioc button[aria-expanded]")
    time.sleep(0.5)
    pg.fill("#p-manioc-ph-imin", "5,5")
    pg.fill("#p-manioc-ph-imax", "6,8")
    # source manquante volontairement -> doit bloquer
    pg.click("text=Vérifier et envoyer")
    time.sleep(0.4)
    blocage = pg.locator("text=à corriger avant l’envoi").count()
    pg.screenshot(path=f"{SHOTS}/form-erreurs-culture.png", full_page=True)

    pg.click("text=Retour aux cultures")
    time.sleep(0.5)
    pg.click("section#culture-manioc button[aria-expanded]") if pg.locator("#p-manioc-ph-source").count() == 0 else None
    time.sleep(0.3)
    pg.fill("#p-manioc-ph-source", "FAO EcoCrop - Manihot esculenta, 2024, p. 12")
    pg.click("label:has(input[name='p-manioc-ph-statut'][value='VALIDATED'])")
    pg.click("text=Vérifier et envoyer")
    time.sleep(0.5)
    pg.screenshot(path=f"{SHOTS}/form-verification.png", full_page=True)
    pg.click("text=Envoyer ma relecture")
    pg.wait_for_url("**/recapitulatif/**", timeout=10000)
    time.sleep(0.8)
    ref = pg.locator("text=/PA-\\d{4}-\\d{4}/").first.inner_text()
    pg.screenshot(path=f"{SHOTS}/recapitulatif.png", full_page=True)

    # ---- Analyse ----
    pg.goto(BASE + "/analyse", wait_until="networkidle")
    pg.fill("#code", "agro2026")
    pg.click("text=Ouvrir le tableau de bord")
    pg.wait_for_selector("text=Relectures reçues", timeout=10000)
    time.sleep(1.0)
    pg.screenshot(path=f"{SHOTS}/analyse-connecte.png", full_page=True)

    # ---- Mobile ----
    m = nav.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    mp = m.new_page()
    mp.on("pageerror", lambda e: erreurs.append(f"[mobile pageerror] {e}"))
    for chemin in ["/", "/cultures", "/guide", "/formulaire", "/analyse"]:
        mp.goto(BASE + chemin, wait_until="networkidle")
        defilement(mp)
        nom = "m-" + (chemin.strip("/").replace("/", "-") or "accueil")
        mp.screenshot(path=f"{SHOTS}/{nom}.png", full_page=True)
        debordement = mp.evaluate("() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
        resultats.append((chemin + " (mobile)", f"scrollWidth{débordement}" if False else f"debordement={debordement}px", ""))

    nav.close()

print("Référence créée :", ref)
print("Erreur nom affichée :", err0)
print("Blocage source manquante :", blocage)
for r in resultats:
    print(r)
print("Console :", erreurs[:10] if erreurs else "aucune")
