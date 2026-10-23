import json, os
from playwright.sync_api import sync_playwright

BASE = "http://localhost:4000"
AXE = os.path.join(os.path.dirname(__file__), "..", "node_modules", "axe-core", "axe.min.js")
PAGES = ["/", "/cultures", "/guide", "/formulaire", "/analyse"]

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    for chemin in PAGES:
        pg.goto(BASE + chemin, wait_until="networkidle")
        pg.wait_for_timeout(1300)
        pg.add_script_tag(path=AXE)
        res = pg.evaluate("""async () => {
            const r = await axe.run(document, { runOnly: ['wcag2a','wcag2aa','wcag21a','wcag21aa'] });
            return r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, aide: v.help,
                cibles: v.nodes.slice(0,3).map(x => x.target.join(' ')) }));
        }""")
        print(f"--- {chemin} : {len(res)} violation(s)")
        for v in res:
            print(f"   [{v['impact']}] {v['id']} ({v['n']}) — {v['aide']}")
            for c in v["cibles"]:
                print(f"      cible: {c}")
    # --- états dynamiques ---
    pg.goto(BASE + "/formulaire", wait_until="networkidle")
    pg.fill("#nom", "Kabasele Mbuyi Jean"); pg.fill("#organisation", "Ingénieur agronome")
    pg.fill("#contact", "+243 990 111 222"); pg.fill("#date_relecture", "22/10/2026")
    pg.click("text=Continuer vers les cultures"); pg.wait_for_timeout(400)
    pg.click("section#culture-manioc button[aria-expanded]"); pg.wait_for_timeout(600)
    pg.wait_for_timeout(1300)
    pg.add_script_tag(path=AXE)
    res = pg.evaluate("""async () => { const r = await axe.run(document, { runOnly: ['wcag2a','wcag2aa','wcag21a','wcag21aa'] }); return r.violations.map(v => ({id:v.id, impact:v.impact, n:v.nodes.length, aide:v.help, cibles:v.nodes.slice(0,3).map(x=>x.target.join(' '))})); }""")
    print(f"--- /formulaire (culture ouverte) : {len(res)} violation(s)")
    for v in res: print("   ", v)

    pg.goto(BASE + "/analyse", wait_until="networkidle")
    pg.fill("#code", "agro2026"); pg.click("text=Ouvrir le tableau de bord")
    pg.wait_for_selector("text=Relectures reçues"); pg.wait_for_timeout(900)
    pg.wait_for_timeout(1300)
    pg.add_script_tag(path=AXE)
    res = pg.evaluate("""async () => { const r = await axe.run(document, { runOnly: ['wcag2a','wcag2aa','wcag21a','wcag21aa'] }); return r.violations.map(v => ({id:v.id, impact:v.impact, n:v.nodes.length, aide:v.help, cibles:v.nodes.slice(0,3).map(x=>x.target.join(' '))})); }""")
    print(f"--- /analyse (connecté) : {len(res)} violation(s)")
    for v in res: print("   ", v)
    b.close()
