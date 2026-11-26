"""
test_reader.py — Pruebas del módulo reader (sin el PDF real).
Se testea SHA-256 incorrecto, rango de páginas inválido y lógica de paginación.
El PDF real se requiere solo para la prueba de integración marcada como skip.
"""

import sys, os, hashlib
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest

from reader import (
    compute_sha256, digital_to_printed, printed_to_digital,
    SourceVerificationError, verify_source,
)
from config import MAX_DIGITAL_PAGE, PAGE_OFFSET, EXPECTED_SHA256


# ---------------------------------------------------------------------------
# Verificación de hash
# ---------------------------------------------------------------------------

class TestComputeSha256:
    def test_known_hash(self, tmp_path):
        """Hash de archivo conocido debe ser reproducible."""
        f = tmp_path / "test.bin"
        f.write_bytes(b"datos de prueba")
        h = compute_sha256(f)
        expected = hashlib.sha256(b"datos de prueba").hexdigest()
        assert h == expected

    def test_empty_file(self, tmp_path):
        """Archivo vacío tiene hash conocido."""
        f = tmp_path / "empty.bin"
        f.write_bytes(b"")
        h = compute_sha256(f)
        assert h == hashlib.sha256(b"").hexdigest()

    def test_deterministic(self, tmp_path):
        """El mismo archivo siempre produce el mismo hash."""
        f = tmp_path / "stable.bin"
        f.write_bytes(b"contenido determinista")
        h1 = compute_sha256(f)
        h2 = compute_sha256(f)
        assert h1 == h2


class TestVerifySource:
    def test_wrong_hash_raises(self, tmp_path):
        """PDF con hash incorrecto debe lanzar SourceVerificationError."""
        fake_pdf = tmp_path / "fake.pdf"
        fake_pdf.write_bytes(b"%PDF-1.4 contenido falso")
        with pytest.raises(SourceVerificationError) as exc_info:
            verify_source(fake_pdf)
        assert "SHA-256 no coincide" in str(exc_info.value)

    def test_missing_file_raises(self, tmp_path):
        """PDF inexistente lanza SourceVerificationError."""
        missing = tmp_path / "no_existe.pdf"
        with pytest.raises(SourceVerificationError) as exc_info:
            verify_source(missing)
        assert "no encontrado" in str(exc_info.value)

    @pytest.mark.skipif(
        not Path("d:/Sistemas/Educar/docs/dis-curricular-PBA-completo.pdf").exists(),
        reason="PDF real no disponible en este entorno"
    )
    def test_real_pdf_verifies(self):
        """Prueba de integración: el PDF real pasa la verificación."""
        from config import PDF_PATH
        result = verify_source(PDF_PATH)
        assert result["verified"] is True
        assert result["sha256"] == EXPECTED_SHA256.lower()


# ---------------------------------------------------------------------------
# Conversión de páginas
# ---------------------------------------------------------------------------

class TestPageConversion:
    def test_digital_to_printed_basic(self):
        assert digital_to_printed(135) == 134

    def test_digital_to_printed_first(self):
        assert digital_to_printed(1) == 0

    def test_digital_to_printed_last(self):
        assert digital_to_printed(MAX_DIGITAL_PAGE) == MAX_DIGITAL_PAGE - PAGE_OFFSET

    def test_printed_to_digital_basic(self):
        assert printed_to_digital(134) == 135

    def test_roundtrip(self):
        for d in [1, 50, 100, 200, 300, 433]:
            assert printed_to_digital(digital_to_printed(d)) == d

    def test_page_offset_constant(self):
        """El offset es siempre 1 para DC PBA 2018."""
        assert PAGE_OFFSET == 1


# ---------------------------------------------------------------------------
# Rango de páginas (sin PDF)
# ---------------------------------------------------------------------------

class TestPageRange:
    def test_max_digital_page(self):
        assert MAX_DIGITAL_PAGE == 433

    def test_valid_pages_in_range(self):
        for page in [1, 100, 200, 300, 433]:
            assert 1 <= page <= MAX_DIGITAL_PAGE

    def test_invalid_page_above(self):
        assert not (1 <= 434 <= MAX_DIGITAL_PAGE)

    def test_invalid_page_zero(self):
        assert not (1 <= 0 <= MAX_DIGITAL_PAGE)

    def test_invalid_page_negative(self):
        assert not (1 <= -1 <= MAX_DIGITAL_PAGE)

    @pytest.mark.skipif(
        not Path("d:/Sistemas/Educar/docs/dis-curricular-PBA-completo.pdf").exists(),
        reason="PDF real no disponible en este entorno"
    )
    def test_get_page_invalid_range_raises(self):
        from config import PDF_PATH
        from reader import open_document, get_page
        doc = open_document(pdf_path=PDF_PATH, skip_verify=True)
        with pytest.raises(ValueError):
            get_page(doc, 434)
        with pytest.raises(ValueError):
            get_page(doc, 0)
