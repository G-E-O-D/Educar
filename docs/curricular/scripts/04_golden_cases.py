"""
04_golden_cases.py
Searches for golden case terms across the full document.
Saves: raw_golden_cases.json with page, context, and quote.
"""
import warnings; warnings.filterwarnings("ignore")
import pymupdf
import json
import re

PDF = r"d:\Sistemas\educar\docs\dis-curricular-PBA-completo.pdf"
doc = pymupdf.open(PDF)

SEARCHES = {
    "cs_sociales_4": [
        "organización federal", "ambientes", "recursos naturales",
        "pueblos originarios", "conquista", "sociedad colonial",
        "virreinato", "colonia",
    ],
    "ciclo_agua": [
        "ciclo del agua", "ciclo hidrológico", "evaporación", "precipitación",
        "condensación", "agua",
    ],
    "lenguaje_acentuacion": [
        "acentuación", "acento", "tilde", "ortografía", "reglas ortográficas",
        "palabras agudas", "palabras graves", "palabras esdrújulas",
    ],
    "matematica_fracciones": [
        "fracción", "fracciones", "fracciones equivalentes",
        "numerador", "denominador", "número racional",
    ],
    "educacion_inclusiva": [
        "inclusiva", "inclusión", "diversidad", "DUA",
        "barreras", "ajustes razonables", "discapacidad",
    ],
    "formacion_etica": [
        "formación ética", "ética y ciudadana", "ciudadanía",
        "valores", "derechos",
    ],
    "ed_sexual_integral": [
        "educación sexual", "ESI", "género",
    ],
}

results = {}
for category, terms in SEARCHES.items():
    hits = []
    for term in terms:
        pattern = re.compile(re.escape(term), re.IGNORECASE)
        for i in range(doc.page_count):
            text = doc[i].get_text("text")
            for m in pattern.finditer(text):
                start = max(0, m.start() - 100)
                end = min(len(text), m.end() + 200)
                context = text[start:end].replace("\n", " ").strip()
                hits.append({
                    "term": term,
                    "d_page": i + 1,
                    "p_page": i,
                    "context": context[:350],
                })
        # Deduplicate by (term, page)
    seen = set()
    unique = []
    for h in hits:
        k = (h["term"], h["d_page"])
        if k not in seen:
            seen.add(k)
            unique.append(h)
    results[category] = unique

with open(r"d:\Sistemas\educar\docs\curricular\raw_golden_cases.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

# Print summary
for cat, hits in results.items():
    pages = sorted(set(h["d_page"] for h in hits))
    print(f"{cat}: {len(hits)} hits — pages {pages[:10]}{'...' if len(pages)>10 else ''}")

doc.close()
print("Done.")
