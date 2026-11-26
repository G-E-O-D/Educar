"""
extract.py — Script principal del extractor piloto.
Etapa 02.3: Matemática 4° año + verificación GC-007.

Uso:
  python extract.py [--area MAT] [--year 4] [--verify-gc007]
  python extract.py --scan-bounds MAT 4

Requiere el venv docs/.venv/ con PyMuPDF instalado.
"""

import sys
import json
import argparse
import re
from pathlib import Path
from datetime import datetime, timezone

# Ajustar path para importar módulos del extractor
sys.path.insert(0, str(Path(__file__).parent))

import fitz

from config import (
    PDF_PATH, OUTPUT_DIR, EXTRACTOR_VERSION,
    RUNNING_HEADERS, TRICOLUMN_THRESHOLDS,
)
from reader import verify_source, open_document, get_page, digital_to_printed
from page_extractor import extract_page_content, find_table_header_row, classify_column
from table_reconstructor import TricolumnReconstructor
from adapters.tricolumn import TricolumnAdapter
from id_generator import IDGenerator
from validator import validate_all
from exporter import export_to_json


# ---------------------------------------------------------------------------
# Detección de bounds reales del área/año en el documento
# ---------------------------------------------------------------------------

def scan_bounds(doc: fitz.Document, area_name: str, year: int) -> dict:
    """
    Detecta los límites reales de un área/año usando detección a nivel de span
    con filtro de tamaño de fuente (>= 14pt) para evitar falsos positivos con
    contenido curricular que contiene palabras como "cuartos" o "quintos".

    Para MAT Segundo Ciclo, año 4° no tiene heading explícito; se usa el inicio
    implícito del ciclo (d135) verificado en Etapa 02.3.1.

    Retorna {area, year, search_range, hits, end_hits, start_digital, end_digital}.
    """
    area_ranges = {
        "MAT": (98, 179),
        "CSS": (180, 235),
        "CSN": (236, 293),
        "LEN": (44, 97),
    }

    # Inicio implícito de Segundo Ciclo (cuando año 4° no tiene heading explícito)
    segundo_ciclo_implicit_start = {
        "MAT": 135,
    }

    # Textos de heading de año (minúsculas exacto o prefijo) con tamaño mínimo de fuente.
    # Verificado: "Quinto año" d147 sz=18, "Sexto año" d161 sz=18 en MAT Segundo Ciclo.
    # En CSS/CSN se usan versiones en MAYÚSCULAS; ambas cubiertas por comparación lower().
    year_heading_texts = {
        1: ["primer año"],
        2: ["segundo año"],
        3: ["tercer año"],
        4: ["cuarto año"],
        5: ["quinto año"],
        6: ["sexto año"],
    }
    MIN_HEADING_SIZE = 14.0

    start_range, end_range = area_ranges.get(area_name, (98, 179))

    def find_year_heading(patterns, page_start, page_end):
        """Devuelve el primer hit con span de tamaño >= MIN_HEADING_SIZE."""
        for d in range(page_start, page_end + 1):
            page = doc[d - 1]
            for blk in page.get_text("dict", sort=True).get("blocks", []):
                if blk.get("type") != 0:
                    continue
                for ln in blk.get("lines", []):
                    for sp in ln.get("spans", []):
                        # Normalizar whitespace ("QUINTO  AÑO" tiene 2 espacios en este PDF)
                        t = " ".join(sp.get("text", "").strip().lower().split())
                        sz = sp.get("size", 0)
                        if sz >= MIN_HEADING_SIZE:
                            for pat in patterns:
                                if t == pat or t.startswith(pat):
                                    return {
                                        "digital_page": d,
                                        "pattern": pat,
                                        "size": sz,
                                        "text": sp.get("text", "").strip(),
                                    }
        return None

    this_patterns = year_heading_texts.get(year, [])
    this_hit = find_year_heading(this_patterns, start_range, end_range)

    # Caso especial: año 4° sin heading explícito en MAT Segundo Ciclo
    if this_hit is None and year == 4 and area_name in segundo_ciclo_implicit_start:
        implicit = segundo_ciclo_implicit_start[area_name]
        this_hit = {
            "digital_page": implicit,
            "pattern": "segundo_ciclo_implicit",
            "size": 0,
            "text": "(inicio implícito Segundo Ciclo)",
        }

    # Detectar heading del año siguiente para fijar el fin del año actual
    next_patterns = year_heading_texts.get(year + 1, []) if year < 6 else []
    search_from = (this_hit["digital_page"] + 1) if this_hit else start_range
    next_hit = find_year_heading(next_patterns, search_from, end_range) if next_patterns else None

    hits = [this_hit] if this_hit else []
    end_hits = [next_hit] if next_hit else []

    return {
        "area": area_name,
        "year": year,
        "search_range": [start_range, end_range],
        "hits": hits,
        "end_hits": end_hits,
        "start_digital": this_hit["digital_page"] if this_hit else None,
        "end_digital": (next_hit["digital_page"] - 1) if next_hit else end_range,
    }


