"""
03_structure_scan.py
Scans all 433 pages for headings, identifies area sections,
page number offsets, and saves per-area text samples.

Outputs:
  raw_structure.json  — full heading list with page refs
  raw_offset_check.txt — printed vs digital page offset verification
"""
import warnings; warnings.filterwarnings("ignore")
import pymupdf
import json
import re

PDF = r"d:\Sistemas\educar\docs\dis-curricular-PBA-completo.pdf"
doc = pymupdf.open(PDF)

# --- Determine digital→printed page offset -----------------------------------
# Page 6 digital = printed 5, page 10 = printed 9, page 12 = printed 11
# So printed = digital - 1 (for pages >= 2 digital)
# Page 1 digital has "49" which is the page HEADER of a right-side page design
# (not a page number) — covers are unnumbered.

# Verify by extracting first line of several pages
offset_samples = []
for di in [5, 6, 9, 10, 11, 13, 20, 50, 100, 200, 300, 400]:
    if di >= doc.page_count: continue
    t = doc[di].get_text("text").strip()
    lines = [l.strip() for l in t.split("\n") if l.strip()]
    first_num = None
    for l in lines[:3]:
        if re.match(r'^\d+$', l):
            first_num = int(l)
            break
    offset_samples.append({"digital_1idx": di+1, "first_number": first_num,
                            "computed_print": (di+1)-1,
                            "match": first_num == di if first_num else None})

with open(r"d:\Sistemas\educar\docs\curricular\raw_offset_check.txt", "w", encoding="utf-8") as f:
    f.write("digital(1-idx) | first_num_on_page | expected_print(d-1) | match\n")
    for s in offset_samples:
        f.write(f"  d{s['digital_1idx']:3d}  |  {str(s['first_number']):5s}  |  p{s['computed_print']:3d}  |  {s['match']}\n")

# --- Collect all spans ≥ 12pt as heading candidates -------------------------
sections = []
for i in range(doc.page_count):
    blocks = doc[i].get_text("dict")["blocks"]
    for b in blocks:
        if b.get("type") != 0: continue
        for line in b.get("lines", []):
            for span in line.get("spans", []):
                size = span.get("size", 0)
                text = span.get("text", "").strip()
                flags = span.get("flags", 0)
                is_bold = bool(flags & 2**4)
                if size >= 12 and len(text) > 2:
                    sections.append({
                        "d_page": i + 1,
                        "p_page": i,       # printed = digital - 1 (approx)
                        "size": round(size, 1),
                        "bold": is_bold,
                        "text": text[:150],
                    })

# Save full list
with open(r"d:\Sistemas\educar\docs\curricular\raw_structure.json", "w", encoding="utf-8") as f:
    json.dump(sections, f, ensure_ascii=False, indent=2)

print(f"Total heading-candidate spans: {len(sections)}")
print("\nSample (size >= 18):")
for s in sections:
    if s["size"] >= 18:
        print(f"  d{s['d_page']:3d} p{s['p_page']:3d} sz{s['size']:5.1f}  {'B' if s['bold'] else ' '}  {s['text'][:80]}")

doc.close()
print("Done.")
