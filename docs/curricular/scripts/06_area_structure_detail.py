"""
06_area_structure_detail.py
For each area: extracts structural keywords locations, identifies
bloques, years, and prints concise structure map.
"""
import warnings; warnings.filterwarnings("ignore")
import pymupdf
import json
import re

PDF = r"d:\Sistemas\educar\docs\dis-curricular-PBA-completo.pdf"
doc = pymupdf.open(PDF)

AREAS = {
    "Principios/Intro":     (14, 22),
    "Ed. Inclusiva":        (22, 32),
    "TIC":                  (32, 44),
    "Prácticas del Lenguaje": (44, 98),
    "Matemática":           (98, 180),
    "Ciencias Sociales":    (180, 236),
    "Ciencias Naturales":   (236, 294),
    "Inglés":               (294, 312),
    "Educación Artística":  (312, 372),
    "Educación Física":     (372, 434),
}

# Structural keywords to locate
STRUCT_KW = [
    "Primer Ciclo", "Segundo Ciclo",
    "Unidad Pedagógica",
    "Primer año", "Segundo año", "Tercer año",
    "Cuarto año", "Quinto año", "Sexto año",
    "Propósitos", "Objetivos",
    "Contenidos",
    "Bloque",
    "Indicadores de avance",
    "Modos de conocer",
    "Situaciones de enseñanza",
    "Orientaciones didácticas",
    "Criterios de evaluación",
    "Bibliografía",
]

result = {}
for area_name, (d_start, d_end) in AREAS.items():
    kw_map = {kw: [] for kw in STRUCT_KW}
    bloques = set()

    for di in range(d_start-1, min(d_end, doc.page_count)):
        t = doc[di].get_text("text")
        for kw in STRUCT_KW:
            if kw in t:
                kw_map[kw].append(di+1)
        # Extract bloque names
        for m in re.finditer(r'Bloque[:\s]+([^\n]{5,60})', t):
            bloques.add(m.group(0).strip()[:80])

    result[area_name] = {
        "d_range": [d_start, d_end-1],
        "p_range": [d_start-1, d_end-2],
        "total_pages": d_end - d_start,
        "structure": {kw: sorted(set(v)) for kw, v in kw_map.items() if v},
        "bloque_samples": sorted(bloques)[:20],
    }

with open(r"d:\Sistemas\educar\docs\curricular\raw_area_structure.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

# Print summary table
print(f"{'AREA':<30} {'D_RANGE':<12} {'PAGES':>6}  STRUCTURE_HIGHLIGHTS")
for name, v in result.items():
    dr = f"d{v['d_range'][0]}-{v['d_range'][1]}"
    s = v["structure"]
    flags = []
    for kw in ["Bloque","Modos de conocer","Indicadores de avance","Situaciones de enseñanza",
               "Criterios de evaluación","Unidad Pedagógica"]:
        if kw in s:
            flags.append(kw.split()[0])
    print(f"  {name:<28} {dr:<12} {v['total_pages']:>6}  {' | '.join(flags)}")

    # Print year breakdown
    yr_keys = [k for k in ["Primer año","Segundo año","Tercer año","Cuarto año","Quinto año","Sexto año"] if k in s]
    if yr_keys:
        yr_str = ", ".join(f"{k}→d{s[k]}" for k in yr_keys)
        print(f"    Years: {yr_str}")

doc.close()
print("\nDone.")
