"""
extract_all.py — Extracción completa para un área curricular.
Soporta MAT (3°-6° con adaptador existente, 1°/2° con PC12Extractor) y CSS.

Uso:
  python extract_all.py --area MAT
  python extract_all.py --area CSS
  python extract_all.py --area MAT --verify-teach6
"""

import sys
import json
import argparse
import re
from pathlib import Path
from typing import Optional

sys.path.insert(0, str(Path(__file__).parent))

import fitz

from config import (
    PDF_PATH, OUTPUT_DIR, EXTRACTOR_VERSION,
    RUNNING_HEADERS, TRICOLUMN_THRESHOLDS,
)
from reader import verify_source, open_document
from page_extractor import extract_page_content, classify_column, filter_running_headers, extract_spans
from table_reconstructor import TricolumnReconstructor
from adapters.tricolumn import TricolumnAdapter, ExtractedElement, ExtractedRelation
from adapters.css import CSSAdapter, css_split_items
from adapters.pc12 import PC12Extractor, find_year_markers, split_spans_by_year
from id_generator import IDGenerator
from validator import validate_all
from exporter import export_to_json


# ---------------------------------------------------------------------------
# Configuración por área
# ---------------------------------------------------------------------------

AREA_CONFIG = {
    "MAT": {
        "area_name": "Matemática",
        "ciclos": {
            "Primer Ciclo": {
                "range": (98, 134),
                "years_pc12": [1, 2],     # EI-09: extractados con PC12Extractor
                "years_standard": [3],
                "pc12_range": (102, 120),
                "y3_range": (121, 134),
                "y3_heading_start": 121,  # d121 no tiene heading explícito para 3°
            },
            "Segundo Ciclo": {
                "range": (135, 173),
                "years_standard": [4, 5, 6],
                "y4_implicit_start": 135,  # sin heading explícito
            },
        },
        "bibliography_start": 174,
    },
    "CSS": {
        "area_name": "Ciencias Sociales",
        "ciclos": {
            "Primer Ciclo": {
                "range": (180, 200),
                "years_standard": [1, 2, 3],
            },
            "Segundo Ciclo": {
                "range": (201, 232),   # d233+ = bibliografía CSS
                "years_standard": [4, 5, 6],
            },
        },
        "bibliography_start": 233,   # d233: "Bibliografía General Disciplinar – Segundo Ciclo"
    },
}

MIN_HEADING_SIZE = 14.0

YEAR_HEADING_TEXTS = {
    1: ["primer año"],
    2: ["segundo año"],
    3: ["tercer año"],
    4: ["cuarto año"],
    5: ["quinto año"],
    6: ["sexto año"],
}


# ---------------------------------------------------------------------------
# Detección de bounds por año
# ---------------------------------------------------------------------------

def find_year_start(doc: fitz.Document, year: int, page_start: int, page_end: int) -> Optional[int]:
    """Detecta la primera página digital con el heading de año (sz >= 14pt)."""
    patterns = YEAR_HEADING_TEXTS.get(year, [])
    for d in range(page_start, page_end + 1):
        page = doc[d - 1]
        for blk in page.get_text("dict", sort=True).get("blocks", []):
            if blk.get("type") != 0:
                continue
            for ln in blk.get("lines", []):
                for sp in ln.get("spans", []):
                    t = " ".join(sp.get("text", "").strip().lower().split())
                    sz = sp.get("size", 0)
                    if sz >= MIN_HEADING_SIZE:
                        for pat in patterns:
                            if t == pat or t.startswith(pat):
                                return d
    return None


