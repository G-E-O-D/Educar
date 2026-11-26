"""
test_regression_02_3_2.py — Tests de regresión para Etapa 02.3.2.

Cubren:
  EI-07: página A4 landscape (841.9pt) → thresholds recalibrados (0.192/0.404/0.608)
         x0=175 (Modos de conocer) correctamente clasificado en col1, no col0.
         x0=350 (Indicadores) en col2. x0=519 (Situaciones) en col3.

Principio: NO contienen contenido del DC.
Los tests PDF-dependientes se saltan si el archivo no está disponible.
"""

import sys, os
import pytest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from page_extractor import classify_column
from table_reconstructor import TricolumnReconstructor, RawCell
from adapters.tricolumn import TricolumnAdapter
from id_generator import IDGenerator
from tests.fixtures import make_span, PAGE_WIDTH

try:
    from config import PDF_PATH
    PDF_AVAILABLE = PDF_PATH.exists()
except Exception:
    PDF_AVAILABLE = False

PDF_SKIP = pytest.mark.skipif(not PDF_AVAILABLE, reason="PDF no disponible")

# ---------------------------------------------------------------------------
# EI-07: Página DC PBA 2018 es A4 landscape (841.9pt ancho, no portrait 595pt)
# Los thresholds ratios 0.192/0.404/0.608 se miden con page_width=841.9.
# ---------------------------------------------------------------------------

LANDSCAPE_PAGE_WIDTH = 841.9  # ancho real del DC PBA 2018

class TestEI07LandscapePageWidth:
    """Verifica que con el ancho real 841.9pt los spans caen en columna correcta."""

    def test_modos_x175_con_page_real_es_col1(self):
        """x0=175 con page_width real 841.9 → col1 (antes era col0 con threshold incorrecto)."""
        col = classify_column(175.0, LANDSCAPE_PAGE_WIDTH)
        assert col == 1, f"x0=175 debe ser col1 con page_width=841.9, obtuvo col{col}"

    def test_modos_bullet_x169_con_page_real_es_col1(self):
        """x0=169.4 (bullet \\uf075 de Modos de conocer en d136) → col1."""
        col = classify_column(169.4, LANDSCAPE_PAGE_WIDTH)
        assert col == 1, f"x0=169.4 (bullet col1) debe ser col1, obtuvo col{col}"

    def test_indicadores_x350_con_page_real_es_col2(self):
        """x0=350.7 (bullet Indicadores en d136) → col2."""
        col = classify_column(350.7, LANDSCAPE_PAGE_WIDTH)
        assert col == 2, f"x0=350.7 debe ser col2, obtuvo col{col}"

    def test_situaciones_x519_con_page_real_es_col3(self):
        """x0=519.9 (Situaciones de enseñanza en d136) → col3."""
        col = classify_column(519.9, LANDSCAPE_PAGE_WIDTH)
        assert col == 3, f"x0=519.9 debe ser col3, obtuvo col{col}"

    def test_conceptos_x61_con_page_real_es_col0(self):
        """x0=60.9 (Conceptos en d136) → col0."""
        col = classify_column(60.9, LANDSCAPE_PAGE_WIDTH)
        assert col == 0

    def test_old_threshold_habria_clasificado_modos_en_col0(self):
        """Regresión: con threshold viejo 0.27, x0=175 sobre 841.9 era col0.
        Verifica que el threshold viejo habría fallado."""
        ratio = 175.0 / LANDSCAPE_PAGE_WIDTH  # = 0.208
        old_threshold = 0.27
        # El threshold viejo habría dado col0 (ratio < 0.27)
        assert ratio < old_threshold, (
            f"Verifica que ratio=175/841.9={ratio:.3f} era < threshold viejo {old_threshold}"
        )
        # Con el nuevo threshold NO es col0
        assert ratio >= 0.192, (
            f"Con nuevo threshold 0.192, ratio={ratio:.3f} → col1"
        )

    def test_old_threshold_habria_clasificado_indicadores_en_col1(self):
        """Regresión: con threshold viejo 0.54, x0=350.7 sobre 841.9 era col1."""
        ratio = 350.7 / LANDSCAPE_PAGE_WIDTH  # = 0.416
        old_col1_max = 0.54
        assert ratio < old_col1_max, f"ratio={ratio:.3f} era < 0.54 (habría sido col1)"
        assert ratio >= 0.404, f"Con nuevo threshold 0.404 → col2"

    def test_old_threshold_habria_clasificado_situaciones_en_col2(self):
        """Regresión: con threshold viejo 0.84, x0=519.9 sobre 841.9 era col2."""
        ratio = 519.9 / LANDSCAPE_PAGE_WIDTH  # = 0.617
        old_col2_max = 0.84
        assert ratio < old_col2_max, f"ratio={ratio:.3f} era < 0.84 (habría sido col2)"
        assert ratio >= 0.608, f"Con nuevo threshold 0.608 → col3"

    def test_no_text_mixing_in_col0_cell(self):
        """Una fila con spans reales de d136 no mezcla col0 y col1 en el mismo RawCell."""
        # Spans típicos de d136 (posiciones reales del DC PBA 2018)
        col0_span = make_span("Números hasta el orden", x0=60.9, y0=115.0, x1=152.9, y1=124.3, size=8)
        col1_span = make_span("Leer y escribir", x0=175.2, y0=115.0, x1=344.9, y1=124.6, size=8)

        recon = TricolumnReconstructor(page_width=LANDSCAPE_PAGE_WIDTH)
        raw_table = recon.reconstruct(
            spans_by_page={136: [col0_span, col1_span]},
            area="Matemática", ciclo="Segundo Ciclo", year=4,
            block_name="Test", block_number=1,
        )
        assert len(raw_table.rows) == 1
        row = raw_table.rows[0]
        cell0 = row.cells.get(0)
        cell1 = row.cells.get(1)
        assert cell0 is not None, "debe haber celda en col0"
        assert cell1 is not None, "debe haber celda en col1"
        assert "Leer y escribir" not in cell0.raw_text, (
            "EI-07: texto de col1 no debe aparecer en celda col0"
        )
        assert "Números" not in cell1.raw_text, (
            "EI-07: texto de col0 no debe aparecer en celda col1"
        )


