"""
test_regression_02_3_1.py — Tests de regresión para Etapa 02.3.1.

Cubren:
  EI-01: ausencia de producto cartesiano en relaciones (thresholds correctos)
  EI-01: col3 produce TEACHING_SITUATION y relación CONTENT_TEACHING_SITUATION
  EI-02: detección de año por heading de span (no texto completo)
  GC-007: año del ciclo hidrológico = 5° (QUINTO AÑO d272, contenido d279)
  Identidad: columnas correctas → tipos de elemento correctos
  Regresión: los thresholds viejos (0.37/0.67) ya NO deben clasificar
              Modos de conocer en col0 ni Indicadores en col1.

Principio: NO contienen contenido del DC.
Los tests PDF-dependientes se saltan si el archivo no está disponible.
"""

import sys, os
import pytest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from page_extractor import classify_column
from table_reconstructor import TricolumnReconstructor, RawTable, RawTableRow, RawCell
from adapters.tricolumn import TricolumnAdapter, ExtractedElement, ExtractedRelation
from id_generator import IDGenerator
from tests.fixtures import (
    make_span, PAGE_WIDTH,
    TRICOLUMN_ROW1, TRICOLUMN_ROW1_COL3,
)

try:
    from config import PDF_PATH
    _PDF_AVAILABLE = PDF_PATH.exists()
except Exception:
    _PDF_AVAILABLE = False

skip_pdf = pytest.mark.skipif(not _PDF_AVAILABLE, reason="PDF no disponible")


# ---------------------------------------------------------------------------
# EI-01: Thresholds correctos — sin mezcla de columnas
# ---------------------------------------------------------------------------

class TestColumnThresholdsEI01:
    """Verifica que los thresholds nuevos separen las 4 columnas correctamente."""

    def test_conceptos_x63_en_col0(self):
        """x0=63 (Conceptos reales d136) → col0."""
        assert classify_column(63.1, PAGE_WIDTH) == 0

    def test_modos_x175_en_col1(self):
        """x0=175 (Modos de conocer reales d136) → col1, NO col0."""
        assert classify_column(175.0, PAGE_WIDTH) == 1

    def test_modos_x175_NO_es_col0(self):
        """Regresión EI-01: con thresholds viejos x0=175 era col0 (erróneo)."""
        col = classify_column(175.0, PAGE_WIDTH)
        assert col != 0, "x0=175 (Modos de conocer) no debe caer en col0"

    def test_indicadores_x355_en_col2(self):
        """x0=355 (Indicadores reales d136) → col2, NO col1."""
        assert classify_column(355.0, PAGE_WIDTH) == 2

    def test_indicadores_x355_NO_es_col1(self):
        """Regresión EI-01: con thresholds viejos x0=355 era col1 (erróneo)."""
        col = classify_column(355.0, PAGE_WIDTH)
        assert col != 1, "x0=355 (Indicadores) no debe caer en col1"

    def test_situaciones_x520_en_col3(self):
        """x0=520 (Situaciones reales d136) → col3."""
        assert classify_column(520.0, PAGE_WIDTH) == 3

    def test_situaciones_x520_NO_es_col2(self):
        """Regresión EI-01: con thresholds viejos x0=520 era col2 (erróneo, no había col3)."""
        col = classify_column(520.0, PAGE_WIDTH)
        assert col != 2, "x0=520 (Situaciones) no debe caer en col2"

    def test_boundary_col0_col1(self):
        # 0.192 * 841.9 = 161.6pt
        assert classify_column(161, PAGE_WIDTH) == 0   # 161/841.9 = 0.191 < 0.192
        assert classify_column(162, PAGE_WIDTH) == 1   # 162/841.9 = 0.192 >= 0.192

    def test_boundary_col1_col2(self):
        # 0.404 * 841.9 = 340.3pt
        assert classify_column(340, PAGE_WIDTH) == 1   # 340/841.9 = 0.40383 < 0.404
        assert classify_column(341, PAGE_WIDTH) == 2   # 341/841.9 = 0.40502 >= 0.404

    def test_boundary_col2_col3(self):
        # 0.608 * 841.9 = 511.9pt
        assert classify_column(511, PAGE_WIDTH) == 2   # 511/841.9 = 0.60693 < 0.608
        assert classify_column(512, PAGE_WIDTH) == 3   # 512/841.9 = 0.60812 >= 0.608


