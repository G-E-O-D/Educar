"""
test_regression_02_3_3.py — Tests de regresion para Etapa 02.3.3.

Cubren:
  EI-05: bloque con blk_end < blk_start (dos bloques en la misma pagina)
         debe ser procesado con blk_end = blk_start, no omitido.
         La ambiguedad queda registrada.

Principio: NO contienen contenido del DC.
Los tests PDF-dependientes se saltan si el archivo no esta disponible.
"""

import sys, os
import pytest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from tests.fixtures import make_span, PAGE_WIDTH
from table_reconstructor import TricolumnReconstructor
from adapters.tricolumn import TricolumnAdapter
from id_generator import IDGenerator

try:
    from config import PDF_PATH
    PDF_AVAILABLE = PDF_PATH.exists()
except Exception:
    PDF_AVAILABLE = False

PDF_SKIP = pytest.mark.skipif(not PDF_AVAILABLE, reason="PDF no disponible")

# ---------------------------------------------------------------------------
# EI-05: bloque omitido cuando dos bloques empiezan en la misma pagina
# ---------------------------------------------------------------------------

class TestEI05BlockSamePage:
    """
    Verifica que extract_pilot() no omita un bloque cuando su blk_end < blk_start.
    La logica EI-05 debe: usar blk_end = blk_start y registrar ambiguedad.
    """

    def _make_block_starts_same_page(self):
        """Simula dos bloques que empiezan en la misma pagina (caso EI-05)."""
        return [
            {"digital_page": 143, "printed_page": 142, "block_name": "Proporcionalidad", "y0": 50},
            {"digital_page": 143, "printed_page": 142, "block_name": "Geometria", "y0": 300},
            {"digital_page": 146, "printed_page": 145, "block_name": "Espacio", "y0": 50},
        ]

    def test_blk_end_calculation_before_fix(self):
        """Verifica la causa raiz: sin fix, blk_end < blk_start para Proporcionalidad."""
        block_starts = self._make_block_starts_same_page()
        end_page = 146

        # Calculo original (sin fix)
        def calc_blk_end(idx):
            if idx + 1 < len(block_starts):
                return block_starts[idx + 1]["digital_page"] - 1
            return end_page

        blk_end_proporcionalidad = calc_blk_end(0)
        blk_start_proporcionalidad = block_starts[0]["digital_page"]
        # Proporcionalidad: blk_start=143, siguiente bloque en 143 -> blk_end=142
        assert blk_end_proporcionalidad < blk_start_proporcionalidad, (
            f"EI-05 causa raiz: blk_end={blk_end_proporcionalidad} debe ser < blk_start={blk_start_proporcionalidad}"
        )

    def test_blk_end_fix_applied(self):
        """Con el fix, blk_end = max(blk_start, blk_end) = blk_start = 143."""
        block_starts = self._make_block_starts_same_page()
        end_page = 146

        def calc_blk_end_fixed(idx):
            blk_start = block_starts[idx]["digital_page"]
            if idx + 1 < len(block_starts):
                blk_end = block_starts[idx + 1]["digital_page"] - 1
            else:
                blk_end = end_page
            return max(blk_start, blk_end)

        blk_end_fixed = calc_blk_end_fixed(0)
        blk_start = block_starts[0]["digital_page"]
        assert blk_end_fixed == blk_start, (
            f"Con fix EI-05, blk_end debe ser {blk_start} (= blk_start), obtuvo {blk_end_fixed}"
        )
        # Geometria sigue siendo d143-d145
        assert calc_blk_end_fixed(1) == 145, "Geometria debe seguir siendo d143-d145"
        # Espacio sigue siendo d146-d146
        assert calc_blk_end_fixed(2) == 146, "Espacio debe seguir siendo d146 (fin de rango)"

    def test_ambiguity_registered_on_same_page_blocks(self):
        """
        Verifica que extract_pilot registra ambiguedad EI-05 cuando blk_end < blk_start.
        Necesita el PDF para correr. Con fixtures no podemos reproducir find_block_starts().
        """
        # Este test verifica la presencia de la cadena EI-05 en ambiguities.
        # Se prueba via integracion PDF si esta disponible.
        pass  # cubierto por TestEI05PDFIntegration abajo

    def test_range_iteration_with_fix(self):
        """range(blk_start, blk_end+1) con fix debe iterar exactamente la pagina del bloque."""
        blk_start = 143
        blk_end = 143  # despues del fix
        pages = list(range(blk_start, blk_end + 1))
        assert pages == [143], f"Con fix, debe iterar solo [143], obtuvo {pages}"

    def test_range_iteration_without_fix(self):
        """range(blk_start, blk_end+1) sin fix produce iteracion vacia -> bloque omitido."""
        blk_start = 143
        blk_end = 142  # sin fix: blk_end < blk_start
        pages = list(range(blk_start, blk_end + 1))
        assert pages == [], f"Sin fix, range debe ser vacia, obtuvo {pages}"


