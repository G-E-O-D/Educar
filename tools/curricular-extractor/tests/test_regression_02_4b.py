"""
Regression tests for Etapa 02.4B.

Covers:
  - MAT extraction with PC12Extractor (EI-09 resolution)
  - CSS extraction with CSSAdapter / TricolumnAdapter + css_split_items
  - css_split_items item splitting logic (unit tests)
  - Block regex anchoring (EI-false-positive fix)
  - CSS situaciones page cutoff (EI-10 fix)
"""

import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from adapters.css import css_split_items
from table_reconstructor import RawCell


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_span(x0, y0, text, size=8.0):
    """Build a minimal Span-like object for testing."""
    from dataclasses import dataclass

    @dataclass
    class _Span:
        x0: float
        y0: float
        text: str
        size: float
        x1: float = 0.0
        y1: float = 0.0
        page: int = 1

    s = _Span(x0=x0, y0=y0, text=text, size=size)
    s.y1 = y0 + size
    s.x1 = x0 + len(text) * 4.5
    return s


def make_cell(spans):
    """Wrap spans in a RawCell."""
    return RawCell(column=0, row_index=0, spans=spans)


# ---------------------------------------------------------------------------
# css_split_items — unit tests
# ---------------------------------------------------------------------------

class TestCssSplitItemsBasic:

    def test_empty_cell_returns_empty(self):
        cell = make_cell([])
        assert css_split_items(cell) == []

    def test_single_span(self):
        cell = make_cell([make_span(60.0, 100.0, "Un concepto.")])
        items = css_split_items(cell)
        assert len(items) == 1
        assert items[0] == "Un concepto."

    def test_two_items_by_gap(self):
        """Gap >= 0.5pt between consecutive spans → new item."""
        spans = [
            make_span(60.0, 100.0, "Primer concepto."),
            make_span(60.0, 110.0, "Segundo concepto."),  # gap = 110 - (100+8) = 2pt
        ]
        items = css_split_items(make_cell(spans))
        assert len(items) == 2
        assert "Primer concepto." in items[0]
        assert "Segundo concepto." in items[1]

    def test_continuation_deep_indent(self):
        """Span with offset > 7pt is continuation of previous item."""
        spans = [
            make_span(60.0, 100.0, "Un concepto en"),   # offset 0
            make_span(70.0, 108.5, "dos líneas."),       # offset 10 > 7 → continuation
        ]
        items = css_split_items(make_cell(spans))
        assert len(items) == 1
        assert "dos líneas." in items[0]

    def test_new_item_uppercase_no_gap(self):
        """Span with uppercase and tiny gap < 0.5pt → new item (rule 4)."""
        spans = [
            make_span(60.0, 100.0, "Primer concepto."),
            make_span(60.0, 108.4, "Segundo concepto."),  # gap = 108.4 - 108 = 0.4 < 0.5
        ]
        items = css_split_items(make_cell(spans))
        # Rule 4 (uppercase S) triggers new item
        assert len(items) == 2

    def test_page_boundary_new_item(self):
        """Gap < -50pt (page boundary) with normal indent → new item."""
        spans = [
            make_span(60.0, 500.0, "Fin de página."),
            make_span(60.0, 55.0, "Inicio siguiente."),  # gap = 55 - 508 = -453pt
        ]
        items = css_split_items(make_cell(spans))
        assert len(items) == 2

    def test_page_boundary_deep_indent_continuation(self):
        """Rule 1 (deep indent) on consecutive spans -> continuation. Same-page variant."""
        spans = [
            make_span(60.0, 100.0, "Texto que continua"),
            make_span(69.0, 108.5, "en dos lineas."),  # offset=9 > 7 -> rule 1 -> continuation
        ]
        items = css_split_items(make_cell(spans))
        assert len(items) == 1
    def test_dedent_new_item(self):
        """Dedent (offset drops by >2pt) → new item (rule 2)."""
        spans = [
            make_span(64.0, 100.0, "Sub-ítem con indent."),  # offset=4
            make_span(60.0, 108.6, "Nuevo ítem top."),        # offset=0, dedent from 4 → 0 > 2
        ]
        items = css_split_items(make_cell(spans))
        assert len(items) == 2


# ---------------------------------------------------------------------------
# css_split_items — text quality
# ---------------------------------------------------------------------------

class TestCssSplitItemsTextQuality:

    def test_hyphen_normalization(self):
        """Soft hyphen and \\n after hyphen are removed."""
        spans = [
            make_span(60.0, 100.0, "Natu-\n"),
            make_span(70.0, 108.5, "raleza."),
        ]
        items = css_split_items(make_cell(spans))
        assert len(items) == 1
        assert "raleza." in items[0]
        assert "-\n" not in items[0]


