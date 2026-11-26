# VALIDATION_RULES.md — Controles de integridad y casos de prueba
**Etapa 02.2 · Fecha: 2026-11-26**

---

## 1. Restricciones de integridad en base de datos

### V-DB-01 — Todo elemento tiene al menos un source_ref

**Regla:** `curriculum_elements` sin registros en `element_source_refs` no debe existir.  
**Implementación:** trigger AFTER INSERT/UPDATE en `curriculum_elements` que verifique COUNT en `element_source_refs`.  
**Alternativa más simple:** check diferido en la transacción de importación.

```sql
-- Trigger de verificación (referencia, no ejecutar)
CREATE OR REPLACE FUNCTION check_element_has_source_ref()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM element_source_refs WHERE element_id = NEW.id
    ) THEN
        RAISE EXCEPTION 'Element % has no source_ref', NEW.stable_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### V-DB-02 — Páginas dentro del rango válido del documento fuente

**Regla para DC PBA 2018:** `digital_page BETWEEN 1 AND 433`.  
**Implementación:** función de validación que toma el `source_id` del `element_source_refs` y verifica el rango contra un campo `max_pages` en `document_sources` (agregar en versión final).  
**Estado actual:** `CHECK (digital_page > 0)` en el schema; rango máximo pendiente de parametrización por fuente.

---

### V-DB-03 — Regla de desplazamiento de paginación por fuente

**Regla para DC PBA 2018:** `printed_page = digital_page - 1`.  
**Implementación:** trigger condicional que verifica la regla solo para registros con `source_id = DC-PBA-PRIMARY-2018`.  
**Nota:** otras fuentes pueden tener reglas distintas; no aplicar globalmente.

---

### V-DB-04 — Sub-áreas requieren área padre

**Regla:** `area_kind = 'SUBAREA' → parent_area_id IS NOT NULL`.  
**Implementación:** CHECK en `curriculum_areas` (ya incluida en SCHEMA_DRAFT.sql).

---

### V-DB-05 — Registros replaced apuntan a sucesor

**Regla:** `review_status = 'replaced' → replaced_by_id IS NOT NULL`.  
**Implementación:** CHECK en `curriculum_elements` (ya incluida en SCHEMA_DRAFT.sql).

---

### V-DB-06 — Registros ambiguous tienen notas

**Regla:** `review_status = 'ambiguous' → notes IS NOT NULL`.  
**Implementación:** CHECK en `curriculum_elements` (ya incluida en SCHEMA_DRAFT.sql).

---

### V-DB-07 — Relaciones inferenciales documentadas

**Regla:** `relation_basis = 'PEDAGOGICALLY_INFERRED' → notes IS NOT NULL`.  
**Implementación:** CHECK en `element_relations` (ya incluida en SCHEMA_DRAFT.sql).

---

### V-DB-08 — Sin auto-relaciones

**Regla:** `source_element_id <> target_element_id`.  
**Implementación:** CHECK en `element_relations` (ya incluida en SCHEMA_DRAFT.sql).

---

### V-DB-09 — Idempotencia de importación

**Regla:** una reimportación del mismo documento (mismo `sha256`) no crea duplicados.  
**Implementación:**  
- `stable_id` tiene restricción `UNIQUE`; un `INSERT` con `stable_id` duplicado falla o se ignora con `ON CONFLICT DO NOTHING`
- El script de importación verifica primero si ya existe el `document_sources.sha256`; si coincide, solo actualiza timestamps

---

### V-DB-10 — Columna válida en element_source_refs

**Regla para tablas tricolumnas:** `column_index IN (0, 1, 2)`.  
**Implementación:** CHECK en `element_source_refs` (ya incluida en SCHEMA_DRAFT.sql).

---

## 2. Validaciones de negocio en la aplicación (no en DB)

### V-APP-01 — Solo validados llegan a la interfaz docente

```
SELECT * FROM curriculum_elements WHERE review_status = 'validated';
```

**Tests requeridos:**
- [ ] Consulta de área + ciclo + año devuelve 0 registros `extracted`
- [ ] Consulta de área + ciclo + año devuelve 0 registros `rejected`
- [ ] Registros `ambiguous` no aparecen en resultados de búsqueda

---

### V-APP-02 — Los alias no crean equivalencias pedagógicas automáticas

**Regla:** cuando un alias `SEARCH_ALIAS` expande la consulta, el resultado muestra el `canonical_term` del DC, no el alias del usuario.  
**Test:**
- Entrada: "ciclo del agua" → el resultado muestra texto con "ciclo hidrológico"
- El sistema no afirma que "ciclo del agua" sea el término curricular oficial

---

### V-APP-03 — Inferencias no se presentan como texto oficial

**Regla:** elementos con `relation_basis = 'PEDAGOGICALLY_INFERRED'` deben presentarse con indicador visual de "relación inferida".  
**Test:**
- Relación de progresión fracciones 3°→4° se muestra con tag "inferido / no expresado en el DC"

---

## 3. Casos de prueba estructurales (futuras pruebas de regresión)

### T-01 — GC-007: ciclo hidrológico representable sin año exacto

**Input:** elemento con `year_scope = 'CYCLE'`, `cycle_id = PBA-PRIMARY-C2`, `element_type = 'TEACHING_SITUATION'`.  
**Expected:** se recupera al filtrar por área=Ciencias Naturales, ciclo=Segundo Ciclo.  
**Expected:** no se recupera al filtrar por año=4° específico.  
**Expected:** `review_status = 'ambiguous'`, `notes` menciona I-09 y GC-007.

---

### T-02 — GC-008/009/010: progresión de fracciones tiene 3 nodos

**Input:** 3 elementos con `element_type = 'CONCEPT'`, área=Matemática, mismos `canonical_term`.  
**Expected:** existen 2 relaciones `YEAR_PROGRESSION` (`3°→4°`, `4°→5°/6°`).  
**Expected:** ambas con `relation_basis = 'PEDAGOGICALLY_INFERRED'` y `notes IS NOT NULL`.  
**Expected:** no existe relación `YEAR_PROGRESSION` directa `3°→5°` (salta un año).

---

### T-03 — GC-011/012: ortografía no tiene bloque separado

**Input:** búsqueda de elementos con `normalized_text ILIKE '%ortografía%'` en área=PdL.  
**Expected:** todos los resultados tienen `block_id` que apunta a un bloque de tipo "Reflexión sobre el lenguaje".  
**Expected:** ningún resultado tiene `element_type = 'CONCEPT'` en un bloque titulado "Ortografía".

---

### T-04 — GC-013: Ed. Inclusiva aplica a todo el nivel

**Input:** elemento del módulo Ed. Inclusiva.  
**Expected:** `year_scope = 'DOCUMENT'`.  
**Expected:** no tiene `block_id` (NULL).  
**Expected:** se recupera al consultar cualquier área/ciclo/año (vía filtro transversal).

---

### T-05 — GC-001 a GC-006: Ciencias Sociales 4° tiene 2 bloques con relaciones SOURCE_EXPRESSED

**Input:** área=Ciencias Sociales, año=4°.  
**Expected:** existen al menos 2 bloques distintos.  
**Expected:** existen relaciones `CONCEPT_WAY_OF_KNOWING` con `relation_basis = 'SOURCE_EXPRESSED'` para los conceptos de cada bloque.  
**Expected:** la `source_ref` de cada relación apunta a las páginas 201–205 (digital).

---

### T-06 — Reimportación idempotente

**Input:** ejecutar script de importación del DC PBA 2018 dos veces con el mismo hash SHA-256.  
**Expected:** el número de registros en `curriculum_elements` es igual antes y después de la segunda importación.  
**Expected:** no hay errores de llave duplicada.

---

### T-07 — Elemento sin source_ref es rechazado

**Input:** INSERT de un `curriculum_element` sin crear el correspondiente `element_source_refs`.  
**Expected:** la transacción falla / el trigger lanza excepción.

---

### T-08 — Página fuera de rango es rechazada

**Input:** INSERT en `element_source_refs` con `digital_page = 500` para DC PBA 2018 (max = 433).  
**Expected:** la validación falla con error descriptivo.

---

### T-09 — Alias AMBIGUOUS sin notes es rechazado

**Input:** INSERT en `term_aliases` con `alias_kind = 'AMBIGUOUS'` y `notes = NULL`.  
**Expected:** CHECK constraint falla.

---

### T-10 — FEyC no tiene área_kind = AREA

**Input:** consulta sobre `curriculum_areas` con `official_name ILIKE '%Formación Ética%'`.  
**Expected:** `area_kind = 'TRANSVERSAL_CONTENT'`, no `'AREA'`.

---

## 4. Validaciones pre-publicación de contenido extraído

Antes de marcar cualquier elemento como `validated`, verificar:

- [ ] `original_text` corresponde con el texto real en el PDF (verificación por muestra)
- [ ] `digital_page` y `printed_page` son correctos (verificación puntual)
- [ ] `column_name` corresponde al tipo de elemento (ej. `CONCEPT` en columna 0)
- [ ] Las celdas combinadas tienen múltiples relaciones documentadas, no una sola
- [ ] Las palabras hiphenadas en `original_text` fueron reconstruidas en `normalized_text`
- [ ] Los encabezados repetidos (tipo D) no fueron incluidos como elementos de contenido
- [ ] No existen duplicados por `stable_id`
- [ ] Los elementos de un ciclo completo tienen `year_scope = 'CYCLE'` (no `YEAR`)
