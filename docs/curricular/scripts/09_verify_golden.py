"""
09_verify_golden.py - Verify specific golden cases with text extracts
"""
import warnings; warnings.filterwarnings("ignore")
import pymupdf
import re

PDF = r"d:\Sistemas\educar\docs\dis-curricular-PBA-completo.pdf"
doc = pymupdf.open(PDF)

def show(d_pages, label, term=None):
    print(f"\n{'='*60}\n{label}\n{'='*60}")
    for d in d_pages:
        if d < 1 or d > doc.page_count: continue
        t = doc[d-1].get_text("text")
        if term:
            idx = t.lower().find(term.lower())
            if idx < 0:
                # Try partial
                for w in term.split():
                    idx = t.lower().find(w.lower())
                    if idx >= 0: break
            if idx >= 0:
                ctx = t[max(0,idx-150):idx+400]
                print(f"\nd{d} (p{d-1}): ...{ctx[:500]}...")
        else:
            print(f"\nd{d} (p{d-1}):\n{t[:800]}")

# 1. Ciclo del agua in CS Naturales
show([279, 280], "CICLO DEL AGUA — CS NATURALES", "ciclo del agua")

# 2. Fracciones — 3er año vs 5to año progression
show([129, 135], "FRACCIONES — 3ER AÑO MATH (Primer Ciclo / 3er año)", "fraccion")
show([152, 153], "FRACCIONES — 4TO AÑO MATH", "fraccion")
show([166, 167], "FRACCIONES — 5TO/6TO AÑO MATH", "fraccion")

# 3. Acentuación — Prácticas del Lenguaje
show([53, 68], "ACENTUACIÓN — PRÁCTICAS DEL LENGUAJE", "acent")

# 4. CS Sociales 4to año — Objetivos
show([201], "CS SOCIALES — CUARTO AÑO OBJETIVOS", "cuarto")

# 5. CS Sociales 4to — organización federal
show([204], "CS SOCIALES — ORGANIZACIÓN FEDERAL (4to año)", "federal")

doc.close()