# ---------------------------------------------------------------------------
# Extracción de bloques de Matemática 4° año
# ---------------------------------------------------------------------------

def find_block_starts(doc: fitz.Document, start_page: int, end_page: int) -> list[dict]:
    """
    Detecta páginas donde comienza un nuevo bloque.
    Busca líneas que empiecen con "BLOQUE:" o texto en MAYÚSCULAS con buen tamaño.
    """
    blocks = []
    block_re = re.compile(r'BLOQUE\s*:\s*(.+)', re.IGNORECASE)

    for digital_page in range(start_page, end_page + 1):
        page = doc[digital_page - 1]
        page_dict = page.get_text("dict", sort=True)
        for block in page_dict.get("blocks", []):
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    text = span.get("text", "").strip()
                    m = block_re.match(text)
                    if m:
                        blocks.append({
                            "digital_page": digital_page,
                            "printed_page": digital_page - 1,
                            "text": text,
                            "block_name": m.group(1).strip(),
                            "y0": span.get("bbox", (0,0,0,0))[1],
                        })
    return blocks


def extract_pilot(doc: fitz.Document, start_page: int, end_page: int) -> dict:
    """
    Extracción piloto de Matemática 4° año.
    Devuelve dict con elementos, relaciones, tablas raw, calidad.
    """
    id_gen = IDGenerator()
    reconstructor = None
    adapter = TricolumnAdapter(id_gen)

    all_elements = []
    all_relations = []
    raw_tables = []
    ambiguities = []
    pages_processed = []
    text_discarded = []

    # --- Detectar bloques ---
    block_starts = find_block_starts(doc, start_page, end_page)
    print(f"  Bloques detectados: {len(block_starts)}")
    for b in block_starts:
        print(f"    d{b['digital_page']} (p{b['printed_page']}): {b['block_name'][:60]}")

    # --- Extraer contenido página a página ---
    # Para cada bloque, recolectar sus páginas y reconstruir la tabla

    # Si no se detectaron bloques formales, tratar el rango completo como un bloque
    if not block_starts:
        block_starts = [{
            "digital_page": start_page,
            "printed_page": start_page - 1,
            "text": "BLOQUE: (sin heading detectado)",
            "block_name": "(sin heading)",
            "y0": 0,
        }]
        ambiguities.append(f"No se detectaron headings BLOQUE: en rango d{start_page}-d{end_page}.")

    # Recolectar spans por bloque
    # Estrategia: de cada bloque hasta el siguiente (o hasta el final del rango)
    for block_idx, block_info in enumerate(block_starts):
        blk_start = block_info["digital_page"]
        if block_idx + 1 < len(block_starts):
            blk_end = block_starts[block_idx + 1]["digital_page"] - 1
        else:
            blk_end = end_page

        print(f"  Procesando bloque: '{block_info['block_name'][:40]}' (d{blk_start}–d{blk_end})")

        # Recolectar spans de todas las páginas del bloque
        spans_by_page: dict[int, list] = {}
        page_width = 595.3  # default A4

        for digital_page in range(blk_start, blk_end + 1):
            page = doc[digital_page - 1]
            content = extract_page_content(page, digital_page, filter_headers=True)
            page_width = content["page_width"]
            spans_by_page[digital_page] = content["spans"]
            pages_processed.append(digital_page)

        if not any(spans_by_page.values()):
            ambiguities.append(f"Bloque '{block_info['block_name']}': sin spans.")
            continue

        # Detectar si tiene tabla tricolumna (buscar header con "Conceptos")
        all_spans_flat = [s for sp in spans_by_page.values() for s in sp]
        has_tricolumn = any(
            "Conceptos" in s.text or "Modos de conocer" in s.text
            for s in all_spans_flat
        )

        if has_tricolumn:
            reconstructor = TricolumnReconstructor(page_width=page_width)

            # Encontrar el Y del encabezado de tabla en la primera página del bloque
            first_page_spans = spans_by_page.get(blk_start, [])
            header_y = 0.0
            for span in first_page_spans:
                if "Conceptos" in span.text or "Modos de conocer" in span.text:
                    header_y = span.y1
                    break

            raw_table = reconstructor.reconstruct(
                spans_by_page=spans_by_page,
                area="Matemática",
                ciclo="Segundo Ciclo",
                year=4,
                block_name=block_info["block_name"],
                block_number=block_idx + 1,
                header_y_cutoff=header_y,
            )
            raw_tables.append(raw_table)
            ambiguities.extend(raw_table.ambiguities)

            elements, relations = adapter.adapt(raw_table)
            all_elements.extend(elements)
            all_relations.extend(relations)
        else:
            # Buscar situaciones de enseñanza (texto narrativo post-tabla)
            # También objetivos del año
            full_text_parts = []
            for digital_page in range(blk_start, blk_end + 1):
                page = doc[digital_page - 1]
                text = page.get_text()
                full_text_parts.append((digital_page, text))

            # Si contiene "Objetivos del año" o "Propósitos"
            for dp, text in full_text_parts:
                if "Objetivos" in text or "Propósitos" in text:
                    # Extraer como YEAR_OBJECTIVE
                    obj_items = _extract_objective_items(text)
                    for item in obj_items:
                        stable_id = id_gen.generate(
                            "Matemática", "Segundo Ciclo", 4,
                            block_idx + 1, "YEAR_OBJECTIVE"
                        )
                        from adapters.tricolumn import ExtractedElement
                        elem = ExtractedElement(
                            stable_id=stable_id,
                            element_type="YEAR_OBJECTIVE",
                            area="Matemática",
                            ciclo="Segundo Ciclo",
                            year=4,
                            year_scope="YEAR",
                            block_name=block_info["block_name"],
                            block_number=block_idx + 1,
                            original_text=item,
                            normalized_text=item,
                            digital_page=dp,
                            printed_page=dp - 1,
                            table_name="",
                            row_index=0,
                            column_index=-1,
                            column_name="Objetivos del año",
                        )
                        all_elements.append(elem)
                elif "Situaciones de enseñanza" in text or "Proponer situaciones" in text:
                    text_discarded.append({
                        "digital_page": dp,
                        "reason": "Situaciones de enseñanza — texto narrativo, no tabla tricolumna",
                        "preview": text[:150].replace("\n", " "),
                    })

    return {
        "pages_processed": sorted(set(pages_processed)),
        "block_starts": block_starts,
        "raw_tables": raw_tables,
        "elements": all_elements,
        "relations": all_relations,
        "ambiguities": ambiguities,
        "text_discarded": text_discarded,
    }


