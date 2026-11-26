"""
test_table_reconstructor.py — Pruebas del reconstructor de tablas.
Usa fixtures sintéticas, NO contenido del DC.
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from page_extractor import classify_column, group_into_rows
from table_reconstructor import TricolumnReconstructor, RawCell
from tests.fixtures import (
    TRICOLUMN_ROW1, TRICOLUMN_ROW2_COL0, TRICOLUMN_ROW3_COL0,
    TRICOLUMN_ROW23_COL1, TRICOLUMN_ROW2_COL2, TRICOLUMN_ROW3_COL2,
    TRICOLUMN_ROW1_COL3,
    PAGE_WIDTH, PAGE_CROSS_SPAN_PAGE1, PAGE_CROSS_SPAN_PAGE2,
)


class TestClassifyColumn:
    def test_col0_left(self):
        assert classify_column(40, PAGE_WIDTH) == 0

    def test_col1_center(self):
        # 0.192 * 841.9 = 161.6; real Modos de conocer x0 ~175
        assert classify_column(175, PAGE_WIDTH) == 1

    def test_col2_indicadores(self):
        # 0.404 * 841.9 = 340.3; real Indicadores x0 ~355
        assert classify_column(355, PAGE_WIDTH) == 2

    def test_col3_situaciones(self):
        # 0.608 * 841.9 = 511.9; real Situaciones x0 ~520
        assert classify_column(520, PAGE_WIDTH) == 3

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

    def test_old_col1_x0_now_col1(self):
        # x0=222; con thresholds correctos 222/841.9=0.264, 0.192<=0.264<0.404 → col1
        assert classify_column(222, PAGE_WIDTH) == 1

    def test_old_col2_threshold_now_col2(self):
        # x0=400, 400/841.9=0.475, 0.404<=0.475<0.608 → col2
        assert classify_column(400, PAGE_WIDTH) == 2


class TestGroupIntoRows:
    def test_single_row(self):
        spans = [
            *TRICOLUMN_ROW1,  # todos en y0=100
        ]
        rows = group_into_rows(spans)
        assert len(rows) == 1

    def test_two_rows(self):
        spans = TRICOLUMN_ROW1 + [TRICOLUMN_ROW2_COL0]
        rows = group_into_rows(spans)
        assert len(rows) == 2

    def test_three_rows(self):
        spans = TRICOLUMN_ROW1 + [TRICOLUMN_ROW2_COL0, TRICOLUMN_ROW3_COL0]
        rows = group_into_rows(spans)
        assert len(rows) == 3

    def test_tolerance(self):
        """Spans dentro de la tolerancia se agrupan en la misma fila."""
        from tests.fixtures import make_span
        s1 = make_span("texto1", x0=40, y0=100.0)
        s2 = make_span("texto2", x0=50, y0=102.0)  # 2pt de diferencia
        rows = group_into_rows([s1, s2], tolerance=4.0)
        assert len(rows) == 1


class TestTricolumnReconstructor:
    def setup_method(self):
        self.recon = TricolumnReconstructor(page_width=PAGE_WIDTH)

    def test_simple_row(self):
        """Tabla simple de 1 fila sin celdas combinadas."""
        spans_by_page = {100: TRICOLUMN_ROW1}
        table = self.recon.reconstruct(
            spans_by_page=spans_by_page,
            area="Área Test", ciclo="Segundo Ciclo", year=4,
            block_name="Bloque Test", block_number=1,
        )
        assert table.row_count() >= 1
        # La fila 0 debe tener las 3 columnas
        row0 = table.rows[0]
        assert 0 in row0.cells
        # La celda de col 0 debe contener el texto del concepto
        assert "Concepto" in row0.cells[0].raw_text

    def test_merged_cell_detected(self):
        """Celda combinada en columna 1 debe detectarse."""
        spans_by_page = {100: [
            TRICOLUMN_ROW2_COL0,
            TRICOLUMN_ROW3_COL0,
            TRICOLUMN_ROW23_COL1,  # cubre y0=120 a y1=155
            TRICOLUMN_ROW2_COL2,
            TRICOLUMN_ROW3_COL2,
        ]}
        table = self.recon.reconstruct(
            spans_by_page=spans_by_page,
            area="Área Test", ciclo="Segundo Ciclo", year=4,
            block_name="Bloque Test", block_number=1,
        )
        # Debe haber ambigüedades por la celda combinada
        assert len(table.ambiguities) > 0 or table.has_merged_cells()

    def test_cross_page_table(self):
        """Tabla que cruza dos páginas."""
        spans_by_page = {
            135: [PAGE_CROSS_SPAN_PAGE1] + TRICOLUMN_ROW1,
            136: [PAGE_CROSS_SPAN_PAGE2],
        }
        table = self.recon.reconstruct(
            spans_by_page=spans_by_page,
            area="Matemática", ciclo="Segundo Ciclo", year=4,
            block_name="Bloque Test", block_number=1,
        )
        assert 135 in table.pages
        assert 136 in table.pages

    def test_empty_table_reported(self):
        """Tabla sin spans después del encabezado registra ambigüedad."""
        from tests.fixtures import make_span
        # Solo el span del encabezado, nada más
        header_span = make_span("Conceptos", x0=40, y0=50, x1=200, y1=65, page=135)
        spans_by_page = {135: [header_span]}
        table = self.recon.reconstruct(
            spans_by_page=spans_by_page,
            area="Matemática", ciclo="Segundo Ciclo", year=4,
            block_name="Bloque Vacío", block_number=1,
            header_y_cutoff=65.0,
        )
        assert len(table.ambiguities) > 0

    def test_items_split_by_bullet(self):
        """Celda con múltiples viñetas se divide en ítems."""
        from tests.fixtures import make_span, MULTIITEM_TEXT
        import sys, os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
        from table_reconstructor import RawCell as RC
        from tests.fixtures import make_span
        span = make_span(MULTIITEM_TEXT, x0=40, y0=100, page=135)
        cell = RC(column=0, row_index=0, spans=[span])
        items = cell.items()
        assert len(items) >= 2


class TestRawCellItems:
    def test_single_item(self):
        from tests.fixtures import make_span
        span = make_span("Concepto único sintético", x0=40, y0=100, page=135)
        cell = RawCell(column=0, row_index=0, spans=[span])
        items = cell.items()
        assert len(items) == 1
        assert "Concepto" in items[0]

    def test_empty_cell(self):
        cell = RawCell(column=0, row_index=0, spans=[])
        assert cell.is_empty
        assert cell.items() == []