def detect_year_bounds(doc: fitz.Document, area: str) -> dict:
    """
    Detecta los límites reales de cada año para el área dada.
    Retorna dict {year: (start_digital, end_digital)}.
    """
    cfg = AREA_CONFIG[area]
    bounds = {}

    # Recopilar todos los headings de año en el rango del área
    all_starts = {}  # {year: digital_page}

    for ciclo_name, ciclo_cfg in cfg["ciclos"].items():
        r_start, r_end = ciclo_cfg["range"]
        for year in ciclo_cfg.get("years_standard", []) + ciclo_cfg.get("years_pc12", []):
            d = find_year_start(doc, year, r_start, r_end)
            if d:
                all_starts[year] = d

    # Caso especial MAT 4° sin heading
    if area == "MAT" and 4 not in all_starts:
        all_starts[4] = AREA_CONFIG["MAT"]["ciclos"]["Segundo Ciclo"]["y4_implicit_start"]

    # MAT 3° sin heading (d121 es inicio implícito)
    if area == "MAT" and 3 not in all_starts:
        all_starts[3] = AREA_CONFIG["MAT"]["ciclos"]["Primer Ciclo"]["y3_heading_start"]

    # Calcular end para cada año
    sorted_years = sorted(all_starts.items(), key=lambda x: x[1])
    for i, (year, start) in enumerate(sorted_years):
        if i + 1 < len(sorted_years):
            end = sorted_years[i + 1][1] - 1
        else:
            # Último año: fin del área
            if area == "MAT":
                end = AREA_CONFIG["MAT"]["bibliography_start"] - 1
            elif area == "CSS":
                end = AREA_CONFIG["CSS"].get("bibliography_start", 236) - 1
            else:
                end = start + 20

        bounds[year] = (start, end)

    return bounds


# ---------------------------------------------------------------------------
# Detección de bloques
# ---------------------------------------------------------------------------

def find_block_starts(doc: fitz.Document, start_page: int, end_page: int) -> list[dict]:
    """Detecta páginas donde empieza un bloque (patrón BLOQUE: o texto en MAYÚSCULAS)."""
    blocks = []
    block_re = re.compile(r'^BLOQUE\s*[:\-]?\s*(.+)', re.IGNORECASE)

    for digital_page in range(start_page, end_page + 1):
        page = doc[digital_page - 1]
        for block in page.get_text("dict", sort=True).get("blocks", []):
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
                            "y0": span.get("bbox", (0, 0, 0, 0))[1],
                        })
    return blocks


# ---------------------------------------------------------------------------
# Extracción estándar (TricolumnAdapter) — años 3°-6° MAT y todos CSS
# ---------------------------------------------------------------------------