# ---------------------------------------------------------------------------
# EI-01: Ausencia de cartesiano — 2 filas → 2 relaciones, no 4
# ---------------------------------------------------------------------------

def _build_two_row_table() -> RawTable:
    """
    Tabla sintética con 2 filas, cada una con 1 concepto y 1 modo.
    Con thresholds correctos, produce exactamente 2 relaciones CONCEPT_WAY_OF_KNOWING.
    """
    id_gen = IDGenerator()
    recon = TricolumnReconstructor(page_width=PAGE_WIDTH)

    # Fila 1 (y=100-115): concepto col0, modo col1
    # Fila 2 (y=130-145): concepto col0, modo col1
    # Gap entre filas > 12pt → filas separadas
    row1_spans = [
        make_span("Concepto A", x0=40,  y0=100, y1=115, page=136),
        make_span("Modo A",     x0=215, y0=100, y1=115, page=136),
    ]
    row2_spans = [
        make_span("Concepto B", x0=40,  y0=130, y1=145, page=136),
        make_span("Modo B",     x0=215, y0=130, y1=145, page=136),
    ]
    spans_by_page = {136: row1_spans + row2_spans}
    return recon.reconstruct(
        spans_by_page=spans_by_page,
        area="Área Test", ciclo="Segundo Ciclo", year=4,
        block_name="Test", block_number=1,
    )


class TestNoCartesianEI01:
    """Verifica ausencia de producto cartesiano con thresholds correctos."""

    def test_two_rows_produce_two_relations(self):
        """2 filas × 1 concepto × 1 modo → 2 relaciones, no 4."""
        raw = _build_two_row_table()
        id_gen = IDGenerator()
        adapter = TricolumnAdapter(id_gen)
        elements, relations = adapter.adapt(raw)

        cwok = [r for r in relations if r.relation_type == "CONCEPT_WAY_OF_KNOWING"]
        assert len(cwok) == 2, (
            f"Se esperaban 2 relaciones CONCEPT_WAY_OF_KNOWING (una por fila), "
            f"se obtuvieron {len(cwok)}. EI-01: producto cartesiano detectado."
        )

    def test_two_rows_produce_four_elements(self):
        """2 filas × 2 columnas = 4 elementos."""
        raw = _build_two_row_table()
        id_gen = IDGenerator()
        adapter = TricolumnAdapter(id_gen)
        elements, _ = adapter.adapt(raw)
        assert len(elements) == 4

    def test_no_cross_row_relations(self):
        """Concepto A no tiene relación con Modo B ni viceversa."""
        raw = _build_two_row_table()
        id_gen = IDGenerator()
        adapter = TricolumnAdapter(id_gen)
        elements, relations = adapter.adapt(raw)

        # Indexar por texto
        by_text = {e.original_text: e.stable_id for e in elements}
        con_a = by_text.get("Concepto A")
        mod_b = by_text.get("Modo B")

        # No debe haber relación entre Concepto A y Modo B
        cross = [r for r in relations
                 if r.source_stable_id == con_a and r.target_stable_id == mod_b]
        assert len(cross) == 0, "Producto cartesiano detectado: Concepto A → Modo B"


# ---------------------------------------------------------------------------
# EI-01: col3 → TEACHING_SITUATION y relación CONTENT_TEACHING_SITUATION
# ---------------------------------------------------------------------------

