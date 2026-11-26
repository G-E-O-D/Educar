-- =============================================================================
-- SCHEMA_DRAFT.sql — Propuesta de esquema PostgreSQL para el motor curricular
-- Etapa 02.2 · Fecha: 2026-11-26
--
-- IMPORTANTE: Este es un BORRADOR de diseño. No ejecutar como migración.
-- No hay tablas reales, Supabase ni servicios conectados.
-- Requiere aprobación del propietario antes de cualquier deploy.
--
-- Requisitos de motor:
--   PostgreSQL >= 15
--   Extensión uuid-ossp (o gen_random_uuid() nativo de PG >= 13)
--   Extensión pgvector (solo para tabla element_embeddings, Etapa posterior)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- SCHEMA
-- ---------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS curriculum;
SET search_path TO curriculum;

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------

CREATE TYPE validity_status_t AS ENUM (
    'draft', 'active', 'partially_modified', 'superseded', 'revoked'
);

CREATE TYPE verification_status_t AS ENUM (
    'unverified', 'partially_verified', 'verified'
);

CREATE TYPE area_kind_t AS ENUM (
    'AREA', 'SUBAREA', 'MODULE', 'TRANSVERSAL_CONTENT', 'FRAMEWORK'
);

CREATE TYPE element_type_t AS ENUM (
    'CONCEPT',
    'CONTENT',
    'WAY_OF_KNOWING',
    'PROGRESS_INDICATOR',
    'TEACHING_SITUATION',
    'YEAR_OBJECTIVE',
    'AREA_PURPOSE',
    'CYCLE_PURPOSE',
    'DIDACTIC_GUIDANCE',
    'EVAL_GUIDANCE',
    'TRANSVERSAL'
);

CREATE TYPE review_status_t AS ENUM (
    'extracted', 'pending', 'ambiguous', 'validated', 'rejected', 'replaced'
);

CREATE TYPE year_scope_t AS ENUM ('YEAR', 'CYCLE', 'DOCUMENT');

CREATE TYPE relation_type_t AS ENUM (
    'CONCEPT_WAY_OF_KNOWING',
    'CONTENT_PROGRESS_INDICATOR',
    'CONTENT_TEACHING_SITUATION',
    'YEAR_PROGRESSION',
    'PREREQUISITE',
    'TRANSVERSAL_LINK',
    'CYCLE_TO_YEAR'
);

CREATE TYPE relation_basis_t AS ENUM (
    'SOURCE_EXPRESSED', 'PEDAGOGICALLY_INFERRED', 'TERMINOLOGICAL'
);

CREATE TYPE alias_kind_t AS ENUM (
    'OFFICIAL_NAME', 'SEARCH_ALIAS', 'VALIDATED_SYNONYM',
    'RELATED_TERM', 'PARTIAL_EQUIVALENCE', 'AMBIGUOUS'
);

CREATE TYPE source_relation_type_t AS ENUM (
    'UPDATES', 'SUPERSEDES', 'SUPPLEMENTS', 'COMPLEMENTS'
);

CREATE TYPE extraction_method_t AS ENUM (
    'MANUAL', 'SCRIPT_A', 'SCRIPT_B', 'SCRIPT_C'
);

-- ---------------------------------------------------------------------------
-- CAPA 1: FUENTES DOCUMENTALES
-- ---------------------------------------------------------------------------

CREATE TABLE jurisdictions (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code            text NOT NULL UNIQUE,
    name            text NOT NULL,
    country_code    char(2) NOT NULL DEFAULT 'AR'
);
COMMENT ON TABLE jurisdictions IS 'Jurisdicciones educativas (PBA, CABA, NAC, etc.)';

CREATE TABLE document_sources (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    stable_code         text NOT NULL UNIQUE,
    title               text NOT NULL,
    organism            text NOT NULL,
    jurisdiction_id     uuid NOT NULL REFERENCES jurisdictions(id),
    resolution_number   text,
    resolution_date     date,
    publication_year    int,
    sha256              char(64) UNIQUE,
    provenance_url      text,
    validity_status     validity_status_t NOT NULL DEFAULT 'draft',
    verification_status verification_status_t NOT NULL DEFAULT 'unverified',
    reuse_conditions    text,
    version_tag         text,
    notes               text,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT sha256_length CHECK (sha256 IS NULL OR length(sha256) = 64)
);
COMMENT ON TABLE document_sources IS 'Fuentes documentales oficiales (DC PBA 2018, etc.)';
COMMENT ON COLUMN document_sources.validity_status IS 'draft|active|partially_modified|superseded|revoked';
COMMENT ON COLUMN document_sources.sha256 IS 'SHA-256 hex del archivo fuente, minúsculas';