def extract_standard_year(
    doc: fitz.Document,
    start_page: int,
    end_page: int,
    area_name: str,
    ciclo_name: str,
    year: int,
    id_gen: IDGenerator,
    page_width: float = 841.9,
    area_code: str = "MAT",   # "MAT" or "CSS" — determines adapter and header detection
) -> dict:
    """
    Extrae un año completo usando TricolumnAdapter.
    Estrategia: detectar bloques, reconstruir tabla tricolumna por bloque.

    CSS column layouts:
      1 y 2: col0=Conceptos, col2=Modos de conocer, col3=Indicadores -> CSSAdapter
      3+:    col0=Conceptos, col1=Modos de conocer, col2=Indicadores -> TricolumnAdapter
    """
    reconstructor = TricolumnReconstructor(page_width=page_width)
    if area_code == "CSS" and year <= 2:
        adapter: TricolumnAdapter | CSSAdapter = CSSAdapter(id_gen)
    elif area_code == "CSS":
        # CSS 3+: layout igual a MAT (col1=Modos, col2=Indicadores) pero sin PUA bullets
        adapter = TricolumnAdapter(id_gen, cell_items_fn=css_split_items)
    else:
        adapter = TricolumnAdapter(id_gen)

    all_elements = []
    all_relations = []
    raw_tables = []
    ambiguities = []
    pages_processed = []

    block_starts = find_block_starts(doc, start_page, end_page)
    print(f"    Bloques detectados: {len(block_starts)}")
    for b in block_starts:
        print(f"      d{b['digital_page']}: {b['block_name'][:55]}")

    if not block_starts:
        block_starts = [{
            "digital_page": start_page,
            "printed_page": start_page - 1,
            "text": "BLOQUE: (sin heading)",
            "block_name": "(sin heading)",
            "y0": 0,
        }]
        ambiguities.append(f"Sin bloques detectados en d{start_page}-d{end_page}.")

    for block_idx, block_info in enumerate(block_starts):
        blk_start = block_info["digital_page"]
        blk_end = (
            block_starts[block_idx + 1]["digital_page"] - 1
            if block_idx + 1 < len(block_starts) else end_page
        )

        # EI-05: blk_end < blk_start
        if blk_end < blk_start:
            ambiguities.append(
                f"EI-05: bloque '{block_info['block_name']}' d{blk_start}: "
                f"blk_end={blk_end} < blk_start={blk_start}. Usando blk_end={blk_start}."
            )
            blk_end = blk_start

        spans_by_page: dict[int, list] = {}
        for digital_page in range(blk_start, blk_end + 1):
            page = doc[digital_page - 1]
            content = extract_page_content(page, digital_page, filter_headers=True)
            spans_by_page[digital_page] = content["spans"]
            pages_processed.append(digital_page)

        # CSS: las cabeceras de columna se repiten en cada página de continuación.
        # Filtrar SOLO en páginas 2+ del bloque (no en la primera, que necesitamos
        # para calcular header_y_cutoff correctamente).
        _CSS_HDR = frozenset({
            "Conceptos", "Modos de conocer", "CONTENIDOS",
            "Indicadores de avance", "INDICADORES DE AVANCE", "Indicadores",
        })
        if area_code == "CSS":
            for pg_num in spans_by_page:
                if pg_num == blk_start:
                    continue  # conservar primera página para detectar header_y
                spans_by_page[pg_num] = [
                    sp for sp in spans_by_page[pg_num]
                    if not (sp.y0 < 150 and any(h in sp.text for h in _CSS_HDR))
                ]

        # CSS EI-10: páginas de "Situaciones de enseñanza" NO tienen contenido de tabla
        # (col1=0 en 3°+, col2=0 en 1°/2°). Recortar el bloque en la última página
        # que sí tiene contenido de tabla, para evitar que el texto narrativo de
        # Situaciones contamine la extracción de conceptos/modos/indicadores.
        if area_code == "CSS":
            way_col = 1 if year >= 3 else 2
            last_table_page = blk_start
            for pg_num in sorted(spans_by_page.keys()):
                if any(classify_column(sp.x0, page_width) == way_col
                       for sp in spans_by_page.get(pg_num, [])):
                    last_table_page = pg_num
            for pg_num in list(spans_by_page.keys()):
                if pg_num > last_table_page:
                    del spans_by_page[pg_num]

        all_spans_flat = [s for sp in spans_by_page.values() for s in sp]
        has_tricolumn = any(
            "Conceptos" in s.text or "Modos de conocer" in s.text or "CONTENIDOS" in s.text
            for s in all_spans_flat
        )
        if not has_tricolumn:
            continue  # skip non-table blocks (orientaciones, etc.)

        # Header Y cutoff.
        # MAT: primer match (break) para evitar capturar "Modos de conocer" en contenido.
        # CSS: zona dinámica relativa al BLOQUE header (block_y0 + 160pt cubre
        #      los 3 niveles de cabecera: BLOQUE + CONTENIDOS + Conceptos/Modos).
        #      Para bloques que empiezan a mitad de página (block_y0 > 50), asegurar
        #      que header_y >= block_y0 para excluir contenido de la tabla anterior.
        first_page_spans = spans_by_page.get(blk_start, [])
        header_y = 0.0
        HEADER_KEYWORDS = ("Conceptos", "Modos de conocer", "CONTENIDOS", "Indicadores", "INDICADORES")
        if area_code == "CSS":
            block_y0_on_page = block_info.get("y0", 0.0)
            css_hdr_zone = block_y0_on_page + 160.0  # cubre las 3 filas de cabecera
            for span in first_page_spans:
                if span.y0 < css_hdr_zone and any(kw in span.text for kw in HEADER_KEYWORDS):
                    header_y = max(header_y, span.y1)
            # Para bloques mid-page, el contenido anterior al BLOQUE header no nos pertenece
            header_y = max(header_y, block_y0_on_page)
        else:
            for span in first_page_spans:
                if any(kw in span.text for kw in ("Conceptos", "Modos de conocer")):
                    header_y = span.y1
                    break

        raw_table = reconstructor.reconstruct(
            spans_by_page=spans_by_page,
            area=area_name,
            ciclo=ciclo_name,
            year=year,
            block_name=block_info["block_name"],
            block_number=block_idx + 1,
            header_y_cutoff=header_y,
        )
        raw_tables.append(raw_table)
        ambiguities.extend(raw_table.ambiguities)

        elements, relations = adapter.adapt(raw_table)
        all_elements.extend(elements)
        all_relations.extend(relations)

    return {
        "year": year,
        "pages": (start_page, end_page),
        "pages_processed": sorted(set(pages_processed)),
        "block_starts": block_starts,
        "raw_tables": raw_tables,
        "elements": all_elements,
        "relations": all_relations,
        "ambiguities": ambiguities,
    }


