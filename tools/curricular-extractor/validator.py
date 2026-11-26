"""
validator.py — Validaciones de integridad sobre los elementos y relaciones extraídos.
Implementa las reglas de VALIDATION_RULES.md.
"""

from dataclasses import dataclass, field
from typing import Optional
from adapters.tricolumn import ExtractedElement, ExtractedRelation


@dataclass
class ValidationResult:
    valid: bool
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def add_error(self, msg: str) -> None:
        self.errors.append(msg)
        self.valid = False

    def add_warning(self, msg: str) -> None:
        self.warnings.append(msg)


MAX_DIGITAL_PAGE = 433


def validate_element(elem: ExtractedElement) -> ValidationResult:
    """
    Valida un elemento individual.
    Implementa V-DB-02, V-DB-05, V-DB-06 y otras reglas del modelo.
    """
    result = ValidationResult(valid=True)

    # V-DB-02: página dentro del rango
    if not (1 <= elem.digital_page <= MAX_DIGITAL_PAGE):
        result.add_error(
            f"[{elem.stable_id}] digital_page={elem.digital_page} fuera de rango [1, {MAX_DIGITAL_PAGE}]."
        )

    # Regla de paginación DC PBA 2018
    if elem.printed_page != elem.digital_page - 1:
        result.add_error(
            f"[{elem.stable_id}] printed_page={elem.printed_page} != digital_page-1={elem.digital_page-1}."
        )

    # original_text obligatorio
    if not elem.original_text.strip():
        result.add_error(f"[{elem.stable_id}] original_text vacío.")

    # normalized_text obligatorio
    if not elem.normalized_text.strip():
        result.add_warning(f"[{elem.stable_id}] normalized_text vacío.")

    # review_status válido
    valid_statuses = {"extracted", "pending", "ambiguous", "validated", "rejected", "replaced"}
    if elem.review_status not in valid_statuses:
        result.add_error(f"[{elem.stable_id}] review_status='{elem.review_status}' inválido.")

    # ambiguous requiere notes
    if elem.review_status == "ambiguous" and not elem.notes.strip():
        result.add_error(f"[{elem.stable_id}] review_status=ambiguous pero notes vacío.")

    # column_index válido (-1=objetivos/no-tabla, 0-3=columnas de tabla)
    if elem.column_index not in (-1, 0, 1, 2, 3):
        result.add_warning(f"[{elem.stable_id}] column_index={elem.column_index} inusual.")

    # element_type válido
    valid_types = {
        "CONCEPT", "CONTENT", "WAY_OF_KNOWING", "PROGRESS_INDICATOR",
        "TEACHING_SITUATION", "YEAR_OBJECTIVE", "AREA_PURPOSE", "CYCLE_PURPOSE",
        "DIDACTIC_GUIDANCE", "EVAL_GUIDANCE", "TRANSVERSAL",
    }
    if elem.element_type not in valid_types:
        result.add_error(f"[{elem.stable_id}] element_type='{elem.element_type}' inválido.")

    return result


def validate_relation(rel: ExtractedRelation, all_ids: set[str]) -> ValidationResult:
    """
    Valida una relación entre elementos.
    Implementa V-DB-07, V-DB-08.
    """
    result = ValidationResult(valid=True)

    # No auto-relación
    if rel.source_stable_id == rel.target_stable_id:
        result.add_error(
            f"Auto-relación detectada: {rel.source_stable_id} → {rel.target_stable_id}."
        )

    # Ambos extremos deben existir
    if rel.source_stable_id not in all_ids:
        result.add_error(
            f"source_stable_id '{rel.source_stable_id}' no existe en el conjunto de elementos."
        )
    if rel.target_stable_id not in all_ids:
        result.add_error(
            f"target_stable_id '{rel.target_stable_id}' no existe en el conjunto de elementos."
        )

    # PEDAGOGICALLY_INFERRED requiere notes
    if rel.relation_basis == "PEDAGOGICALLY_INFERRED" and not rel.notes.strip():
        result.add_error(
            f"Relación {rel.source_stable_id}→{rel.target_stable_id}: "
            "PEDAGOGICALLY_INFERRED requiere notes."
        )

    # relation_basis válido
    valid_bases = {"SOURCE_EXPRESSED", "PEDAGOGICALLY_INFERRED", "TERMINOLOGICAL"}
    if rel.relation_basis not in valid_bases:
        result.add_error(f"relation_basis='{rel.relation_basis}' inválido.")

    return result


def validate_no_duplicates(elements: list[ExtractedElement]) -> ValidationResult:
    """
    V-DB-09: Verifica que no existan stable_ids duplicados.
    """
    result = ValidationResult(valid=True)
    seen: dict[str, int] = {}
    for elem in elements:
        seen[elem.stable_id] = seen.get(elem.stable_id, 0) + 1
    for sid, count in seen.items():
        if count > 1:
            result.add_error(f"stable_id duplicado: '{sid}' aparece {count} veces.")
    return result


def validate_all(
    elements: list[ExtractedElement],
    relations: list[ExtractedRelation],
) -> dict:
    """
    Validación completa de un conjunto de elementos y relaciones.
    Devuelve dict con summary y todos los errores/warnings.
    """
    all_ids = {e.stable_id for e in elements}
    all_errors = []
    all_warnings = []

    for elem in elements:
        r = validate_element(elem)
        all_errors.extend(r.errors)
        all_warnings.extend(r.warnings)

    for rel in relations:
        r = validate_relation(rel, all_ids)
        all_errors.extend(r.errors)
        all_warnings.extend(r.warnings)

    dup_result = validate_no_duplicates(elements)
    all_errors.extend(dup_result.errors)

    return {
        "valid": len(all_errors) == 0,
        "elements_checked": len(elements),
        "relations_checked": len(relations),
        "error_count": len(all_errors),
        "warning_count": len(all_warnings),
        "errors": all_errors,
        "warnings": all_warnings,
    }
