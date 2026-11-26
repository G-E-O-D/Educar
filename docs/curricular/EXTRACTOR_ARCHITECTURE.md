# Arquitectura del Extractor Curricular — Etapa 02.3

**Versión:** 0.1.0-pilot  
**Fecha:** 2026-11-26  
**Ámbito:** Extracción piloto — Matemática 4° año + verificación GC-007

---

## 1. Visión general

El extractor curricular transforma el DC PBA 2018 (PDF) en una representación estructurada de elementos y relaciones curriculares. Es un pipeline Python modular con verificación de integridad, reconstrucción de tablas y validación automática.

```
PDF (SHA-256 verificado)
      ↓
  reader.py          → verificación, apertura, conversión de páginas
      ↓
  page_extractor.py  → extracción de spans con coordenadas
      ↓
  table_reconstructor.py → reconstrucción de tabla tricolumna
      ↓
  adapters/tricolumn.py  → mapeo a ExtractedElement / ExtractedRelation
      ↓
  id_generator.py    → stable IDs reproducibles
      ↓
  validator.py        → validación de integridad
      ↓
  exporter.py         → salida JSON
```

---

## 2. Módulos

### 2.1 `config.py`
Constantes globales: rutas, SHA-256 esperado, códigos de área/ciclo/año, umbrales de columna, tolerancias.

Parámetro clave: `REPO_ROOT = Path(__file__).resolve().parent.parent.parent`  
La llamada a `.resolve()` es obligatoria; sin ella, `__file__` relativo rompe la resolución de rutas.

### 2.2 `reader.py`
- `verify_source(pdf_path)` → calcula SHA-256, lanza `SourceVerificationError` si no coincide.
- `open_document(pdf_path, skip_verify)` → abre con PyMuPDF tras verificación.
- `get_page(doc, digital_page)` → 1-indexed, valida rango `[1, 433]`.
- `digital_to_printed(d)` → `d - 1` (regla DC PBA 2018: `printed = digital - 1`).

### 2.3 `normalizer.py`
- `dehyphenate(text)` → une palabras cortadas por guión tipográfico (`ca-\nracterísticas` → `características`). Preserva guiones legítimos (sin `\n` inmediato).
- `normalize(text, strip_headers)` → pipeline: NFC → dehyphenate → strip_headers → inline_newlines → bullets → whitespace.
- `normalize_bullets(text)` → normaliza viñetas `•`, `●`, `–` a `·`.

### 2.4 `page_extractor.py`

#### Dataclasses
- `Span`: fragmento de texto con coordenadas `(x0, y0, x1, y1)`, fuente, tamaño y página digital.
- `TextRow`: grupo de spans en la misma posición Y (tolerancia `ROW_Y_TOLERANCE = 4.0 pt`).

#### Funciones
- `extract_spans(page, digital_page)` → recorre el dict de PyMuPDF extrayendo todos los spans.
- `filter_running_headers(spans, headers)` → elimina spans en la zona de encabezado de página (`y0 < 60` o texto en `RUNNING_HEADERS`).
- `group_into_rows(spans, tolerance)` → agrupa spans por proximidad Y, produce `TextRow[]`.
- `classify_column(x0, page_width)` → clasifica en columna `{0, 1, 2}` según umbrales del config.

**Umbrales (fracción de page_width):**
- col0 (Conceptos): `x0/page_width < 0.37`
- col1 (Modos de conocer): `0.37 ≤ x0/page_width < 0.67`
- col2 (Indicadores): `x0/page_width ≥ 0.67`

Límite col0/col1: `0.37 × 595 = 220.15 pt`. Spans en x0=220 caen en col0.

### 2.5 `table_reconstructor.py`

#### Dataclasses
- `RawCell`: celda con `column`, `row_index`, `spans[]`, `row_span` (celdas combinadas), `y0/y1`.
- `RawTableRow`: fila lógica con `cells: dict[int, RawCell]`.
- `RawTable`: tabla completa con `rows`, `pages`, `ambiguities`.

#### `TricolumnReconstructor.reconstruct()`
1. Recolecta spans post-encabezado (filtrados por `header_y_cutoff`).
2. Clasifica cada span en columna 0, 1 ó 2.
3. Agrupa col0 en ítems por gap vertical (`> 1.2 × font_size`).
4. Para cada ítem de col0, busca spans de col1 y col2 que solapen en Y (tolerancia 2 pt).
5. Detecta celdas combinadas: si una celda de col1 o col2 cubre el rango Y de más de una fila col0.

**Limitación conocida:** El gap mínimo para separar filas (12 pt con fuente 10 pt) puede fallar si el PDF compacta las filas con menos espacio. → Registrado como EI-04.

### 2.6 `adapters/tricolumn.py`

Mapea `RawTable` → `(list[ExtractedElement], list[ExtractedRelation])`.

- Cada span de col0 → `CONCEPT` o `CONTENT`.
- Cada span de col1 → `WAY_OF_KNOWING`.
- Cada span de col2 → `PROGRESS_INDICATOR`.
- Relaciones `CONCEPT_WAY_OF_KNOWING`: producto cartesiano de conceptos × modos de conocer en la misma fila (ver **EI-02**).
- Relaciones `CONTENT_PROGRESS_INDICATOR`: ídem para indicadores.
- Celdas con `row_span > 1` → `review_status = "pending"`.