# ---------------------------------------------------------------------------
# Extracción PC1 1°/2° (EI-09)
# ---------------------------------------------------------------------------

def extract_pc12(
    doc: fitz.Document,
    start_page: int,
    end_page: int,
    area_name: str,
    id_gen: IDGenerator,
    page_width: float = 841.9,
) -> dict:
    """
    Extrae Primer Ciclo 1° y 2° usando PC12Extractor.
    Detecta bloques y procesa cada uno con el adaptador especializado.
    """
    extractor = PC12Extractor(id_gen, page_width=page_width)

    all_elements = []
    all_relations = []
    ambiguities = []
    pages_processed = []
    year_counts = {1: 0, 2: 0, None: 0}

    block_starts = find_block_starts(doc, start_page, end_page)
    print(f"    Bloques PC12 detectados: {len(block_starts)}")
    for b in block_starts:
        print(f"      d{b['digital_page']}: {b['block_name'][:55]}")

    if not block_starts:
        block_starts = [{
            "digital_page": start_page,
            "printed_page": start_page - 1,
            "text": "BLOQUE: (sin heading)",
            "block_name": "(sin heading)",
            "y0": 0,
        }]
        ambiguities.append(f"PC12: sin bloques detectados en d{start_page}-d{end_page}.")

    for block_idx, block_info in enumerate(block_starts):
        blk_start = block_info["digital_page"]
        blk_end = (
            block_starts[block_idx + 1]["digital_page"] - 1
            if block_idx + 1 < len(block_starts) else end_page
        )
        if blk_end < blk_start:
            ambiguities.append(
                f"EI-05 PC12: bloque '{block_info['block_name']}' d{blk_start}: "
                f"blk_end={blk_end} < blk_start={blk_start}. Usando blk_end={blk_start}."
            )
            blk_end = blk_start

        spans_by_page: dict[int, list] = {}
        for digital_page in range(blk_start, blk_end + 1):
            page = doc[digital_page - 1]
            content = extract_page_content(page, digital_page, filter_headers=True)
            spans_by_page[digital_page] = content["spans"]
            pages_processed.append(digital_page)

        elements, relations, block_ambiguities = extractor.extract_block(
            spans_by_page=spans_by_page,
            block_name=block_info["block_name"],
            block_number=block_idx + 1,
            area=area_name,
            ciclo="Primer Ciclo",
        )
        ambiguities.extend(block_ambiguities)

        # Conteo por año para diagnóstico
        for e in elements:
            year_counts[e.year if e.year in (1, 2) else None] += 1

        all_elements.extend(elements)
        all_relations.extend(relations)

    print(f"    PC12: elementos y1={year_counts[1]}, y2={year_counts[2]}, joint={year_counts[None]}")

    return {
        "years": [1, 2],
        "pages": (start_page, end_page),
        "pages_processed": sorted(set(pages_processed)),
        "block_starts": block_starts,
        "elements": all_elements,
        "relations": all_relations,
        "ambiguities": ambiguities,
        "year_counts": year_counts,
    }