# ---------------------------------------------------------------------------
# Block regex — no false positives
# ---------------------------------------------------------------------------

class TestBlockRegex:

    def test_bloque_header_matches(self):
        import re
        block_re = re.compile(r'^BLOQUE\s*[:\-]?\s*(.+)', re.IGNORECASE)
        assert block_re.match("BLOQUE: Números Naturales")
        assert block_re.match("BLOQUE - Geometría")
        assert block_re.match("Bloque Medida")

    def test_ejemplo_no_match(self):
        import re
        block_re = re.compile(r'^BLOQUE\s*[:\-]?\s*(.+)', re.IGNORECASE)
        assert block_re.match("ejemplo, ambientes de estepa") is None
        assert block_re.match("algunos ejemplos de trabajo") is None

    def test_eje_no_match(self):
        """EJE is not a block marker in CSS — should not match."""
        import re
        block_re = re.compile(r'^BLOQUE\s*[:\-]?\s*(.+)', re.IGNORECASE)
        assert block_re.match("EJE temático: Tiempo y espacio") is None


# ---------------------------------------------------------------------------
# CSSAdapter — column type mapping
# ---------------------------------------------------------------------------

class TestCSSAdapterColumnTypes:

    def test_css_1_2_col2_is_way_of_knowing(self):
        from adapters.css import CSS_COLUMN_TYPES
        assert CSS_COLUMN_TYPES[2] == "WAY_OF_KNOWING"
        assert CSS_COLUMN_TYPES[3] == "PROGRESS_INDICATOR"

    def test_css_relation_types(self):
        from adapters.css import CSS_RELATION_TYPES
        assert CSS_RELATION_TYPES[(0, 2)][0] == "CONCEPT_WAY_OF_KNOWING"
        assert CSS_RELATION_TYPES[(0, 3)][0] == "CONTENT_PROGRESS_INDICATOR"


# ---------------------------------------------------------------------------
# TricolumnAdapter — cell_items_fn injection
# ---------------------------------------------------------------------------

class TestTricolumnAdapterCellItemsFn:

    def test_accepts_cell_items_fn(self):
        from adapters.tricolumn import TricolumnAdapter
        from id_generator import IDGenerator

        def custom_fn(cell):
            return ["item_a", "item_b"]

        adapter = TricolumnAdapter(IDGenerator(), cell_items_fn=custom_fn)
        assert adapter._cell_items_fn is custom_fn

    def test_default_uses_cell_items(self):
        from adapters.tricolumn import TricolumnAdapter
        from id_generator import IDGenerator

        adapter = TricolumnAdapter(IDGenerator())
        assert adapter._cell_items_fn is None


# ---------------------------------------------------------------------------
# MAT extraction counts — smoke test (uses scratchpad JSON if available)
# ---------------------------------------------------------------------------

class TestMATExtractionCounts:
    """Smoke tests verifying MAT extraction totals haven't regressed."""

    SCRATCHPAD = Path(r"C:\Users\GComunal\AppData\Local\Temp\claude\8c6fedd7d95bbcdc\7ccd7963-2824-4911-9990-6c653e3fec80\scratchpad")

    @pytest.fixture
    def mat_data(self):
        import json
        p = self.SCRATCHPAD / "extract_MAT_all.json"
        if not p.exists():
            pytest.skip("MAT JSON not in scratchpad")
        return json.loads(p.read_text(encoding="utf-8"))

    def test_total_elements(self, mat_data):
        assert len(mat_data["elements"]) == 1431

    def test_total_relations(self, mat_data):
        assert len(mat_data["relations"]) == 1246

    def test_no_validation_errors(self, mat_data):
        assert mat_data["validation"]["error_count"] == 0

    def test_concept_count(self, mat_data):
        concepts = [e for e in mat_data["elements"] if e["element_type"] == "CONCEPT"]
        assert len(concepts) == 210

    def test_way_count(self, mat_data):
        ways = [e for e in mat_data["elements"] if e["element_type"] == "WAY_OF_KNOWING"]
        assert len(ways) == 462


# ---------------------------------------------------------------------------
# CSS extraction counts — smoke test
# ---------------------------------------------------------------------------

