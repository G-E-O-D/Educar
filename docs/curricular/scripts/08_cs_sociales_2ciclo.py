"""
08_cs_sociales_2ciclo.py - Extract CS Sociales Segundo Ciclo structure
and find organización federal, recursos naturales, pueblos originarios, conquista
"""
import warnings; warnings.filterwarnings("ignore")
import pymupdf
import re

PDF = r"d:\Sistemas\educar\docs\dis-curricular-PBA-completo.pdf"
doc = pymupdf.open(PDF)

# CS Sociales: d180-235
# Look for Segundo Ciclo heading
print("=== LOOKING FOR SEGUNDO CICLO IN CS SOCIALES ===")
for di in range(179, 235):
    t = doc[di].get_text("text")
    if "Segundo Ciclo" in t or "SEGUNDO CICLO" in t:
        lines = [l.strip() for l in t.split("\n") if l.strip()][:15]
        print(f"\nd{di+1} (p{di}):")
        for l in lines:
            print(f"  {l}")

print("\n\n=== LOOKING FOR 4°/CUARTO AÑO AND TOPICS ===")
topics = ["organización federal", "federal", "recursos naturales",
          "pueblos originarios", "conquista", "colonial", "virreinato",
          "organización política", "Cuarto", "cuarto"]
for di in range(179, 235):
    t = doc[di].get_text("text")
    hits = [tp for tp in topics if tp.lower() in t.lower()]
    if hits:
        # Get lines with the topic
        for tp in hits[:3]:
            idx = t.lower().find(tp.lower())
            if idx >= 0:
                ctx = t[max(0,idx-80):idx+150].replace("\n", " ").strip()
                print(f"d{di+1} [{tp}]: ...{ctx}...")

doc.close()