def _extract_objective_items(text: str) -> list[str]:
    """Extrae ítems de objetivos del año del texto narrativo."""
    items = []
    # Buscar líneas con viñetas o guiones después de "Objetivos"
    in_section = False
    for line in text.split("\n"):
        line = line.strip()
        if "Objetivos" in line or "Propósito" in line:
            in_section = True
            continue
        if in_section:
            # Terminar si encontramos otra sección
            if re.match(r'^[A-ZÁÉÍÓÚÜÑ]{4,}', line) and "objetivo" not in line.lower():
                break
            # Líneas con viñeta o guión
            if re.match(r'^[·•\-–]\s+', line) or (len(line) > 10 and line[0].islower()):
                cleaned = re.sub(r'^[·•\-–\s]+', '', line).strip()
                if cleaned and len(cleaned) > 5:
                    items.append(cleaned)
    return items[:10]  # max 10 objetivos por año


# ---------------------------------------------------------------------------
# Verificación GC-007: ciclo hidrológico
# ---------------------------------------------------------------------------

def verify_gc007(doc: fitz.Document) -> dict:
    """
    Busca el año específico del ciclo hidrológico en CS Naturales Segundo Ciclo.
    Rango d260–d290. Detecta headings de año por span con size >= 14pt para
    evitar falsos positivos desde índices o tablas de contenido.

    Verificado en Etapa 02.3.1:
      - d272: "QUINTO AÑO" size=16 → inicio 5°
      - d279: ciclo hidrológico
      - d282: "SEXTO AÑO" size=16
    """
    target_term = "ciclo hidrol"
    # Textos de heading de año (minúsculas) detectados por span con size >= MIN_SIZE
    year_heading_texts = {
        "cuarto año": 4,
        "quinto año": 5,
        "sexto año": 6,
    }
    MIN_HEADING_SIZE = 14.0

    hits = []
    year_headings_seen = {}   # {year: digital_page} — solo headings con size >= 14pt

    for digital_page in range(260, 291):
        page = doc[digital_page - 1]

        # Detectar headings de año a nivel de span (con filtro de tamaño)
        for blk in page.get_text("dict", sort=True).get("blocks", []):
            if blk.get("type") != 0:
                continue
            for ln in blk.get("lines", []):
                for sp in ln.get("spans", []):
                    # Normalizar whitespace ("QUINTO  AÑO" tiene 2 espacios en este PDF)
                    t = " ".join(sp.get("text", "").strip().lower().split())
                    sz = sp.get("size", 0)
                    if sz >= MIN_HEADING_SIZE:
                        for pat, yr in year_heading_texts.items():
                            if t == pat or t.startswith(pat):
                                # Sobrescribir con la aparición más reciente (evita ToC d261)
                                year_headings_seen[yr] = digital_page

        # Buscar el término de ciclo hidrológico en el texto completo de la página
        text = page.get_text()
        if target_term.lower() in text.lower():
            # Año: heading con size >= 14pt más reciente visto antes de esta página
            current_year = None
            for yr, pg in sorted(year_headings_seen.items(), key=lambda x: x[1], reverse=True):
                if pg <= digital_page:
                    current_year = yr
                    break

            idx = text.lower().find(target_term.lower())
            context = text[max(0, idx - 100):idx + 200].strip()

            hits.append({
                "digital_page": digital_page,
                "printed_page": digital_page - 1,
                "determined_year": current_year,
                "context": context.replace("\n", " "),
            })

    return {
        "term_searched": target_term,
        "range_scanned": [260, 290],
        "year_headings_found": year_headings_seen,
        "hits": hits,
        "conclusion": _gc007_conclusion(hits, year_headings_seen),
    }