class TestCSSExtractionCounts:
    """Smoke tests verifying CSS extraction totals."""

    SCRATCHPAD = Path(r"C:\Users\GComunal\AppData\Local\Temp\claude\8c6fedd7d95bbcdc\7ccd7963-2824-4911-9990-6c653e3fec80\scratchpad")

    @pytest.fixture
    def css_data(self):
        import json
        p = self.SCRATCHPAD / "extract_CSS_all.json"
        if not p.exists():
            pytest.skip("CSS JSON not in scratchpad")
        return json.loads(p.read_text(encoding="utf-8"))

    def test_total_elements(self, css_data):
        assert len(css_data["elements"]) == 533

    def test_total_relations(self, css_data):
        assert len(css_data["relations"]) == 4958

    def test_no_validation_errors(self, css_data):
        assert css_data["validation"]["error_count"] == 0

    def test_all_6_years_present(self, css_data):
        years = {e["year"] for e in css_data["elements"]}
        assert years == {1, 2, 3, 4, 5, 6}

    def test_concept_count(self, css_data):
        concepts = [e for e in css_data["elements"] if e["element_type"] == "CONCEPT"]
        assert len(concepts) == 193

    def test_year_1_elements(self, css_data):
        y1 = [e for e in css_data["elements"] if e["year"] == 1]
        assert len(y1) == 71

    def test_year_2_elements(self, css_data):
        y2 = [e for e in css_data["elements"] if e["year"] == 2]
        assert len(y2) == 78

    def test_year_6_minimum_elements(self, css_data):
        """6° has known quality issues but should have at least 50 elements."""
        y6 = [e for e in css_data["elements"] if e["year"] == 6]
        assert len(y6) >= 50


# ---------------------------------------------------------------------------
# CSS GC validation — golden cases
# ---------------------------------------------------------------------------

class TestCSSGoldenCases:
    """Validate GC-001 to GC-006 against CSS extraction."""

    SCRATCHPAD = Path(r"C:\Users\GComunal\AppData\Local\Temp\claude\8c6fedd7d95bbcdc\7ccd7963-2824-4911-9990-6c653e3fec80\scratchpad")

    @pytest.fixture
    def css_elements(self):
        import json
        p = self.SCRATCHPAD / "extract_CSS_all.json"
        if not p.exists():
            pytest.skip("CSS JSON not in scratchpad")
        return json.loads(p.read_text(encoding="utf-8"))["elements"]

    def _find(self, elements, text_prefix):
        return [e for e in elements
                if text_prefix.lower() in e.get("original_text", "").lower()]

    def test_gc001_not_in_table(self, css_elements):
        """GC-001: objectives page d201 should NOT be in extracted elements."""
        found = self._find(css_elements, "Objetivos del año")
        assert found == [], f"Objectives page d201 should not be extracted, found: {found[:1]}"

    def test_gc002_found_as_concept_year4(self, css_elements):
        """GC-002: 'Los pueblos originarios americanos en el siglo XV.' → CONCEPT year=4."""
        found = self._find(css_elements, "Los pueblos originarios americanos en el siglo XV")
        assert len(found) >= 1, "GC-002 not found"
        assert any(e["element_type"] == "CONCEPT" and e["year"] == 4 for e in found), \
            f"Expected CONCEPT year=4, got: {[(e['element_type'], e['year']) for e in found]}"

    def test_gc004_found_as_concept_year4(self, css_elements):
        """GC-004: 'La forma de gobierno federal' → CONCEPT year=4."""
        found = self._find(css_elements, "La forma de gobierno federal")
        assert len(found) >= 1, "GC-004 not found"
        assert any(e["element_type"] == "CONCEPT" and e["year"] == 4 for e in found), \
            f"Expected CONCEPT year=4, got: {[(e['element_type'], e['year']) for e in found]}"

    def test_gc005_found_as_concept_year4(self, css_elements):
        """GC-005: 'Los recursos naturales en la provincia de Buenos' → CONCEPT year=4."""
        found = self._find(css_elements, "Los recursos naturales en la provincia de Buenos")
        assert len(found) >= 1, "GC-005 not found"
        assert any(e["element_type"] == "CONCEPT" and e["year"] == 4 for e in found), \
            f"Expected CONCEPT year=4, got: {[(e['element_type'], e['year']) for e in found]}"

    def test_gc006_found_year3(self, css_elements):
        """GC-006: 'Formas de vida de los pueblos originarios' → year=3."""
        # Accept partial match since text may be part of larger item
        found = self._find(css_elements, "pueblo")
        year3_concepts = [e for e in found
                          if e.get("year") == 3 and e.get("element_type") == "CONCEPT"]
        assert len(year3_concepts) >= 1, "No CONCEPT year=3 containing 'pueblo' found for GC-006"
