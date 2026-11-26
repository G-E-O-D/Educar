"""
exporter.py — Serialización de elementos y relaciones a JSON.
Compatible con el modelo de datos de Etapa 02.2.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from adapters.tricolumn import ExtractedElement, ExtractedRelation
from config import EXTRACTOR_VERSION


def element_to_dict(elem: ExtractedElement) -> dict:
    return {
        "stable_id": elem.stable_id,
        "element_type": elem.element_type,
        "area": elem.area,
        "ciclo": elem.ciclo,
        "year": elem.year,
        "year_scope": elem.year_scope,
        "block_name": elem.block_name,
        "block_number": elem.block_number,
        "original_text": elem.original_text,
        "normalized_text": elem.normalized_text,
        "extraction_method": elem.extraction_method,
        "review_status": elem.review_status,
        "source_ref": {
            "source_id": "DC-PBA-PRIMARY-2018",
            "digital_page": elem.digital_page,
            "printed_page": elem.printed_page,
            "table_name": elem.table_name,
            "row_index": elem.row_index,
            "column_index": elem.column_index,
            "column_name": elem.column_name,
            "bbox": list(elem.bbox) if elem.bbox else None,
            "span_text": elem.span_text,
        },
        "notes": elem.notes,
    }


def relation_to_dict(rel: ExtractedRelation) -> dict:
    return {
        "source_stable_id": rel.source_stable_id,
        "target_stable_id": rel.target_stable_id,
        "relation_type": rel.relation_type,
        "relation_basis": rel.relation_basis,
        "source_ref": {
            "source_id": "DC-PBA-PRIMARY-2018",
            "digital_page": rel.digital_page,
            "row_index": rel.row_index,
        },
        "notes": rel.notes,
    }


def export_to_json(
    elements: list[ExtractedElement],
    relations: list[ExtractedRelation],
    metadata: dict,
    output_path: Path,
    validation_result: Optional[dict] = None,
) -> None:
    """
    Exporta el resultado de la extracción a JSON estructurado.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)

    payload = {
        "schema_version": "1.0",
        "extractor_version": EXTRACTOR_VERSION,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_id": "DC-PBA-PRIMARY-2018",
        "source_sha256": metadata.get("sha256", ""),
        "extraction_metadata": metadata,
        "validation": validation_result or {},
        "counts": {
            "elements": len(elements),
            "relations": len(relations),
            "by_type": _count_by_type(elements),
            "relations_by_type": _count_relations_by_type(relations),
        },
        "elements": [element_to_dict(e) for e in elements],
        "relations": [relation_to_dict(r) for r in relations],
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)


def _count_by_type(elements: list[ExtractedElement]) -> dict:
    counts: dict[str, int] = {}
    for e in elements:
        counts[e.element_type] = counts.get(e.element_type, 0) + 1
    return dict(sorted(counts.items()))


def _count_relations_by_type(relations: list[ExtractedRelation]) -> dict:
    counts: dict[str, int] = {}
    for r in relations:
        counts[r.relation_type] = counts.get(r.relation_type, 0) + 1
    return dict(sorted(counts.items()))