def _gc007_conclusion(hits: list, year_headings: dict) -> str:
    if not hits:
        return "Término no encontrado en rango d260-d290. Ampliar búsqueda."
    years = {h["determined_year"] for h in hits}
    if None in years:
        years.discard(None)
        if not years:
            return f"Término encontrado en d{hits[0]['digital_page']} pero sin heading de año previo identificado. Alcance: Segundo Ciclo general."
    if len(years) == 1:
        y = list(years)[0]
        return f"Término encontrado en d{hits[0]['digital_page']}. Año determinado: {y}°."
    return f"Término encontrado en múltiples contextos. Años: {sorted(years)}. Revisar manualmente."


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Extractor piloto curricular DC PBA 2018")
    parser.add_argument("--area", default="MAT", help="Código de área (MAT, CSS, etc.)")
    parser.add_argument("--year", type=int, default=4, help="Año escolar (1-6)")
    parser.add_argument("--scan-bounds", action="store_true", help="Solo detectar bounds, no extraer")
    parser.add_argument("--verify-gc007", action="store_true", help="Verificar ciclo hidrológico")
    parser.add_argument("--output", type=str, default="", help="Directorio de salida")
    args = parser.parse_args()

    output_dir = Path(args.output) if args.output else OUTPUT_DIR
    output_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print(f"Extractor Curricular DC PBA 2018 v{EXTRACTOR_VERSION}")
    print("=" * 60)

    # 1. Verificar fuente
    print("\n[1/5] Verificando fuente documental...")
    try:
        verification = verify_source()
        print(f"  SHA-256: OK ({verification['sha256'][:16]}...)")
        print(f"  Tamaño: {verification['size_bytes']:,} bytes")
    except Exception as e:
        print(f"  ERROR: {e}")
        sys.exit(1)

    # 2. Abrir documento
    print("[2/5] Abriendo PDF...")
    doc = open_document(skip_verify=True)  # ya verificado
    print(f"  Páginas: {doc.page_count}")

    # 3. Scan de bounds
    print(f"[3/5] Detectando rango real de {args.area} {args.year}°...")
    bounds = scan_bounds(doc, args.area, args.year)
    start_page = bounds.get("start_digital") or 135
    end_page = bounds.get("end_digital") or 146
    print(f"  Rango detectado: d{start_page}–d{end_page} (impresas p{start_page-1}–p{end_page-1})")

    if args.scan_bounds:
        print(json.dumps(bounds, indent=2, ensure_ascii=False))
        return

    # 4. Verificar GC-007 si se solicita
    gc007_result = None
    if args.verify_gc007:
        print("\n[GC-007] Verificando ciclo hidrológico en CS Naturales...")
        gc007_result = verify_gc007(doc)
        print(f"  Conclusión: {gc007_result['conclusion']}")
        gc007_path = output_dir / "gc007_verification.json"
        with open(gc007_path, "w", encoding="utf-8") as f:
            json.dump(gc007_result, f, ensure_ascii=False, indent=2)
        print(f"  Guardado: {gc007_path}")

    # 5. Extracción piloto
    print(f"\n[4/5] Extracción piloto: {args.area} {args.year}° (d{start_page}–d{end_page})...")
    pilot = extract_pilot(doc, start_page, end_page)

    elements = pilot["elements"]
    relations = pilot["relations"]

    print(f"  Páginas procesadas: {len(pilot['pages_processed'])}")
    print(f"  Tablas raw: {len(pilot['raw_tables'])}")
    print(f"  Elementos: {len(elements)}")
    print(f"  Relaciones: {len(relations)}")
    print(f"  Ambigüedades: {len(pilot['ambiguities'])}")

    # 6. Validar
    print("\n[5/5] Validando...")
    validation = validate_all(elements, relations)
    print(f"  Válido: {validation['valid']}")
    print(f"  Errores: {validation['error_count']}")
    print(f"  Warnings: {validation['warning_count']}")
    if validation["errors"]:
        for e in validation["errors"][:5]:
            print(f"    ERROR: {e}")
    if validation["warnings"]:
        for w in validation["warnings"][:5]:
            print(f"    WARN: {w}")

    # 7. Exportar
    metadata = {
        "sha256": verification["sha256"],
        "area": args.area,
        "year": args.year,
        "pages_scanned": bounds,
        "pages_processed": pilot["pages_processed"],
        "block_starts": [
            {"digital_page": b["digital_page"], "block_name": b["block_name"]}
            for b in pilot["block_starts"]
        ],
        "ambiguities": pilot["ambiguities"],
        "text_discarded": pilot["text_discarded"],
    }

    output_path = output_dir / f"pilot_{args.area}_{args.year}.json"
    export_to_json(elements, relations, metadata, output_path, validation)
    print(f"\nSalida: {output_path}")

    # Resumen de tipos
    from exporter import _count_by_type, _count_relations_by_type
    print("\nElementos por tipo:")
    for t, c in _count_by_type(elements).items():
        print(f"  {t}: {c}")
    print("Relaciones por tipo:")
    for t, c in _count_relations_by_type(relations).items():
        print(f"  {t}: {c}")

    print("\nDone.")
    return output_path, elements, relations, validation, gc007_result


if __name__ == "__main__":
    main()