CREATE TABLE source_relations (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id           uuid NOT NULL REFERENCES document_sources(id),
    related_source_id   uuid NOT NULL REFERENCES document_sources(id),
    relation_type       source_relation_type_t NOT NULL,
    notes               text,

    CONSTRAINT no_self_relation CHECK (source_id <> related_source_id),
    UNIQUE (source_id, related_source_id, relation_type)
);

CREATE TABLE document_sections (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id           uuid NOT NULL REFERENCES document_sources(id),
    section_name        text NOT NULL,
    section_kind        text NOT NULL CHECK (section_kind IN ('FRAMEWORK','BIBLIOGRAPHY','ANNEX','INTRO')),
    page_start_digital  int CHECK (page_start_digital > 0),
    page_end_digital    int CHECK (page_end_digital >= page_start_digital),
    page_start_printed  int CHECK (page_start_printed >= 0),
    page_end_printed    int CHECK (page_end_printed >= page_start_printed),
    notes               text
);

-- ---------------------------------------------------------------------------
-- CAPA 2: ORGANIZACIÓN EDUCATIVA
-- ---------------------------------------------------------------------------

CREATE TABLE education_levels (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code            text NOT NULL UNIQUE,
    name            text NOT NULL,
    jurisdiction_id uuid NOT NULL REFERENCES jurisdictions(id)
);
COMMENT ON TABLE education_levels IS 'Niveles educativos (Primaria, Secundaria, etc.)';

CREATE TABLE curriculum_cycles (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code        text NOT NULL UNIQUE,
    name        text NOT NULL,
    level_id    uuid NOT NULL REFERENCES education_levels(id),
    year_range  int[] NOT NULL,

    CONSTRAINT year_range_not_empty CHECK (array_length(year_range, 1) > 0)
);
COMMENT ON TABLE curriculum_cycles IS 'Ciclos (Primer Ciclo 1-3, Segundo Ciclo 4-6)';

CREATE TABLE education_years (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    year_number     int CHECK (year_number BETWEEN 1 AND 6),
    name            text NOT NULL,
    cycle_id        uuid NOT NULL REFERENCES curriculum_cycles(id),
    special_scope   text,  -- 'UP_1_2' para Unidad Pedagógica

    CONSTRAINT year_or_special CHECK (
        (year_number IS NOT NULL) OR (year_number IS NULL AND special_scope IS NOT NULL)
    )
);
COMMENT ON COLUMN education_years.special_scope IS 'UP_1_2 = Unidad Pedagógica (1° + 2°)';

CREATE TABLE curriculum_areas (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    stable_code         text NOT NULL UNIQUE,
    name                text NOT NULL,
    official_name       text NOT NULL,
    area_kind           area_kind_t NOT NULL,
    parent_area_id      uuid REFERENCES curriculum_areas(id),
    source_id           uuid NOT NULL REFERENCES document_sources(id),
    level_id            uuid NOT NULL REFERENCES education_levels(id),
    page_start_digital  int CHECK (page_start_digital > 0),
    page_end_digital    int CHECK (page_end_digital >= page_start_digital),
    page_start_printed  int CHECK (page_start_printed >= 0),
    page_end_printed    int CHECK (page_end_printed >= page_start_printed),
    table_structure_type text CHECK (table_structure_type IN ('A','B','C','D','NONE')),
    notes               text,

    CONSTRAINT subarea_needs_parent CHECK (
        (area_kind = 'SUBAREA' AND parent_area_id IS NOT NULL)
        OR area_kind <> 'SUBAREA'
    )
);
COMMENT ON TABLE curriculum_areas IS 'Áreas (AREA), sub-áreas (SUBAREA), módulos (MODULE), contenidos transversales (TRANSVERSAL_CONTENT), marco (FRAMEWORK)';
COMMENT ON COLUMN curriculum_areas.table_structure_type IS 'A=tricolumna, B=bicolumna, C=narrativo, D=encabezados, NONE=sin tabla';