# ---------------------------------------------------------------------------
# EI-07: Tests de integración PDF (salteados si no hay PDF)
# ---------------------------------------------------------------------------

@PDF_SKIP
class TestEI07PDFIntegration:
    """Verifica la clasificación real en d136 con page_width extraída del PDF."""

    def test_d136_page_width_is_landscape(self):
        """Página d136 del DC PBA 2018 tiene ancho ~841.9pt (A4 landscape)."""
        import fitz
        from config import PDF_PATH
        doc = fitz.open(str(PDF_PATH))
        try:
            page = doc[135]  # d136
            width = page.rect.width
            assert 840 <= width <= 843, (
                f"d136 ancho esperado ~841.9pt (A4 landscape), obtuvo {width:.1f}pt"
            )
        finally:
            doc.close()

    def test_d136_col1_spans_not_in_col0(self):
        """Los spans con x0≈175 en d136 (Modos de conocer) deben ser col1, no col0."""
        import fitz
        from config import PDF_PATH
        doc = fitz.open(str(PDF_PATH))
        try:
            page = doc[135]  # d136
            page_width = page.rect.width
            col1_errors = []
            for blk in page.get_text("dict", sort=True).get("blocks", []):
                if blk.get("type") != 0: continue
                for ln in blk.get("lines", []):
                    for sp in ln.get("spans", []):
                        x0 = sp["bbox"][0]
                        y0 = sp["bbox"][1]
                        t = sp.get("text", "").strip()
                        if not t: continue
                        # Modos de conocer typical x0: 163-340pt
                        if 163 <= x0 <= 340 and y0 > 110:
                            col = classify_column(x0, page_width)
                            if col != 1:
                                col1_errors.append(f"x0={x0:.1f} → col{col} (expected col1)")
            assert not col1_errors, (
                f"EI-07: {len(col1_errors)} spans de Modos de conocer mal clasificados: "
                + "; ".join(col1_errors[:3])
            )
        finally:
            doc.close()

    def test_d136_col2_spans_not_in_col1(self):
        """Los spans con x0≈350 en d136 (Indicadores) deben ser col2, no col1."""
        import fitz
        from config import PDF_PATH
        doc = fitz.open(str(PDF_PATH))
        try:
            page = doc[135]
            page_width = page.rect.width
            errors = []
            for blk in page.get_text("dict", sort=True).get("blocks", []):
                if blk.get("type") != 0: continue
                for ln in blk.get("lines", []):
                    for sp in ln.get("spans", []):
                        x0 = sp["bbox"][0]
                        y0 = sp["bbox"][1]
                        t = sp.get("text", "").strip()
                        if not t: continue
                        if 340 <= x0 <= 512 and y0 > 110:
                            col = classify_column(x0, page_width)
                            if col != 2:
                                errors.append(f"x0={x0:.1f} → col{col} (expected col2)")
            assert not errors, f"EI-07: {len(errors)} spans de Indicadores mal clasificados"
        finally:
            doc.close()
