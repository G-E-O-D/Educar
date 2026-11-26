"""
normalizer.py — Normalización de texto extraído del PDF.

Reglas (Etapa 02.2 §9):
- Preservar íntegramente el texto original.
- Normalizar solo: espacios innecesarios, saltos de línea, guiones tipográficos,
  caracteres equivalentes.
- NO resumir ni reformular.
- NO eliminar guiones que forman parte legítima de una palabra.
- NO usar IA para reconstruir texto.
"""

import re
import unicodedata


# Guion tipográfico: aparece al final de línea cuando InDesign divide la palabra.
# Patrón: palabra termina en guion y la siguiente "palabra" comienza en minúscula.
_TYPOGRAPHIC_HYPHEN_PATTERN = re.compile(
    r'([a-záéíóúüñA-ZÁÉÍÓÚÜÑ])-\s*\n\s*([a-záéíóúüñ])',
    re.UNICODE
)

# Guión legítimo: entre palabras completas (ej. "socio-económico", "re-conocer")
# Heurística: si AMBOS lados son palabras reconocibles, es legítimo.
# No se elimina automáticamente; se conserva tal cual en normalized_text.

# Espacios múltiples
_MULTI_SPACE = re.compile(r'[ \t]+')

# Saltos de línea dentro de un bloque de texto continuo (no entre párrafos)
_INLINE_NEWLINE = re.compile(r'(?<!\n)\n(?!\n)')

# Unicode normalization (NFC = canonical composed form)
def normalize_unicode(text: str) -> str:
    return unicodedata.normalize("NFC", text)


def dehyphenate(text: str) -> str:
    """
    Reconstruye palabras divididas por guión tipográfico de maquetación.
    Solo actúa cuando el guión va seguido de salto de línea + minúscula.

    Ejemplos:
      "ca-\nracterísticas" → "características"
      "anti-\ninflamatorio" → "antiinflamatorio"

    Conserva guiones legítimos:
      "socio-económico" → "socio-económico"  (no hay salto de línea)
    """
    return _TYPOGRAPHIC_HYPHEN_PATTERN.sub(r'\1\2', text)


def collapse_whitespace(text: str) -> str:
    """Colapsa espacios y tabs múltiples a uno."""
    return _MULTI_SPACE.sub(' ', text)


def normalize_inline_newlines(text: str) -> str:
    """Convierte saltos de línea simples (no párrafos) a espacio."""
    return _INLINE_NEWLINE.sub(' ', text)


def normalize_bullets(text: str) -> str:
    """Normaliza viñetas tipográficas variantes a '·'."""
    # U+2022 •, U+00B7 ·, U+25CF ●, U+2013 – al inicio de línea
    text = re.sub(r'^[•●]\s*', '· ', text, flags=re.MULTILINE)
    return text


def strip_running_headers(text: str, headers: set) -> str:
    """Elimina encabezados de página repetidos si aparecen en el texto."""
    for h in headers:
        text = text.replace(h, '')
    return text


def normalize(original_text: str, strip_headers: set | None = None) -> str:
    """
    Pipeline completo de normalización.
    Entrada: texto tal como sale del PDF (original_text).
    Salida: texto normalizado para almacenar en normalized_text.
    """
    text = normalize_unicode(original_text)
    text = dehyphenate(text)
    if strip_headers:
        text = strip_running_headers(text, strip_headers)
    text = normalize_inline_newlines(text)
    text = normalize_bullets(text)
    text = collapse_whitespace(text)
    text = text.strip()
    return text


def is_likely_hyphenation(line: str, next_line_first_word: str) -> bool:
    """
    Heurística adicional: dado el final de una línea y la primera palabra
    de la siguiente, determina si el guión final es tipográfico.
    """
    if not line.endswith('-'):
        return False
    # Si la primera palabra de la siguiente comienza en minúscula,
    # probablemente es continuación
    if next_line_first_word and next_line_first_word[0].islower():
        return True
    return False
