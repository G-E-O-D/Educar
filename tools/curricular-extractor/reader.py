"""
reader.py — Lectura y verificación del PDF fuente.
Verifica SHA-256 antes de abrir el documento.
"""

import hashlib
import json
from pathlib import Path
from typing import Optional

import fitz  # PyMuPDF

from config import (
    PDF_PATH, SOURCE_MANIFEST_PATH, EXPECTED_SHA256,
    MAX_DIGITAL_PAGE, PAGE_OFFSET
)


class SourceVerificationError(Exception):
    pass


def compute_sha256(path: Path) -> str:
    """Calcula SHA-256 del archivo en hex minúsculas."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def verify_source(pdf_path: Optional[Path] = None) -> dict:
    """
    Verifica el PDF contra el manifest.
    Lanza SourceVerificationError si el hash no coincide.
    Devuelve dict con resultado de la verificación.
    """
    path = pdf_path or PDF_PATH

    if not path.exists():
        raise SourceVerificationError(f"PDF no encontrado: {path}")

    actual_hash = compute_sha256(path)
    expected = EXPECTED_SHA256.lower()

    if actual_hash != expected:
        raise SourceVerificationError(
            f"SHA-256 no coincide.\n"
            f"  Esperado: {expected}\n"
            f"  Calculado: {actual_hash}\n"
            f"  El PDF puede estar corrupto o ser una versión diferente."
        )

    return {
        "path": str(path),
        "sha256": actual_hash,
        "size_bytes": path.stat().st_size,
        "verified": True,
    }


def open_document(pdf_path: Optional[Path] = None, skip_verify: bool = False) -> fitz.Document:
    """
    Abre el documento PDF tras verificar el hash.
    skip_verify=True solo para pruebas con fixtures.
    """
    path = pdf_path or PDF_PATH
    if not skip_verify:
        verify_source(path)
    return fitz.open(str(path))


def get_page(doc: fitz.Document, digital_page: int) -> fitz.Page:
    """
    Devuelve la Page para digital_page (1-indexed).
    Valida el rango.
    """
    if digital_page < 1 or digital_page > MAX_DIGITAL_PAGE:
        raise ValueError(
            f"Página digital {digital_page} fuera de rango "
            f"[1, {MAX_DIGITAL_PAGE}] para DC PBA 2018."
        )
    return doc[digital_page - 1]  # PyMuPDF usa 0-indexed


def digital_to_printed(digital: int) -> int:
    """Convierte página digital a impresa (regla DC PBA 2018)."""
    return digital - PAGE_OFFSET


def printed_to_digital(printed: int) -> int:
    """Convierte página impresa a digital."""
    return printed + PAGE_OFFSET


def get_page_dimensions(page: fitz.Page) -> dict:
    """Devuelve dimensiones de la página en puntos."""
    rect = page.rect
    return {
        "width": rect.width,
        "height": rect.height,
        "x0": rect.x0,
        "y0": rect.y0,
    }
