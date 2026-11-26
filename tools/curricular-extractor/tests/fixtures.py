"""
fixtures.py — Datos sintéticos para pruebas.

Principio: las fixtures son datos INVENTADOS para pruebas técnicas.
NO contienen contenido curricular real extraído del DC.
Los golden cases del DC son verificados por separado con el PDF real.
"""

from page_extractor import Span


def make_span(text: str, x0: float, y0: float, x1: float = None, y1: float = None,
              size: float = 10.0, flags: int = 0, page: int = 100) -> Span:
    """Crea un Span sintético para pruebas."""
    return Span(
        text=text,
        x0=x0, y0=y0,
        x1=x1 or x0 + len(text) * 5,
        y1=y1 or y0 + size,
        font="TestFont",
        size=size,
        flags=flags,
        page_digital=page,
    )


# Página de prueba con tabla tricolumna sintética (NO es contenido del DC)
# Coordenadas aproximadas para A4 (595pt ancho)
PAGE_WIDTH = 595.0

# Fila 1: 3 celdas independientes
TRICOLUMN_ROW1 = [
    make_span("Concepto sintético 1",    x0=40,  y0=100, x1=200, y1=115),
    make_span("Modo de conocer A",       x0=215, y0=100, x1=380, y1=115),
    make_span("Indicador alfa",          x0=400, y0=100, x1=560, y1=115),
]

# Fila 2: columna 1 combinada (cubre fila 2 y 3)
# Gap entre fila 2 (y1=135) y fila 3 (y0=165) es 30pt > umbral 12pt → reconstructor las separa
TRICOLUMN_ROW2_COL0 = make_span("Concepto sintético 2", x0=40, y0=120, x1=200, y1=135)
TRICOLUMN_ROW3_COL0 = make_span("Concepto sintético 3", x0=40, y0=165, x1=200, y1=180)
TRICOLUMN_ROW23_COL1 = make_span("Modo de conocer B (combinado)", x0=222, y0=120, x1=380, y1=180)
TRICOLUMN_ROW2_COL2 = make_span("Indicador beta",  x0=400, y0=120, x1=560, y1=135)
TRICOLUMN_ROW3_COL2 = make_span("Indicador gamma", x0=400, y0=165, x1=560, y1=180)

# Texto hiphenado sintético (NO es texto del DC)
HYPHENATED_TEXT_1 = "ca-\nracterísticas principales"
HYPHENATED_TEXT_2 = "anti-\ninflamatorio"
HYPHENATED_TEXT_3 = "socio-económico"  # guión legítimo, no hiphenación tipográfica
HYPHENATED_TEXT_4 = "re-\nconocer la importancia"

# Encabezados de página (tipo D — deben ser filtrados)
RUNNING_HEADER_1 = "Diseño Curricular para la Enseñanza Primaria · Dirección General de Cultura y Educación"
RUNNING_HEADER_2 = "Matemática"

# Elementos inválidos para pruebas de validación
INVALID_PAGE_ELEMENT = {
    "stable_id": "MAT-2C-4-BLQ1-CON-9999",
    "element_type": "CONCEPT",
    "area": "Matemática",
    "ciclo": "Segundo Ciclo",
    "year": 4,
    "year_scope": "YEAR",
    "block_name": "Test",
    "block_number": 1,
    "original_text": "Texto de prueba",
    "normalized_text": "Texto de prueba",
    "extraction_method": "MANUAL",
    "review_status": "extracted",
    "digital_page": 500,  # INVÁLIDO: > 433
    "printed_page": 499,
    "table_name": "",
    "row_index": 0,
    "column_index": 0,
    "column_name": "Conceptos",
    "bbox": None,
    "span_text": "",
    "notes": "",
}

# stable_id duplicado (para prueba de idempotencia)
DUPLICATE_ID = "MAT-2C-4-BLQ1-CON-0001"

# Texto con múltiples ítems con viñetas
MULTIITEM_TEXT = """· Primer concepto sintético del ítem
· Segundo concepto sintético del ítem
· Tercer concepto sintético del ítem"""

# Tabla que cruza dos páginas (spans de páginas distintas)
PAGE_CROSS_SPAN_PAGE1 = make_span("Concepto que continúa", x0=40, y0=750, x1=200, y1=765, page=135)
PAGE_CROSS_SPAN_PAGE2 = make_span("en la página siguiente", x0=40, y0=50,  x1=200, y1=65,  page=136)
