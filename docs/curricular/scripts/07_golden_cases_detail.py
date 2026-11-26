"""
07_golden_cases_detail.py
Reads specific page ranges for each golden case to verify and quote.
"""
import warnings; warnings.filterwarnings("ignore")
import pymupdf
import json

PDF = r"d:\Sistemas\educar\docs\dis-curricular-PBA-completo.pdf"
doc = pymupdf.open(PDF)
OUT = r"d:\Sistemas\educar\docs\curricular\raw_golden_detail.txt"

def get_pages(pages_1idx, chars=3000):
    out = []
    for p in pages_1idx:
        di = p - 1
        if 0 <= di < doc.page_count:
            t = doc[di].get_text("text")
            out.append(f"\n--- d{p} (p{p-1} printed) ---\n{t[:chars]}")
    return "\n".join(out)

with open(OUT, "w", encoding="utf-8") as f:

    # 1. CS Sociales 4° año — pages d185-d200 (printed 184-199)
    f.write("="*70 + "\n1. CIENCIAS SOCIALES — CUARTO AÑO (sample d185-d200)\n" + "="*70)
    f.write(get_pages(range(185, 202), 2000))

    # 2. Ciclo del agua — first 5 hits in CS Naturales
    f.write("\n\n" + "="*70 + "\n2. CICLO DEL AGUA — CS NATURALES (pages with hit)\n" + "="*70)
    # From golden_cases: pages [189, 193, 198, 205, 207, 212, 214, 217, 218, 227] — but need naturales only
    # Naturales: d236-293. Ciclo hits include d189 which is cs_sociales section. Let me check
    import json as _json
    with open(r"d:\Sistemas\educar\docs\curricular\raw_golden_cases.json", encoding="utf-8") as gc:
        gdata = _json.load(gc)
    agua_hits = [h for h in gdata["ciclo_agua"] if 236 <= h["d_page"] <= 293 and "ciclo" in h["term"].lower()]
    agua_pages = sorted(set(h["d_page"] for h in agua_hits))[:5]
    f.write(get_pages(agua_pages, 2000))

    # Also check "agua" in cs_sociales
    f.write("\n\n--- Ciclo del agua hits in CS Sociales (d180-235) ---")
    agua_cs = [h for h in gdata["ciclo_agua"] if 180 <= h["d_page"] <= 235 and "ciclo" in h["term"].lower()]
    for h in agua_cs[:3]:
        f.write(f"\n  d{h['d_page']} (p{h['p_page']}) [{h['term']}]: ...{h['context'][:200]}...\n")

    # 3. Acentuación — Prácticas del Lenguaje (d44-97)
    f.write("\n\n" + "="*70 + "\n3. ACENTUACIÓN — PRÁCTICAS DEL LENGUAJE\n" + "="*70)
    acent_hits = [h for h in gdata["lenguaje_acentuacion"] if 44 <= h["d_page"] <= 97]
    acent_pages = sorted(set(h["d_page"] for h in acent_hits))[:6]
    f.write(get_pages(acent_pages, 1500))

    # 4. Fracciones — Matemática (d98-179)
    f.write("\n\n" + "="*70 + "\n4. FRACCIONES — MATEMÁTICA (progression)\n" + "="*70)
    frac_hits = [h for h in gdata["matematica_fracciones"] if 98 <= h["d_page"] <= 179]
    frac_pages = sorted(set(h["d_page"] for h in frac_hits))
    f.write(f"\nFracciones pages: {frac_pages}\n")
    # Sample first 3 and last 3
    sample = frac_pages[:3] + (frac_pages[-3:] if len(frac_pages) > 3 else [])
    f.write(get_pages(sample, 1500))

    # 5. Ed. Inclusiva — Módulo (d22-31)
    f.write("\n\n" + "="*70 + "\n5. EDUCACIÓN INCLUSIVA — MÓDULO (d22-31)\n" + "="*70)
    f.write(get_pages(range(22, 32), 1500))

doc.close()
print(f"Written: {OUT}")
print(f"Agua pages in Naturales: {agua_pages}")
print(f"Acentuación pages: {acent_pages}")
print(f"Fracciones pages (Matemática): {frac_pages}")
