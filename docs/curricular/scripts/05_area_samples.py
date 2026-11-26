"""
05_area_samples.py
For each major area, extracts first 3 pages of content text
to identify internal structure (bloques, ciclos, años, etc).
Saves: raw_area_samples/[area].txt
"""
import warnings; warnings.filterwarnings("ignore")
import pymupdf
import os

PDF = r"d:\Sistemas\educar\docs\dis-curricular-PBA-completo.pdf"
OUT = r"d:\Sistemas\educar\docs\curricular\raw_area_samples"
os.makedirs(OUT, exist_ok=True)

doc = pymupdf.open(PDF)

AREAS = {
    "00_principios":        (14, 22),   # d14-d22
    "01_ed_inclusiva":      (22, 32),
    "02_tic":               (32, 44),
    "03_practicas_lenguaje":(44, 98),
    "04_matematica":        (98, 180),
    "05_cs_sociales":       (180, 236),
    "06_cs_naturales":      (236, 294),
    "07_ingles":            (294, 312),
    "08_ed_artistica":      (312, 372),
    "09_ed_fisica":         (372, 434),
}

for name, (d_start, d_end) in AREAS.items():
    with open(f"{OUT}/{name}.txt", "w", encoding="utf-8") as f:
        # First 4 pages + last 2 pages of section
        pages_to_read = list(range(d_start-1, min(d_start+3, d_end-1)))
        pages_to_read += list(range(max(d_end-3, d_start+3), d_end))
        pages_to_read = sorted(set(pages_to_read))

        f.write(f"AREA: {name}  |  digital d{d_start}-d{d_end-1}  |  printed p{d_start-1}-p{d_end-2}\n")
        f.write(f"Total pages in area: {d_end - d_start}\n")
        f.write("="*70 + "\n\n")

        for di in pages_to_read:
            if di < 0 or di >= doc.page_count: continue
            t = doc[di].get_text("text")
            f.write(f"\n--- d{di+1} (p{di}) ---\n")
            f.write(t[:2000])

        # Also scan for structural keywords in full section
        keywords = ["Bloque", "bloque", "Primer Ciclo", "Segundo Ciclo",
                    "Primer año", "Segundo año", "Tercer año",
                    "Cuarto año", "Quinto año", "Sexto año",
                    "Propósitos", "propósitos", "Objetivos", "Contenidos",
                    "Indicadores de avance", "Modos de conocer",
                    "Situaciones de enseñanza", "Orientaciones",
                    "Criterios de evaluación",
                    "Unidad Pedagógica"]
        kw_pages = {kw: [] for kw in keywords}
        for di in range(d_start-1, d_end-1):
            if di >= doc.page_count: break
            t = doc[di].get_text("text")
            for kw in keywords:
                if kw in t:
                    kw_pages[kw].append(di+1)

        f.write("\n\nSTRUCTURE KEYWORDS FOUND:\n")
        for kw, pages in kw_pages.items():
            if pages:
                f.write(f"  {kw}: d{pages}\n")

    print(f"  {name}: done")

doc.close()
print("All area samples saved.")
