"""
02_toc_pages.py - Extract text from early pages (cover, TOC) and
scan for section headings throughout the document.
Saves: docs/curricular/raw_toc.txt  and  raw_headings.txt
"""
import warnings; warnings.filterwarnings("ignore")
import pymupdf
import re

PDF = r"d:\Sistemas\educar\docs\dis-curricular-PBA-completo.pdf"
doc = pymupdf.open(PDF)

# --- Pages 1-20: cover + index ------------------------------------------------
with open(r"d:\Sistemas\educar\docs\curricular\raw_pages_1_20.txt", "w", encoding="utf-8") as f:
    for i in range(min(20, doc.page_count)):
        t = doc[i].get_text("text")
        f.write(f"\n{'='*60}\nPAGE {i+1} (0-idx {i})\n{'='*60}\n")
        f.write(t)

print("Pages 1-20 extracted")

# --- Scan all pages for large-font / heading-like lines -----------------------
# Use dict mode to get font sizes
headings = []
for i in range(doc.page_count):
    blocks = doc[i].get_text("dict")["blocks"]
    for b in blocks:
        if b.get("type") != 0:
            continue
        for line in b.get("lines", []):
            for span in line.get("spans", []):
                size = span.get("size", 0)
                text = span.get("text", "").strip()
                if size >= 14 and len(text) > 3:
                    headings.append({
                        "page": i + 1,
                        "size": round(size, 1),
                        "text": text[:120],
                    })

# Deduplicate consecutive same-text headings (page headers)
seen = set()
unique_headings = []
for h in headings:
    key = h["text"]
    if key not in seen:
        seen.add(key)
        unique_headings.append(h)

with open(r"d:\Sistemas\educar\docs\curricular\raw_headings_all.txt", "w", encoding="utf-8") as f:
    for h in headings:
        f.write(f"p{h['page']:03d} sz{h['size']:5.1f}  {h['text']}\n")

with open(r"d:\Sistemas\educar\docs\curricular\raw_headings_unique.txt", "w", encoding="utf-8") as f:
    for h in unique_headings:
        f.write(f"p{h['page']:03d} sz{h['size']:5.1f}  {h['text']}\n")

print(f"Total heading spans: {len(headings)}")
print(f"Unique heading texts: {len(unique_headings)}")

# --- Extract page number printed on page (look for isolated numbers) ----------
# Check pages 10-20 for numbering pattern
print("\nSample printed page numbers (pages 10-20):")
for i in range(9, 20):
    t = doc[i].get_text("text").strip()
    lines = [l.strip() for l in t.split("\n") if l.strip()]
    # Last few lines often contain page numbers
    tail = lines[-3:] if len(lines) >= 3 else lines
    print(f"  p{i+1}: tail = {tail}")

doc.close()
print("Done.")
