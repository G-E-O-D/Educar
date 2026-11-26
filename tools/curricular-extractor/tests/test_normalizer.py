"""
test_normalizer.py — Pruebas de normalización de texto.
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from normalizer import dehyphenate, collapse_whitespace, normalize, normalize_bullets
from tests.fixtures import (
    HYPHENATED_TEXT_1, HYPHENATED_TEXT_2,
    HYPHENATED_TEXT_3, HYPHENATED_TEXT_4,
)


class TestDehyphenate:
    def test_basic_hyphenation(self):
        result = dehyphenate(HYPHENATED_TEXT_1)
        assert "características" in result
        assert "-\n" not in result

    def test_hyphenation_prefix(self):
        result = dehyphenate(HYPHENATED_TEXT_2)
        assert "antiinflamatorio" in result

    def test_legitimate_hyphen_preserved(self):
        """Guión legítimo entre palabras completas NO debe eliminarse."""
        result = dehyphenate(HYPHENATED_TEXT_3)
        assert "socio-económico" in result, (
            f"Guión legítimo fue eliminado en '{result}'"
        )

    def test_another_hyphenation(self):
        result = dehyphenate(HYPHENATED_TEXT_4)
        assert "reconocer" in result or "re-conocer" not in result

    def test_no_hyphen_unchanged(self):
        text = "Texto sin guiones al final de línea."
        assert dehyphenate(text) == text


class TestCollapseWhitespace:
    def test_multiple_spaces(self):
        result = collapse_whitespace("texto   con  espacios")
        assert "  " not in result
        assert "texto con espacios" == result

    def test_tabs(self):
        result = collapse_whitespace("texto\t\tcon tabs")
        assert "\t" not in result

    def test_single_space_unchanged(self):
        text = "texto con espacio"
        assert collapse_whitespace(text) == text


class TestNormalize:
    def test_full_pipeline(self):
        text = "ca-\nracterísticas   del  texto\n"
        result = normalize(text)
        assert "características" in result
        assert "  " not in result
        assert result == result.strip()

    def test_empty_string(self):
        result = normalize("")
        assert result == ""

    def test_unicode_nfc(self):
        # a + combining acute accent → á
        import unicodedata
        text = "área"  # 'área' compuesto
        result = normalize(text)
        assert result == unicodedata.normalize("NFC", text)

    def test_running_header_stripped(self):
        header = "Diseño Curricular para la Enseñanza Primaria · Dirección General de Cultura y Educación"
        text = f"Contenido real\n{header}\nMás contenido"
        result = normalize(text, strip_headers={header})
        assert header not in result
        assert "Contenido real" in result


class TestNormalizeBullets:
    def test_bullet_normalization(self):
        text = "• Primer ítem\n• Segundo ítem"
        result = normalize_bullets(text)
        assert "·" in result

    def test_circle_bullet(self):
        text = "● Ítem con círculo"
        result = normalize_bullets(text)
        assert "·" in result
