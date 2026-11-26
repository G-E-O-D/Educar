"""Quick check for acentuacion in Practicas del Lenguaje"""
import warnings; warnings.filterwarnings("ignore")
import pymupdf
PDF = r"d:\Sistemas\educar\docs\dis-curricular-PBA-completo.pdf"
doc = pymupdf.open(PDF)
# Check d53, d63, d68 for acentuation
for di in [52, 54, 56, 62, 64, 67]:
    t = doc[di].get_text("text")
    # Search for acentuación variations
    for kw in ["acentu", "ortograf", "tilde", "acento", "agudas", "graves", "esdrújulas"]:
        idx = t.lower().find(kw)
        if idx >= 0:
            ctx = t[max(0,idx-100):idx+200].replace("\n"," ").strip()
            print(f"d{di+1} [{kw}]: {ctx[:250]}")
            break
doc.close()