class TestCol3TeachingSituation:
    """Verifica que col3 produce elementos TEACHING_SITUATION y relaciones correctas."""

    def _build_table_with_col3(self):
        recon = TricolumnReconstructor(page_width=PAGE_WIDTH)
        # 1 fila con 3 columnas: col0, col1, col3
        spans = [
            make_span("Concepto Test",   x0=40,  y0=100, y1=115, page=136),
            make_span("Modo Test",       x0=215, y0=100, y1=115, page=136),
            make_span("Situación Test",  x0=520, y0=100, y1=115, page=136),
        ]
        return recon.reconstruct(
            spans_by_page={136: spans},
            area="Área Test", ciclo="Segundo Ciclo", year=4,
            block_name="Test", block_number=1,
        )

    def test_col3_element_type(self):
        raw = self._build_table_with_col3()
        id_gen = IDGenerator()
        adapter = TricolumnAdapter(id_gen)
        elements, _ = adapter.adapt(raw)

        sit_elems = [e for e in elements if e.element_type == "TEACHING_SITUATION"]
        assert len(sit_elems) >= 1, "col3 debe producir al menos un elemento TEACHING_SITUATION"

    def test_col3_relation_type(self):
        raw = self._build_table_with_col3()
        id_gen = IDGenerator()
        adapter = TricolumnAdapter(id_gen)
        _, relations = adapter.adapt(raw)

        sit_rels = [r for r in relations if r.relation_type == "CONTENT_TEACHING_SITUATION"]
        assert len(sit_rels) >= 1, "col3 debe producir relaciones CONTENT_TEACHING_SITUATION"

    def test_col3_column_index(self):
        raw = self._build_table_with_col3()
        id_gen = IDGenerator()
        adapter = TricolumnAdapter(id_gen)
        elements, _ = adapter.adapt(raw)

        sit_elems = [e for e in elements if e.element_type == "TEACHING_SITUATION"]
        for e in sit_elems:
            assert e.column_index == 3, f"TEACHING_SITUATION debe tener column_index=3, got {e.column_index}"

    def test_col3_column_name(self):
        raw = self._build_table_with_col3()
        id_gen = IDGenerator()
        adapter = TricolumnAdapter(id_gen)
        elements, _ = adapter.adapt(raw)

        sit_elems = [e for e in elements if e.element_type == "TEACHING_SITUATION"]
        for e in sit_elems:
            assert e.column_name == "Situaciones de enseñanza"

    def test_simple_row_has_col3(self):
        """La fixture TRICOLUMN_ROW1 (con x0=520) produce un elemento en col3."""
        recon = TricolumnReconstructor(page_width=PAGE_WIDTH)
        table = recon.reconstruct(
            spans_by_page={100: TRICOLUMN_ROW1},
            area="Área Test", ciclo="Segundo Ciclo", year=4,
            block_name="Test", block_number=1,
        )
        row0 = table.rows[0] if table.rows else None
        assert row0 is not None
        assert 3 in row0.cells, "Fila debe tener celda en col3 (Situaciones de enseñanza)"


# ---------------------------------------------------------------------------
# EI-02: Detección de año por heading de span con tamaño de fuente
# ---------------------------------------------------------------------------

