"""
test_regression_02_4a.py — Regresión Etapa 02.4A: EI-08 (sobrepartición de texto multilínea).

Principio: NO contenido DC. Spans sintéticos con coordenadas de ejemplo.

EI-08: items() dividía texto de continuación (misma línea tipográfica) en múltiples ítems.
Causa raíz: gap y0-to-y0 > 3pt para interlineado normal (8pt font → ~9.5pt gap).
Fix: agrupar spans en renglones visuales (y0 dentro de 3pt); PUA-bullets señalan nuevo ítem;
sin bullets → texto completo = 1 ítem.
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from table_reconstructor import RawCell
from tests.fixtures import make_span


PUA_BULLET = ''   # U+F075: viñeta del DC PBA 2018


class TestEI08ContinuationNoBullets:
    """Texto multilinea sin viñetas: debe producir UN único ítem."""

    def test_two_continuation_spans_one_item(self):
        """EI-08 raíz: dos spans del mismo concepto en líneas contiguas → 1 ítem."""
        s1 = make_span("Números hasta el orden",  x0=40, y0=114.8, y1=124.0, page=136)
        s2 = make_span("de los millones.",         x0=40, y0=124.4, y1=133.5, page=136)
        cell = RawCell(column=0, row_index=0, spans=[s1, s2])
        items = cell.items()
        assert len(items) == 1, (
            f"EI-08 regresión: 2 spans de continuación deben producir 1 ítem, got {items}"
        )
        assert "Números hasta el orden" in items[0]
        assert "de los millones." in items[0]

    def test_three_continuation_spans_one_item(self):
        """Tres líneas de un concepto largo → 1 ítem (sin viñetas)."""
        s1 = make_span("Lectura y escritura",          x0=40, y0=100.0, y1=109.0, page=136)
        s2 = make_span("de números",                    x0=40, y0=109.4, y1=118.5, page=136)
        s3 = make_span("hasta cien millones.",          x0=40, y0=118.9, y1=128.0, page=136)
        cell = RawCell(column=0, row_index=0, spans=[s1, s2, s3])
        items = cell.items()
        assert len(items) == 1
        full = items[0]
        assert "Lectura y escritura" in full
        assert "de números" in full
        assert "hasta cien millones." in full

    def test_col1_continuation_no_bullets_one_item(self):
        """Columna 1 sin PUA: texto multilínea → 1 ítem."""
        s1 = make_span("Explorar e investigar", x0=175, y0=115.0, y1=124.0, page=136)
        s2 = make_span("situaciones problemáticas.", x0=175, y0=124.5, y1=133.5, page=136)
        cell = RawCell(column=1, row_index=0, spans=[s1, s2])
        items = cell.items()
        assert len(items) == 1


class TestEI08PUABulletSameVisualLine:
    """PUA en la misma línea visual que el texto → NO inicia nuevo ítem."""

    def test_pua_at_same_y_as_text_one_item(self):
        """PUA a 1.9pt de distancia del texto → mismo renglón visual → 1 ítem."""
        pua = make_span(PUA_BULLET,       x0=165, y0=116.9, y1=125.0, page=136)
        txt = make_span("Concepto único", x0=175, y0=115.0, y1=124.0, page=136)
        cell = RawCell(column=1, row_index=0, spans=[pua, txt])
        items = cell.items()
        assert len(items) == 1
        assert "Concepto único" in items[0]

    def test_pua_at_same_y_exactly(self):
        """PUA con y0 idéntico al texto → mismo renglón → 1 ítem."""
        pua = make_span(PUA_BULLET,         x0=165, y0=115.0, page=136)
        txt = make_span("Texto del ítem.",  x0=175, y0=115.0, page=136)
        cell = RawCell(column=1, row_index=0, spans=[pua, txt])
        items = cell.items()
        assert len(items) == 1


class TestEI08PUABulletNewItem:
    """PUA en nueva línea visual → inicia nuevo ítem."""

    def test_two_pua_items_no_continuation(self):
        """Dos ítems con PUA en líneas separadas → 2 ítems."""
        pua1 = make_span(PUA_BULLET,  x0=165, y0=115.0, page=136)
        txt1 = make_span("Primer ítem",  x0=175, y0=115.0, page=136)
        pua2 = make_span(PUA_BULLET,  x0=165, y0=135.0, page=136)
        txt2 = make_span("Segundo ítem", x0=175, y0=135.0, page=136)
        cell = RawCell(column=1, row_index=0, spans=[pua1, txt1, pua2, txt2])
        items = cell.items()
        assert len(items) == 2
        assert "Primer ítem" in items[0]
        assert "Segundo ítem" in items[1]

    def test_pua_item_with_continuation(self):
        """PUA + texto en línea 1, luego continuación sin PUA → 1 ítem con todo el texto."""
        pua1  = make_span(PUA_BULLET,         x0=165, y0=116.9, y1=125.0, page=136)
        txt1a = make_span("Primera parte",     x0=175, y0=115.0, y1=124.0, page=136)
        txt1b = make_span("segunda parte",     x0=175, y0=124.5, y1=133.5, page=136)
        cell = RawCell(column=1, row_index=0, spans=[pua1, txt1a, txt1b])
        items = cell.items()
        assert len(items) == 1
        assert "Primera parte" in items[0]
        assert "segunda parte" in items[0]

    def test_pua_two_items_with_continuation(self):
        """
        Patrón completo del DC:
        • PUA₁ + text₁a (misma línea) → continuaciones text₁b, text₁c
        • PUA₂ + text₂a (nueva línea)
        → 2 ítems; ítem 1 incluye todas las continuaciones.
        """
        pua1  = make_span(PUA_BULLET,          x0=165, y0=116.9, page=136)
        txt1a = make_span("Leer y escribir",    x0=175, y0=115.0, page=136)
        txt1b = make_span("números hasta el",   x0=175, y0=124.5, page=136)
        txt1c = make_span("orden de millones.", x0=175, y0=134.0, page=136)
        pua2  = make_span(PUA_BULLET,           x0=165, y0=145.0, page=136)
        txt2a = make_span("Ordenar y comparar", x0=175, y0=145.0, page=136)
        cell = RawCell(column=1, row_index=0,
                       spans=[pua1, txt1a, txt1b, txt1c, pua2, txt2a])
        items = cell.items()
        assert len(items) == 2, f"Esperados 2 ítems, obtenidos: {items}"
        assert "Leer y escribir" in items[0]
        assert "números hasta el" in items[0]
        assert "orden de millones." in items[0]
        assert "Ordenar y comparar" in items[1]

    def test_pua_three_items(self):
        """Tres ítems con PUA en líneas separadas."""
        spans = []
        for i, (y_pua, y_txt, label) in enumerate([
            (116.9, 115.0, "Alfa"),
            (135.0, 135.0, "Beta"),
            (155.0, 155.0, "Gamma"),
        ]):
            spans.append(make_span(PUA_BULLET,   x0=165, y0=y_pua, page=136))
            spans.append(make_span(label,         x0=175, y0=y_txt, page=136))
        cell = RawCell(column=1, row_index=0, spans=spans)
        items = cell.items()
        assert len(items) == 3
        assert "Alfa" in items[0]
        assert "Beta" in items[1]
        assert "Gamma" in items[2]


class TestEI08PUAExcludedFromText:
    """El carácter PUA no debe aparecer en el texto del ítem."""

    def test_pua_not_in_item_text(self):
        pua = make_span(PUA_BULLET,          x0=165, y0=116.9, page=136)
        txt = make_span("Texto del ítem.",   x0=175, y0=115.0, page=136)
        cell = RawCell(column=1, row_index=0, spans=[pua, txt])
        items = cell.items()
        for item in items:
            assert PUA_BULLET not in item, f"PUA no debe estar en el texto: {repr(item)}"

    def test_pua_only_cell_returns_empty(self):
        """Celda con solo spans PUA (sin texto): devuelve []."""
        pua = make_span(PUA_BULLET, x0=165, y0=115.0, page=136)
        cell = RawCell(column=1, row_index=0, spans=[pua])
        items = cell.items()
        assert items == []


class TestEI08BackwardCompatibility:
    """La lógica existente no debe romperse."""

    def test_single_span_one_item(self):
        """Un solo span → 1 ítem (igual que antes)."""
        span = make_span("Concepto único sintético", x0=40, y0=100.0, page=135)
        cell = RawCell(column=0, row_index=0, spans=[span])
        items = cell.items()
        assert len(items) == 1
        assert "Concepto" in items[0]

    def test_empty_cell_returns_empty(self):
        """Celda vacía → [] (igual que antes)."""
        cell = RawCell(column=0, row_index=0, spans=[])
        assert cell.items() == []

    def test_standard_bullet_split_preserved(self):
        """Viñetas ASCII estándar (·) siguen dividiendo en múltiples ítems."""
        from tests.fixtures import make_span, MULTIITEM_TEXT
        span = make_span(MULTIITEM_TEXT, x0=40, y0=100.0, page=135)
        cell = RawCell(column=0, row_index=0, spans=[span])
        items = cell.items()
        assert len(items) >= 2, (
            f"Viñetas estándar deben dividir el texto, got {len(items)} ítems"
        )