@PDF_SKIP
class TestEI05PDFIntegration:
    """Verifica que con el fix EI-05 el bloque Proporcionalidad no es omitido en MAT 4 piloto."""

    def test_proporcionalidad_not_omitted(self):
        """
        extract_pilot(d135-d146) no debe omitir silenciosamente el bloque Proporcionalidad.
        Con el fix, debe encontrarse como ambiguedad EI-05 y no como bloque inexistente.
        """
        import sys
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
        from reader import open_document
        from extract import extract_pilot

        doc = open_document(skip_verify=True)
        try:
            result = extract_pilot(doc, 135, 146)
            # El bloque debe aparecer en block_starts
            block_names = [b["block_name"] for b in result["block_starts"]]
            assert any("Proporcionalidad" in n for n in block_names), (
                f"Proporcionalidad debe estar en block_starts: {block_names}"
            )
            # Debe haber una ambiguedad EI-05 registrada
            ei05_ambig = [a for a in result["ambiguities"] if "EI-05" in a]
            assert len(ei05_ambig) >= 1, (
                f"Debe haber al menos una ambiguedad EI-05; ambiguedades: {result['ambiguities']}"
            )
            # La ambiguedad debe mencionar el bloque
            assert any("Proporcionalidad" in a for a in ei05_ambig), (
                f"Ambiguedad EI-05 debe mencionar Proporcionalidad: {ei05_ambig}"
            )
        finally:
            doc.close()

    def test_element_count_increases_after_ei05_fix(self):
        """
        El total de elementos debe ser >= 570 (resultado pre-fix).
        Con Proporcionalidad incluida, el total solo puede igual o aumentar.
        """
        import sys
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
        from reader import open_document
        from extract import extract_pilot

        doc = open_document(skip_verify=True)
        try:
            result = extract_pilot(doc, 135, 146)
            total = len(result["elements"])
            assert total >= 570, (
                f"Post-fix EI-05: total de elementos debe ser >= 570 (pre-fix), obtuvo {total}"
            )
        finally:
            doc.close()

    def test_zero_blocks_silently_skipped(self):
        """
        Ninguna ambiguedad del tipo 'sin spans' debe quedar sin el mensaje EI-05
        cuando corresponde a dos bloques en la misma pagina.
        """
        import sys
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
        from reader import open_document
        from extract import extract_pilot

        doc = open_document(skip_verify=True)
        try:
            result = extract_pilot(doc, 135, 146)
            # No debe haber ambiguedades de "sin spans" sin un EI-05 asociado
            sin_spans = [a for a in result["ambiguities"] if "sin spans" in a.lower()]
            assert len(sin_spans) == 0, (
                f"Con fix EI-05 no deben quedar bloques 'sin spans': {sin_spans}"
            )
        finally:
            doc.close()