### 2.7 `id_generator.py`

Genera stable IDs reproducibles en formato:
```
{AREA_CODE}-{CICLO_CODE}-{YEAR_CODE}-{BLQ_CODE}-{TYPE_CODE}-{SEQ:04d}
Ejemplo: MAT-2C-4-BLQ1-CON-0001
```
- Contadores independientes por prefijo `(area, ciclo, year, block_num, type)`.
- `has_conflicts()` → detecta duplicados en la misma sesión.
- El mismo generador producirá los mismos IDs para la misma secuencia de inputs (reproducible).

**Decisión DP-04:** Los IDs son específicos a la sesión de extracción. La persistencia y deduplicación entre sesiones la gestiona la tabla `import_conflicts` del schema.

### 2.8 `validator.py`

Implementa las reglas del modelo:
- `validate_element()` → página válida, offset correcto, texto no vacío, `review_status` y `element_type` válidos.
- `validate_relation()` → no auto-relación, ambos IDs existen, `PEDAGOGICALLY_INFERRED` requiere notas.
- `validate_no_duplicates()` → V-DB-09: no duplicar stable_ids.
- `validate_all()` → wrapper con resumen de errores/warnings.

### 2.9 `exporter.py`

Exporta a JSON con:
```json
{
  "schema_version": "1.0",
  "extractor_version": "0.1.0-pilot",
  "counts": { "elements": N, "relations": N, "ambiguities": N },
  "metadata": { "sha256": "...", "area": "MAT", "year": 4, ... },
  "validation": { "valid": true, "error_count": 0, ... },
  "elements": [...],
  "relations": [...]
}
```

### 2.10 `extract.py` (script principal)

Orquesta el pipeline con argumentos CLI:
- `--area MAT --year 4` (defaults)
- `--verify-gc007` → activa `verify_gc007()`
- `--scan-bounds` → solo detecta límites del área/año

Funciones clave:
- `scan_bounds()` → detecta páginas de inicio y fin del área/año buscando headings textuales en el rango conocido del área.
- `find_block_starts()` → detecta bloques buscando `BLOQUE: nombre` con regex.
- `extract_pilot()` → procesa cada bloque, reconstruye tabla, adapta y acumula.
- `verify_gc007()` → búsqueda específica de "ciclo hidrol" en d260–d290 con contexto de año.

---

## 3. Flujo de datos detallado

```
PDF (d1–d433)
 │
 ├─ verify_source() ──── SHA-256 OK
 │
 ├─ scan_bounds("MAT", 4) ─── detecta d135–d179
 │
 ├─ find_block_starts(d135, d179) ─── 20 bloques detectados
 │
 └─ Para cada bloque:
     ├─ extract_page_content(página)
     │    ├─ extract_spans()
     │    └─ filter_running_headers()
     │
     ├─ TricolumnReconstructor.reconstruct()
     │    ├─ clasifica spans en columna
     │    ├─ agrupa col0 en ítems
     │    ├─ _spans_overlapping_y() para col1 y col2
     │    └─ _detect_merged_cells()
     │
     ├─ TricolumnAdapter.adapt()
     │    ├─ crea ExtractedElement × columna
     │    └─ crea ExtractedRelation (producto cartesiano)
     │
     └─ validate_all() → export_to_json()
```

---

## 4. Decisiones de diseño adoptadas

| ID | Decisión |
|---|---|
| DP-01 | Extracción modular: un módulo por responsabilidad |
| DP-02 | Tabla tricolumna como unidad de procesamiento primaria |
| DP-03 | Stable IDs reproducibles en formato legible |
| DP-04 | JSON como formato de salida intermedio (no DB directa) |
| DP-05 | Validación integrada antes de exportar |

---

## 5. Limitaciones conocidas del piloto v0.1.0

Ver `EXTRACTION_ISSUES.md` para el detalle. Las principales:

- **EI-01**: Relaciones como producto cartesiano (22726 relaciones para 1551 elementos) — las tablas reales son más selectivas.
- **EI-02**: Bounds reales (d135–d179) mayores al estimado preliminar (d135–d146) — el área MAT 4° comprende los 3 años del Segundo Ciclo juntos.
- **EI-03**: GC-007 — año determinado como 4° es una estimación por posición; requiere revisión manual (todos los headings de año en d261).
- **EI-04**: Gap de filas — umbral 1.2 × font_size puede no separar filas muy compactas.

---

## 6. Requisitos

```
Python >= 3.12
PyMuPDF >= 2.0 (fitz / pymupdf)
pytest >= 8.0 (solo para tests)
```

Venv: `docs/.venv/` (Python 3.12.10, PyMuPDF 2.2).

---

## 7. Ejecución

```bash
# Desde la raíz del repositorio:
docs/.venv/Scripts/python.exe tools/curricular-extractor/extract.py \
    --area MAT --year 4 --verify-gc007

# Solo detectar bounds:
docs/.venv/Scripts/python.exe tools/curricular-extractor/extract.py \
    --scan-bounds

# Tests:
cd tools/curricular-extractor
../../docs/.venv/Scripts/python.exe -m pytest tests/ -v
```