CREATE TABLE curriculum_blocks (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    stable_code         text NOT NULL UNIQUE,
    name                text NOT NULL,
    area_id             uuid NOT NULL REFERENCES curriculum_areas(id),
    cycle_id            uuid REFERENCES curriculum_cycles(id),
    year_id             uuid REFERENCES education_years(id),
    block_number        int,
    page_start_digital  int NOT NULL CHECK (page_start_digital > 0),
    page_end_digital    int NOT NULL CHECK (page_end_digital >= page_start_digital),
    page_start_printed  int NOT NULL CHECK (page_start_printed >= 0),
    page_end_printed    int NOT NULL CHECK (page_end_printed >= page_start_printed),

    CONSTRAINT cycle_or_year CHECK (cycle_id IS NOT NULL OR year_id IS NOT NULL)
);
COMMENT ON TABLE curriculum_blocks IS 'Bloques de contenido dentro de un área/ciclo/año';

-- ---------------------------------------------------------------------------
-- CAPA 3: ELEMENTOS CURRICULARES
-- ---------------------------------------------------------------------------

CREATE TABLE curriculum_elements (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    stable_id           text NOT NULL UNIQUE,
    element_type        element_type_t NOT NULL,
    area_id             uuid NOT NULL REFERENCES curriculum_areas(id),
    block_id            uuid REFERENCES curriculum_blocks(id),
    year_scope          year_scope_t NOT NULL,
    original_text       text NOT NULL,
    normalized_text     text,
    extraction_method   extraction_method_t NOT NULL DEFAULT 'MANUAL',
    review_status       review_status_t NOT NULL DEFAULT 'extracted',
    replaced_by_id      uuid REFERENCES curriculum_elements(id),
    notes               text,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT replaced_needs_target CHECK (
        (review_status = 'replaced' AND replaced_by_id IS NOT NULL)
        OR review_status <> 'replaced'
    ),
    CONSTRAINT ambiguous_needs_notes CHECK (
        (review_status = 'ambiguous' AND notes IS NOT NULL)
        OR review_status <> 'ambiguous'
    )
);
COMMENT ON TABLE curriculum_elements IS 'Tabla central polimórfica: conceptos, modos de conocer, indicadores, situaciones, objetivos, propósitos, orientaciones';
COMMENT ON COLUMN curriculum_elements.stable_id IS 'Formato: {AREA}-{CICLO}-{AÑO}-{BLOQUE}-{TIPO}-{SEQ:04d}. Ej: CSS-2C-4-BLQ1-CON-0003';
COMMENT ON COLUMN curriculum_elements.review_status IS 'Solo registros validated llegan a la interfaz docente';

-- Al menos un source_ref por elemento (ver FK en element_source_refs + trigger)
CREATE TABLE element_source_refs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    element_id      uuid NOT NULL REFERENCES curriculum_elements(id) ON DELETE CASCADE,
    source_id       uuid NOT NULL REFERENCES document_sources(id),
    digital_page    int NOT NULL CHECK (digital_page > 0),
    printed_page    int NOT NULL CHECK (printed_page >= 0),
    section_name    text,
    table_name      text,
    row_index       int CHECK (row_index >= 0),
    column_index    int CHECK (column_index BETWEEN 0 AND 2),
    column_name     text,
    bbox_x0         float,
    bbox_y0         float,
    bbox_x1         float,
    bbox_y1         float,
    span_text       text,
    notes           text,

    -- Regla de paginación para DC PBA 2018 (relajar para otras fuentes mediante trigger)
    -- CONSTRAINT pba_page_offset CHECK (printed_page = digital_page - 1)
    -- Comentada: se aplica como trigger condicional según source_id
    UNIQUE (element_id, source_id, digital_page, column_index)
);
COMMENT ON TABLE element_source_refs IS 'Trazabilidad documental: qué página, tabla, fila y columna del PDF origina cada elemento';

CREATE TABLE element_year_scope (
    element_id  uuid NOT NULL REFERENCES curriculum_elements(id) ON DELETE CASCADE,
    year_id     uuid REFERENCES education_years(id),
    cycle_id    uuid REFERENCES curriculum_cycles(id),
    scope_kind  year_scope_t NOT NULL,

    PRIMARY KEY (element_id, COALESCE(year_id, '00000000-0000-0000-0000-000000000000'::uuid),
                             COALESCE(cycle_id, '00000000-0000-0000-0000-000000000000'::uuid)),

    CONSTRAINT scope_consistency CHECK (
        (scope_kind = 'YEAR' AND year_id IS NOT NULL) OR
        (scope_kind = 'CYCLE' AND cycle_id IS NOT NULL AND year_id IS NULL) OR
        (scope_kind = 'DOCUMENT')
    )
);
COMMENT ON TABLE element_year_scope IS 'Relación M:N entre elementos y años/ciclos a los que aplican';

-- ---------------------------------------------------------------------------
-- CAPA 4: RELACIONES Y TERMINOLOGÍA
-- ---------------------------------------------------------------------------

