"""
01_manifest.py — Document identification, integrity, metadata, page count.
Run with: docs\.venv\Scripts\python.exe docs\curricular\scripts\01_manifest.py
Output: docs\curricular\source_manifest_raw.json
"""
import json
import hashlib
import sys
import warnings
warnings.filterwarnings("ignore")

PDF_PATH = r"d:\Sistemas\educar\docs\dis-curricular-PBA-completo.pdf"
OUT_PATH = r"d:\Sistemas\educar\docs\curricular\source_manifest_raw.json"

import pymupdf  # PyMuPDF 2.x API

doc = pymupdf.open(PDF_PATH)

# Hash
sha256 = hashlib.sha256()
with open(PDF_PATH, "rb") as f:
    for chunk in iter(lambda: f.read(65536), b""):
        sha256.update(chunk)
file_hash = sha256.hexdigest().upper()

import os
file_size = os.path.getsize(PDF_PATH)

meta = doc.metadata

# Page dimensions (sample first page)
p0 = doc[0]
rect = p0.rect

# Check for text layer on first 5 pages
text_pages = []
for i in range(min(5, doc.page_count)):
    t = doc[i].get_text("text").strip()
    text_pages.append({"page_0idx": i, "has_text": len(t) > 50, "char_count": len(t)})

# Count pages with text vs blank/scanned
sample_size = min(30, doc.page_count)
scan_count = 0
for i in range(0, doc.page_count, max(1, doc.page_count // sample_size)):
    t = doc[i].get_text("text").strip()
    if len(t) < 30:
        scan_count += 1

manifest = {
    "file": {
        "name": "dis-curricular-PBA-completo.pdf",
        "path": PDF_PATH,
        "size_bytes": file_size,
        "size_mb": round(file_size / 1_048_576, 2),
        "sha256": file_hash,
        "pdf_version": "1.6",
    },
    "pages": {
        "total": doc.page_count,
        "first_page_width_pt": round(rect.width, 1),
        "first_page_height_pt": round(rect.height, 1),
        "first_page_width_mm": round(rect.width * 25.4 / 72, 1),
        "first_page_height_mm": round(rect.height * 25.4 / 72, 1),
    },
    "metadata_raw": meta,
    "text_layer": {
        "first_5_pages": text_pages,
        "scan_estimate": f"~{scan_count} of {sample_size} sampled pages have sparse text (<30 chars)",
    },
    "encryption": doc.is_encrypted,
    "needs_password": doc.needs_pass,
}

with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print(f"Pages: {doc.page_count}")
print(f"SHA256: {file_hash}")
print(f"Creator: {meta.get('creator','')}")
print(f"Producer: {meta.get('producer','')}")
print(f"CreationDate: {meta.get('creationDate','')}")
print(f"Title: {meta.get('title','')}")
print(f"Author: {meta.get('author','')}")
print(f"Subject: {meta.get('subject','')}")
print(f"Keywords: {meta.get('keywords','')}")
print(f"Written to: {OUT_PATH}")

doc.close()