# ---------------------------------------------------------------------------
# Verificación situaciones de enseñanza 6° SC
# ---------------------------------------------------------------------------

def verify_teach6(doc: fitz.Document, start: int, end: int, area_name: str) -> dict:
    """
    Verifica las situaciones de enseñanza de 6° inspeccionando los spans de col3.
    Retorna un reporte detallado de items por página.
    """
    from page_extractor import Span
    from table_reconstructor import RawCell

    page_width = 841.9
    report = []
    total_items = 0

    for dp in range(start, end + 1):
        page = doc[dp - 1]
        content = extract_page_content(page, dp, filter_headers=True)
        col3_spans = [
            sp for sp in content["spans"]
            if classify_column(sp.x0, page_width) == 3
            and sp.text.strip()
            and sp.y0 > 90  # excluir cabeceras
        ]

        if not col3_spans:
            continue

        # Usar RawCell para contar items reales
        cell = RawCell(column=3, row_index=0, spans=col3_spans)
        items = cell.items()
        total_items += len(items)

        report.append({
            "digital_page": dp,
            "printed_page": dp - 1,
            "col3_span_count": len(col3_spans),
            "items_count": len(items),
            "items_preview": [it[:80] for it in items],
        })

    return {
        "area": area_name,
        "range": (start, end),
        "total_teach_items": total_items,
        "pages": report,
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--area", default="MAT", choices=["MAT", "CSS"])
    parser.add_argument("--verify-teach6", action="store_true")
    parser.add_argument("--output", default="")
    args = parser.parse_args()

    output_dir = Path(args.output) if args.output else OUTPUT_DIR
    output_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print(f"Extractor Completo DC PBA 2018 v{EXTRACTOR_VERSION}")
    print(f"Área: {args.area}")
    print("=" * 60)

    # Verificar fuente
    print("\n[1] Verificando PDF...")
    try:
        verification = verify_source()
        print(f"  SHA-256: OK ({verification['sha256'][:16]}...)")
    except Exception as e:
        print(f"  ERROR: {e}")
        sys.exit(1)

    doc = open_document(skip_verify=True)
    print(f"  Páginas: {doc.page_count}")

    area_cfg = AREA_CONFIG[args.area]
    area_name = area_cfg["area_name"]

    # Detectar bounds por año
    print(f"\n[2] Detectando bounds de {args.area}...")
    year_bounds = detect_year_bounds(doc, args.area)
    for year, (s, e) in sorted(year_bounds.items()):
        print(f"  {year}°: d{s}-d{e} ({e - s + 1} páginas)")

    id_gen = IDGenerator()
    all_elements = []
    all_relations = []
    all_ambiguities = []
    year_results = {}

    # === MAT ===
    if args.area == "MAT":
        # PC12: 1° y 2° (EI-09)
        pc12_start = area_cfg["ciclos"]["Primer Ciclo"]["pc12_range"][0]
        pc12_end = area_cfg["ciclos"]["Primer Ciclo"]["pc12_range"][1]
        print(f"\n[3a] Extrayendo MAT 1°/2° PC (d{pc12_start}-d{pc12_end}) con PC12Extractor...")
        pc12_result = extract_pc12(doc, pc12_start, pc12_end, area_name, id_gen)
        all_elements.extend(pc12_result["elements"])
        all_relations.extend(pc12_result["relations"])
        all_ambiguities.extend(pc12_result["ambiguities"])
        year_results["1_2"] = pc12_result
        print(f"  PC12 total: {len(pc12_result['elements'])} elementos, {len(pc12_result['relations'])} relaciones")

        # 3° y SC 4°/5°/6°: estándar
        for year in [3, 4, 5, 6]:
            if year not in year_bounds:
                print(f"\n  WARN: año {year}° sin bounds detectados, omitiendo.")
                continue
            start, end = year_bounds[year]
            ciclo = "Primer Ciclo" if year == 3 else "Segundo Ciclo"
            print(f"\n[3{chr(97+year-2)}] Extrayendo MAT {year}° (d{start}-d{end})...")
            result = extract_standard_year(
                doc, start, end, area_name, ciclo, year, id_gen
            )
            all_elements.extend(result["elements"])
            all_relations.extend(result["relations"])
            all_ambiguities.extend(result["ambiguities"])
            year_results[str(year)] = result
            print(f"  {year}°: {len(result['elements'])} elementos, {len(result['relations'])} relaciones")

        # Verificación TEACH 6°
        if args.verify_teach6:
            start6, end6 = year_bounds.get(6, (161, 173))
            print(f"\n[V] Verificando situaciones de enseñanza 6° (d{start6}-d{end6})...")
            teach6 = verify_teach6(doc, start6, end6, area_name)
            print(f"  Total TEACH items (col3 real): {teach6['total_teach_items']}")
            for pg in teach6["pages"]:
                print(f"    d{pg['digital_page']}: {pg['items_count']} items - {pg['items_preview'][:2]}")
            t6_path = output_dir / "verify_teach6.json"
            with open(t6_path, "w", encoding="utf-8") as f:
                json.dump(teach6, f, ensure_ascii=False, indent=2)
            print(f"  Guardado: {t6_path}")

    # === CSS ===
    elif args.area == "CSS":
        for year in [1, 2, 3, 4, 5, 6]:
            if year not in year_bounds:
                print(f"\n  WARN: año {year}° sin bounds, omitiendo.")
                continue
            start, end = year_bounds[year]
            ciclo = "Primer Ciclo" if year <= 3 else "Segundo Ciclo"
            print(f"\n[3{chr(97+year-1)}] Extrayendo CSS {year}° (d{start}-d{end})...")
            result = extract_standard_year(
                doc, start, end, area_name, ciclo, year, id_gen,
                area_code="CSS",
            )
            all_elements.extend(result["elements"])
            all_relations.extend(result["relations"])
            all_ambiguities.extend(result["ambiguities"])
            year_results[str(year)] = result
            print(f"  {year}°: {len(result['elements'])} elementos, {len(result['relations'])} relaciones")

    # Validar
    print(f"\n[4] Validando {len(all_elements)} elementos, {len(all_relations)} relaciones...")
    validation = validate_all(all_elements, all_relations)
    print(f"  Válido: {validation['valid']}  Errores: {validation['error_count']}  Warnings: {validation['warning_count']}")
    if validation["errors"]:
        for e in validation["errors"][:5]:
            print(f"    ERROR: {e}")

    # Exportar
    metadata = {
        "sha256": verification["sha256"],
        "area": args.area,
        "extractor_version": EXTRACTOR_VERSION,
        "year_bounds": {str(k): list(v) for k, v in year_bounds.items()},
        "total_ambiguities": len(all_ambiguities),
        "ambiguities": all_ambiguities[:20],
    }

    output_path = output_dir / f"extract_{args.area}_all.json"
    export_to_json(all_elements, all_relations, metadata, output_path, validation)
    print(f"\nSalida: {output_path}")

    # Resumen por tipo
    from exporter import _count_by_type, _count_relations_by_type
    print("\nElementos por tipo:")
    for t, c in _count_by_type(all_elements).items():
        print(f"  {t}: {c}")
    print("Relaciones por tipo:")
    for t, c in _count_relations_by_type(all_relations).items():
        print(f"  {t}: {c}")

    print("\nResumen por año:")
    for yk, yr in year_results.items():
        elems = len(yr["elements"])
        rels = len(yr["relations"])
        ambigs = len(yr["ambiguities"])
        print(f"  {yk}°: {elems} elementos, {rels} relaciones, {ambigs} ambigüedades")

    print(f"\nTotal: {len(all_elements)} elementos, {len(all_relations)} relaciones")
    print("Done.")


if __name__ == "__main__":
    main()