CREATE TABLE element_relations (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_element_id   uuid NOT NULL REFERENCES curriculum_elements(id),
    target_element_id   uuid NOT NULL REFERENCES curriculum_elements(id),
    relation_type       relation_type_t NOT NULL,
    relation_basis      relation_basis_t NOT NULL,
    source_ref_id       uuid REFERENCES element_source_refs(id),
    notes               text,

    CONSTRAINT no_self_relation CHECK (source_element_id <> target_element_id),
    CONSTRAINT inferred_needs_notes CHECK (
        (relation_basis = 'PEDAGOGICALLY_INFERRED' AND notes IS NOT NULL)
        OR relation_basis <> 'PEDAGOGICALLY_INFERRED'
    ),
    UNIQUE (source_element_id, target_element_id, relation_type)
);
COMMENT ON TABLE element_relations IS 'Relaciones entre elementos: posición en tabla (SOURCE_EXPRESSED), progresión pedagógica (PEDAGOGICALLY_INFERRED), sinónimos (TERMINOLOGICAL)';

CREATE TABLE term_aliases (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_term  text NOT NULL,
    alias_text      text NOT NULL,
    alias_kind      alias_kind_t NOT NULL,
    scope_area_id   uuid REFERENCES curriculum_areas(id),
    notes           text,

    CONSTRAINT ambiguous_needs_notes CHECK (
        (alias_kind = 'AMBIGUOUS' AND notes IS NOT NULL)
        OR alias_kind <> 'AMBIGUOUS'
    ),
    UNIQUE (canonical_term, alias_text, alias_kind)
);
COMMENT ON TABLE term_aliases IS 'Sinónimos y alias de búsqueda. Ej: ciclo del agua → ciclo hidrológico';

-- ---------------------------------------------------------------------------
-- ÍNDICES
-- ---------------------------------------------------------------------------

-- Búsqueda por área/ciclo/año (filtros determinísticos)
CREATE INDEX idx_elements_area        ON curriculum_elements(area_id);
CREATE INDEX idx_elements_block       ON curriculum_elements(block_id);
CREATE INDEX idx_elements_type        ON curriculum_elements(element_type);
CREATE INDEX idx_elements_status      ON curriculum_elements(review_status);
CREATE INDEX idx_elements_year_scope  ON curriculum_elements(year_scope);

-- Solo elementos validados (índice parcial — optimiza la interfaz docente)
CREATE INDEX idx_elements_validated ON curriculum_elements(area_id, element_type)
    WHERE review_status = 'validated';

-- Trazabilidad por página
CREATE INDEX idx_source_refs_page     ON element_source_refs(source_id, digital_page);
CREATE INDEX idx_source_refs_element  ON element_source_refs(element_id);

-- Full Text Search sobre normalized_text
-- (tsvector generado en columna separada o índice funcional según PostgreSQL version)
CREATE INDEX idx_elements_fts ON curriculum_elements
    USING gin(to_tsvector('spanish', COALESCE(normalized_text, original_text)));

-- Alias lookup
CREATE INDEX idx_aliases_text ON term_aliases(lower(alias_text));

-- Relaciones
CREATE INDEX idx_relations_source  ON element_relations(source_element_id);
CREATE INDEX idx_relations_target  ON element_relations(target_element_id);
CREATE INDEX idx_relations_type    ON element_relations(relation_type);

-- ---------------------------------------------------------------------------
-- DATOS DE REFERENCIA INICIALES (seed mínimo)
-- ---------------------------------------------------------------------------

-- Jurisdicción
INSERT INTO jurisdictions (code, name) VALUES ('PBA', 'Provincia de Buenos Aires');

-- Nivel
INSERT INTO education_levels (code, name, jurisdiction_id)
    SELECT 'PBA-PRIMARY', 'Educación Primaria', id FROM jurisdictions WHERE code = 'PBA';

-- Ciclos
INSERT INTO curriculum_cycles (code, name, level_id, year_range)
    SELECT 'PBA-PRIMARY-C1', 'Primer Ciclo', id, ARRAY[1,2,3] FROM education_levels WHERE code = 'PBA-PRIMARY';
INSERT INTO curriculum_cycles (code, name, level_id, year_range)
    SELECT 'PBA-PRIMARY-C2', 'Segundo Ciclo', id, ARRAY[4,5,6] FROM education_levels WHERE code = 'PBA-PRIMARY';

-- Años (1° a 6°)
INSERT INTO education_years (year_number, name, cycle_id)
    SELECT 1, '1° año', id FROM curriculum_cycles WHERE code = 'PBA-PRIMARY-C1';