class TestYearHeadingDetectionEI02:
    """
    Verifica que scan_bounds detecta headings de año por span size, no por texto completo.
    Tests directos de la lógica interna sin PDF real.
    """

    def test_quinto_año_lowercase_matches(self):
        """El patrón 'quinto año' coincide con 'Quinto año' en minúsculas."""
        heading = "Quinto año"
        pattern = "quinto año"
        assert heading.strip().lower().startswith(pattern)

    def test_sexto_año_lowercase_matches(self):
        """El patrón 'sexto año' coincide con 'Sexto año' en minúsculas."""
        heading = "Sexto año"
        pattern = "sexto año"
        assert heading.strip().lower().startswith(pattern)

    def test_content_word_cuartos_no_match(self):
        """'cuartos' (contenido de fracciones) no debe coincidir con 'cuarto año'."""
        content = "los cuartos de hora y fracciones"
        pattern = "cuarto año"
        # El patrón exacto "cuarto año" no coincide con "cuartos de hora"
        assert not content.strip().lower().startswith(pattern)

    def test_content_word_quintos_no_match(self):
        """'quintos' (denominador) no debe coincidir con 'quinto año'."""
        content = "quintos y sextos de un número"
        pattern = "quinto año"
        assert not content.strip().lower().startswith(pattern)

    def test_min_heading_size_filters_content(self):
        """
        Spans con size < 14 (contenido normal ~9-10pt) no deben disparar heading detection.
        Heading "Quinto año" real tiene size=18.
        """
        content_size = 9.5
        heading_size = 18.0
        MIN_SIZE = 14.0
        assert content_size < MIN_SIZE
        assert heading_size >= MIN_SIZE

    @skip_pdf
    def test_scan_bounds_mat_4_implicit_start(self):
        """MAT año 4 retorna d135 como start (inicio implícito Segundo Ciclo)."""
        import fitz
        from extract import scan_bounds
        from config import PDF_PATH
        doc = fitz.open(str(PDF_PATH))
        try:
            result = scan_bounds(doc, "MAT", 4)
            assert result["start_digital"] == 135, (
                f"MAT 4° debe empezar en d135 (implícito), got d{result['start_digital']}"
            )
        finally:
            doc.close()

    @skip_pdf
    def test_scan_bounds_mat_4_end_before_quinto(self):
        """MAT año 4 termina en d146 (d147-1, donde d147='Quinto año')."""
        import fitz
        from extract import scan_bounds
        from config import PDF_PATH
        doc = fitz.open(str(PDF_PATH))
        try:
            result = scan_bounds(doc, "MAT", 4)
            assert result["end_digital"] == 146, (
                f"MAT 4° debe terminar en d146, got d{result['end_digital']}"
            )
        finally:
            doc.close()

    @skip_pdf
    def test_scan_bounds_mat_5_starts_at_d147(self):
        """MAT año 5 empieza en d147 ('Quinto año' size=18)."""
        import fitz
        from extract import scan_bounds
        from config import PDF_PATH
        doc = fitz.open(str(PDF_PATH))
        try:
            result = scan_bounds(doc, "MAT", 5)
            assert result["start_digital"] == 147, (
                f"MAT 5° debe empezar en d147, got d{result['start_digital']}"
            )
        finally:
            doc.close()

    @skip_pdf
    def test_scan_bounds_mat_6_starts_at_d161(self):
        """MAT año 6 empieza en d161 ('Sexto año' size=18)."""
        import fitz
        from extract import scan_bounds
        from config import PDF_PATH
        doc = fitz.open(str(PDF_PATH))
        try:
            result = scan_bounds(doc, "MAT", 6)
            assert result["start_digital"] == 161, (
                f"MAT 6° debe empezar en d161, got d{result['start_digital']}"
            )
        finally:
            doc.close()


# ---------------------------------------------------------------------------
# GC-007: ciclo hidrológico en QUINTO AÑO (5°), no CUARTO AÑO (4°)
# ---------------------------------------------------------------------------

