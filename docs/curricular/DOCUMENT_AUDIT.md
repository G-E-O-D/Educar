# DOCUMENT_AUDIT.md — Auditoría documental
**Etapa 02.1 · Fecha: 2026-11-26**

---

## 1. Identificación del archivo

| Campo | Valor |
|-------|-------|
| Nombre | `dis-curricular-PBA-completo.pdf` |
| Extensión real | `.pdf` (no `.crdownload`) |
| Tamaño | 3 617 659 bytes (3,45 MB) |
| SHA-256 | `1C53A2CC9D8AACC1D1B4CFD6DEAC2AF7FCDAD0834D232C9C391705EB46271A38` |
| Magic bytes | `%PDF-1.6` |
| Integridad | **VÁLIDA** |

## 2. Metadatos del PDF

| Campo | Valor |
|-------|-------|
| Creador | Adobe InDesign CS6 (Macintosh) |
| Productor | Adobe PDF Library 10.0.1 |
| Fecha de creación | 2017-12-25T18:36:04−03:00 |
| Fecha de modificación | 2018-01-04T09:11:28−03:00 |
| Título (campo PDF) | vacío |
| Autor (campo PDF) | vacío |
| Encriptado | No |

Los campos de título y autor están vacíos en los metadatos del PDF. La identificación surge exclusivamente del cuerpo del documento.

## 3. Identificación del documento

| Campo | Valor |
|-------|-------|
| Título oficial | *Diseño Curricular para la Educación Primaria — Primer Ciclo y Segundo Ciclo* |
| Organismo emisor | Dirección General de Cultura y Educación, Provincia de Buenos Aires |
| Subsecretaría | Subsecretaría de Educación |
| Coordinación general | Sergio Siciliano |
| Edición | 1a ed. |
| Lugar | La Plata, Provincia de Buenos Aires |
| Año de publicación | 2018 (Copyright © 2018 DGCyE) |
| ISBN | 978-987-676-095-9 |
| Depósito legal | Ley N° 11.723 |

## 4. Vigencia y aprobación normativa

| Campo | Valor |
|-------|-------|
| Resolución de aprobación | **N° 1482/17** |
| Órgano | Director General de Cultura y Educación + Vicepresidente 1° del Consejo General de Cultura y Educación + Subsecretario de Educación |
| Sesión de aprobación del Consejo | 15 de noviembre de 2017 |
| Vigencia desde | Ciclo lectivo 2018 |
| Deja sin efecto | Resolución N° 3160/07 y toda norma que se le oponga |
| Expediente | 5802-2288226/2017 |

**Advertencia de vigencia**: la Resolución N° 1482/17 consta en el cuerpo del documento (p. 7). La vigencia normativa actual en 2026 no puede acreditarse únicamente con esta fuente; requiere verificación externa en el Boletín Oficial de la Provincia de Buenos Aires o el SINBA (Sistema de Información Normativa). Ver ISSUES_REGISTER.md, ítem I-01.

## 5. Paginación

| Campo | Valor |
|-------|-------|
| Páginas digitales (PDF) | **433** |
| Páginas según registro bibliográfico | 450 p. |
| Diferencia | 17 páginas |
| Regla de conversión | **página_impresa = página_digital − 1** |
| Verificación | 12 puntos de muestreo a lo largo del documento; regla consistente en todos |
| Páginas sin numeración impresa | Portada (d1-d2), páginas de diseño (d3, d9, d13, d20-d21, d31, d43) |

La diferencia de 17 páginas entre el registro bibliográfico ("450 p.") y las 433 páginas del PDF no implica páginas faltantes: se trata de la diferencia entre el conteo tipográfico de la edición impresa (que incluye guardas, contratapa, etc.) y las páginas efectivamente digitalizadas. No se detectaron páginas incompletas, ilegibles ni dañadas.

## 6. Calidad del texto

| Aspecto | Estado |
|---------|--------|
| Capa de texto | Presente y legible (fuente: Adobe InDesign, no escaneado) |
| Orden de lectura | Correcto |
| Palabras divididas por guion | Frecuentes (justificación tipográfica). Requieren reconstrucción en extracción. |
| Codificación | UTF-8/Latin; tildes y ñ correctamente representados |
| Tablas | Tablas de 3 columnas en la mayoría de las áreas; celdas combinadas; continúan entre páginas |
| Encabezados repetidos | Sí — encabezado de área en páginas impares; nombre del documento en páginas pares |
| Notas al pie | Presentes (ver p. 13 — nota 1 sobre uso del masculino genérico) |
| Páginas con texto escaso | Portadas de área (solo contienen nombre del área, e.g. d44, d98, d180) |

## 7. Contenidos transversales no presentes como secciones

La Resolución N° 1482/17 menciona explícitamente observaciones y recomendaciones sobre:
- Formación Ética y Ciudadana
- Educación Tecnológica
- Educación Sexual Integral (ESI)

Ninguna de estas áreas aparece como **sección independiente** en el índice del documento. Se encuentran como **contenidos transversales integrados** en las demás áreas. ESI aparece citada explícitamente en el texto de múltiples áreas; Formación Ética y Ciudadana aparece como denominación de un ámbito dentro de Prácticas del Lenguaje; Educación Tecnológica no tiene sección propia. Ver ISSUES_REGISTER.md, ítems I-02 e I-03.

## 8. Resultado global de la auditoría

El documento es una **fuente válida y confiable** para el desarrollo del motor curricular:
- Archivo íntegro, sin corrupción, no encriptado
- Texto directamente extraíble (no OCR)
- Resolución de aprobación identificada en el cuerpo del documento
- Vigencia normativa actual **pendiente de verificación externa**
- El PDF no es idéntico a la edición impresa (17 páginas de diferencia), pero la diferencia no afecta el contenido curricular