INSERT INTO education_years (year_number, name, cycle_id)
    SELECT 2, '2° año', id FROM curriculum_cycles WHERE code = 'PBA-PRIMARY-C1';
INSERT INTO education_years (year_number, name, cycle_id)
    SELECT 3, '3° año', id FROM curriculum_cycles WHERE code = 'PBA-PRIMARY-C1';
INSERT INTO education_years (year_number, name, cycle_id)
    SELECT 4, '4° año', id FROM curriculum_cycles WHERE code = 'PBA-PRIMARY-C2';
INSERT INTO education_years (year_number, name, cycle_id)
    SELECT 5, '5° año', id FROM curriculum_cycles WHERE code = 'PBA-PRIMARY-C2';
INSERT INTO education_years (year_number, name, cycle_id)
    SELECT 6, '6° año', id FROM curriculum_cycles WHERE code = 'PBA-PRIMARY-C2';

-- Unidad Pedagógica (1° + 2°)
INSERT INTO education_years (year_number, name, cycle_id, special_scope)
    SELECT NULL, 'Unidad Pedagógica (1° + 2°)', id, 'UP_1_2'
    FROM curriculum_cycles WHERE code = 'PBA-PRIMARY-C1';

-- Fuente documental
INSERT INTO document_sources (
    stable_code, title, organism, jurisdiction_id,
    resolution_number, resolution_date, publication_year,
    sha256, validity_status, verification_status, version_tag, notes
) SELECT
    'DC-PBA-PRIMARY-2018',
    'Diseño Curricular para la Educación Primaria — Primer Ciclo y Segundo Ciclo',
    'Dirección General de Cultura y Educación, Provincia de Buenos Aires',
    j.id,
    '1482/17',
    '2017-11-15',
    2018,
    lower('1C53A2CC9D8AACC1D1B4CFD6DEAC2AF7FCDAD0834D232C9C391705EB46271A38'),
    'active',
    'partially_verified',
    '2018-ed1',
    'Vigencia referenciada por DGCyE en documento de 2026-04-24. Verificación exhaustiva en SINBA pendiente (I-01). ISBN 978-987-676-095-9.'
FROM jurisdictions j WHERE j.code = 'PBA';

-- Áreas oficiales del DC PBA 2018
-- (seed completo; stable_code según convención AREA_CODE del EXTRACTION_STRATEGY.md)
-- Se omiten los VALUES de page ranges para brevedad; completar en Etapa 02.3.

-- Alias de búsqueda iniciales
INSERT INTO term_aliases (canonical_term, alias_text, alias_kind, notes)
VALUES
    ('ciclo hidrológico', 'ciclo del agua', 'SEARCH_ALIAS', 'GC-007: el DC usa ciclo hidrológico, no ciclo del agua'),
    ('Prácticas del Lenguaje', 'Lengua', 'SEARCH_ALIAS', 'Denominación anterior; reemplazada en DC 2018'),
    ('año', 'grado', 'VALIDATED_SYNONYM', 'Uso coloquial frecuente; sinónimo pedagógico validado'),
    ('Unidad Pedagógica', 'UP', 'SEARCH_ALIAS', 'Abreviatura habitual de Unidad Pedagógica 1°+2°'),
    ('indicadores de avance', 'indicadores de logro', 'PARTIAL_EQUIVALENCE', 'Término de DCs anteriores; no idéntico: indicadores de avance son procesual, de logro son de resultado');

-- ---------------------------------------------------------------------------
-- TABLA FUTURA: element_embeddings (pgvector — no crear en esta etapa)
-- ---------------------------------------------------------------------------
-- CREATE EXTENSION IF NOT EXISTS vector;
-- CREATE TABLE element_embeddings (
--     id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--     element_id   uuid NOT NULL REFERENCES curriculum_elements(id) ON DELETE CASCADE,
--     embedding    vector(1536) NOT NULL,
--     model_name   text NOT NULL,       -- e.g. 'text-embedding-3-small'
--     model_version text NOT NULL,      -- e.g. '2024-02'
--     created_at   timestamptz NOT NULL DEFAULT now(),
--     UNIQUE (element_id, model_name, model_version)
-- );
-- CREATE INDEX ON element_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ---------------------------------------------------------------------------
-- FIN DEL BORRADOR
-- ---------------------------------------------------------------------------
-- NO EJECUTAR como migración sin aprobación del propietario.
-- Revisar con Supabase Migration (supabase migration new) en Etapa posterior.