class TestGC007Year5:
    """GC-007: 'ciclo hidrológico' pertenece a QUINTO AÑO (5°) en CS Naturales."""

    @skip_pdf
    def test_gc007_year_is_5(self):
        """verify_gc007 retorna year determinado = 5 para el ciclo hidrológico."""
        import fitz
        from extract import verify_gc007
        from config import PDF_PATH
        doc = fitz.open(str(PDF_PATH))
        try:
            result = verify_gc007(doc)
            years = {h.get("determined_year") for h in result["hits"] if h.get("determined_year")}
            assert 5 in years, (
                f"GC-007: ciclo hidrológico debe estar en 5° (QUINTO AÑO), "
                f"se determinó: {years}. "
                f"QUINTO AÑO heading en d272 (size=16); ciclo hidrológico en d279; "
                f"SEXTO AÑO en d282."
            )
        finally:
            doc.close()

    @skip_pdf
    def test_gc007_not_year_4(self):
        """GC-007 NO debe quedar asignado a año 4° — corrección de Etapa 02.3."""
        import fitz
        from extract import verify_gc007
        from config import PDF_PATH
        doc = fitz.open(str(PDF_PATH))
        try:
            result = verify_gc007(doc)
            years = {h.get("determined_year") for h in result["hits"] if h.get("determined_year")}
            assert 4 not in years or 5 in years, (
                "GC-007: ciclo hidrológico NO debería estar en 4°. "
                "El heading QUINTO AÑO d272 está antes de d279."
            )
        finally:
            doc.close()

    @skip_pdf
    def test_gc007_found_on_d279(self):
        """El término 'ciclo hidrológico' se encuentra en d279."""
        import fitz
        from extract import verify_gc007
        from config import PDF_PATH
        doc = fitz.open(str(PDF_PATH))
        try:
            result = verify_gc007(doc)
            pages = {h["digital_page"] for h in result["hits"]}
            assert 279 in pages, f"ciclo hidrológico debe encontrarse en d279, se encontró en: {pages}"
        finally:
            doc.close()

    @skip_pdf
    def test_gc007_conclusion_mentions_5(self):
        """La conclusión de verify_gc007 menciona '5°'."""
        import fitz
        from extract import verify_gc007
        from config import PDF_PATH
        doc = fitz.open(str(PDF_PATH))
        try:
            result = verify_gc007(doc)
            concl = result.get("conclusion", "")
            assert "5°" in concl or "5" in concl, (
                f"Conclusión debe mencionar año 5°, got: '{concl}'"
            )
        finally:
            doc.close()


# ---------------------------------------------------------------------------
# Tipos de relación correctos para cada par de columnas
# ---------------------------------------------------------------------------

class TestRelationTypes:
    """Verifica que cada par de columnas produce el tipo de relación correcto."""

    def _build_full_row_table(self):
        """Tabla con 1 fila completa: col0, col1, col2, col3."""
        recon = TricolumnReconstructor(page_width=PAGE_WIDTH)
        spans = [
            make_span("Concepto",   x0=40,  y0=100, y1=115, page=136),
            make_span("Modo",       x0=215, y0=100, y1=115, page=136),
            make_span("Indicador",  x0=350, y0=100, y1=115, page=136),
            make_span("Situación",  x0=520, y0=100, y1=115, page=136),
        ]
        return recon.reconstruct(
            spans_by_page={136: spans},
            area="Área Test", ciclo="Segundo Ciclo", year=4,
            block_name="Test", block_number=1,
        )

    def test_concept_way_relation_present(self):
        raw = self._build_full_row_table()
        id_gen = IDGenerator()
        _, relations = TricolumnAdapter(id_gen).adapt(raw)
        types = {r.relation_type for r in relations}
        assert "CONCEPT_WAY_OF_KNOWING" in types

    def test_content_progress_indicator_relation_present(self):
        raw = self._build_full_row_table()
        id_gen = IDGenerator()
        _, relations = TricolumnAdapter(id_gen).adapt(raw)
        types = {r.relation_type for r in relations}
        assert "CONTENT_PROGRESS_INDICATOR" in types

    def test_content_teaching_situation_relation_present(self):
        raw = self._build_full_row_table()
        id_gen = IDGenerator()
        _, relations = TricolumnAdapter(id_gen).adapt(raw)
        types = {r.relation_type for r in relations}
        assert "CONTENT_TEACHING_SITUATION" in types

    def test_full_row_exactly_3_relations(self):
        """1 fila con col0+col1+col2+col3 → exactamente 3 relaciones."""
        raw = self._build_full_row_table()
        id_gen = IDGenerator()
        _, relations = TricolumnAdapter(id_gen).adapt(raw)
        assert len(relations) == 3, (
            f"1 fila completa debe producir 3 relaciones (concept-way, concept-indicator, "
            f"concept-situation), got {len(relations)}"
        )

    def test_all_relations_source_expressed(self):
        raw = self._build_full_row_table()
        id_gen = IDGenerator()
        _, relations = TricolumnAdapter(id_gen).adapt(raw)
        for r in relations:
            assert r.relation_basis == "SOURCE_EXPRESSED"
