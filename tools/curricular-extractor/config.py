"""
config.py — Rutas y constantes del extractor curricular.
Ajustar PDF_PATH si el archivo está en otra ubicación.
"""

import os
from pathlib import Path

# Raíz del repositorio (dos niveles arriba de tools/curricular-extractor/)
REPO_ROOT = Path(__file__).resolve().parent.parent.parent

# Fuente documental
PDF_PATH = REPO_ROOT / "docs" / "dis-curricular-PBA-completo.pdf"
SOURCE_MANIFEST_PATH = REPO_ROOT / "docs" / "curricular" / "SOURCE_MANIFEST.json"

# SHA-256 esperado del DC PBA 2018 (de SOURCE_MANIFEST.json)
EXPECTED_SHA256 = "1c53a2cc9d8aacc1d1b4cfd6deac2af7fcdad0834d232c9c391705eb46271a38"

# Versión del extractor
EXTRACTOR_VERSION = "0.1.0-pilot"

# Regla de paginación del DC PBA 2018
PAGE_OFFSET = 1  # printed_page = digital_page - PAGE_OFFSET
MAX_DIGITAL_PAGE = 433

# Encabezados de página a filtrar (tipo D de EXTRACTION_STRATEGY.md)
RUNNING_HEADERS = {
    "Diseño Curricular para la Enseñanza Primaria · Dirección General de Cultura y Educación",
    "Diseño Curricular para la Educación Primaria",
    "Dirección General de Cultura y Educación",
}

# Directorio de salida por defecto (en scratchpad, fuera del repo)
OUTPUT_DIR = Path(os.environ.get(
    "EXTRACTOR_OUTPUT_DIR",
    REPO_ROOT / "docs" / "curricular" / "pilot_output"
))

# Mapa de códigos de área
AREA_CODES = {
    "Matemática": "MAT",
    "Prácticas del Lenguaje": "LEN",
    "Ciencias Sociales": "CSS",
    "Ciencias Naturales": "CSN",
    "Inglés": "ING",
    "Educación Artística": "ART",
    "Educación Física": "EDF",
    "Módulo Educación Inclusiva": "INC",
    "Módulo TIC": "TIC",
}

CYCLE_CODES = {
    "Primer Ciclo": "1C",
    "Segundo Ciclo": "2C",
}

YEAR_CODES = {
    1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6",
}

# Tipos de elementos y sus abreviaturas para stable_id
ELEMENT_TYPE_CODES = {
    "CONCEPT":            "CON",
    "CONTENT":            "CNT",
    "WAY_OF_KNOWING":     "MDC",
    "PROGRESS_INDICATOR": "IDA",
    "TEACHING_SITUATION": "SIT",
    "YEAR_OBJECTIVE":     "OBJ",
    "AREA_PURPOSE":       "PRO",
    "CYCLE_PURPOSE":      "CYP",
    "DIDACTIC_GUIDANCE":  "GDI",
    "EVAL_GUIDANCE":      "GEV",
    "TRANSVERSAL":        "TRV",
}

# Umbrales de coordenadas para clasificar columnas en tablas tricolumna
# (como fracción del ancho de la página, ajustados para A4 ~595pt)
# Estos son puntos de corte para x0 de cada span
TRICOLUMN_THRESHOLDS = {
    "col0_max": 0.37,   # Conceptos: x0/page_width < 0.37
    "col1_max": 0.67,   # Modos de conocer: 0.37 <= x0/page_width < 0.67
    # Indicadores: x0/page_width >= 0.67
}

# Encabezados que marcan inicio de tabla tricolumna
TRICOLUMN_HEADER_VARIANTS = [
    "Conceptos",
    "Modos de conocer",
    "Indicadores de avance",
    "CONTENIDOS",
    "INDICADORES",
]

# Tolerancia Y para agrupar spans en la misma fila (pt)
ROW_Y_TOLERANCE = 4.0

# Mínimo tamaño de fuente para considerar como heading de bloque (pt)
BLOCK_HEADING_MIN_SIZE = 10.0
