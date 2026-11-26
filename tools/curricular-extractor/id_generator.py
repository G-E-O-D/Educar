"""
id_generator.py — Generación de identificadores estables y reproducibles.

Formato: {AREA_CODE}-{CICLO_CODE}-{YEAR_CODE}-{BLOCK_CODE}-{TYPE_CODE}-{SEQ:04d}
Ejemplo: MAT-2C-4-BLQ1-CON-0001

Principios:
- Determinista: misma entrada → mismo identificador.
- No depende de posición en el PDF (página/coordenada como tie-breaker únicamente).
- Basado en área, ciclo, año, bloque, tipo y secuencia dentro del bloque.
- Único por fuente documental (source_id).
"""

from config import AREA_CODES, CYCLE_CODES, YEAR_CODES, ELEMENT_TYPE_CODES


class IDGenerator:
    """
    Genera stable_ids y detecta duplicados dentro de una sesión de extracción.
    """

    def __init__(self, source_code: str = "DC-PBA-PRIMARY-2018"):
        self.source_code = source_code
        self._counters: dict[str, int] = {}  # prefix → next seq
        self._issued: dict[str, str] = {}     # stable_id → original_text[:60] (para debug)

    def _prefix(
        self,
        area: str,
        ciclo: str,
        year: int | str | None,
        block_num: int | str,
        element_type: str,
    ) -> str:
        """Construye el prefijo antes del número de secuencia."""
        area_code = AREA_CODES.get(area, area[:3].upper())
        ciclo_code = CYCLE_CODES.get(ciclo, ciclo[:2].upper()) if ciclo else "XX"

        if year is None:
            year_code = "X"
        elif isinstance(year, str) and year.startswith("UP"):
            year_code = "UP"
        else:
            year_code = str(year)

        block_code = f"BLQ{block_num}"
        type_code = ELEMENT_TYPE_CODES.get(element_type, element_type[:3].upper())

        return f"{area_code}-{ciclo_code}-{year_code}-{block_code}-{type_code}"

    def generate(
        self,
        area: str,
        ciclo: str,
        year: int | str | None,
        block_num: int | str,
        element_type: str,
        original_text: str = "",
    ) -> str:
        """
        Genera y registra un stable_id.
        Si el mismo prefijo ya se usó, incrementa el contador.
        """
        prefix = self._prefix(area, ciclo, year, block_num, element_type)
        seq = self._counters.get(prefix, 0) + 1
        self._counters[prefix] = seq
        stable_id = f"{prefix}-{seq:04d}"
        self._issued[stable_id] = original_text[:60]
        return stable_id

    def reset_block(
        self,
        area: str,
        ciclo: str,
        year: int | str | None,
        block_num: int | str,
        element_type: str,
    ) -> None:
        """Reinicia el contador para un prefijo dado."""
        prefix = self._prefix(area, ciclo, year, block_num, element_type)
        self._counters[prefix] = 0

    def has_conflicts(self) -> list[str]:
        """Devuelve lista de stable_ids duplicados (no debería haber ninguno)."""
        seen: dict[str, int] = {}
        for sid in self._issued:
            seen[sid] = seen.get(sid, 0) + 1
        return [sid for sid, count in seen.items() if count > 1]

    def issued_count(self) -> int:
        return len(self._issued)

    def summary(self) -> dict:
        return {
            "total_issued": self.issued_count(),
            "conflicts": self.has_conflicts(),
            "by_prefix": {
                k: v for k, v in sorted(self._counters.items())
            },
        }


def make_block_code(area: str, ciclo: str, year: int | str | None, block_num: int) -> str:
    """Genera el stable_code de un bloque."""
    area_code = AREA_CODES.get(area, area[:3].upper())
    ciclo_code = CYCLE_CODES.get(ciclo, "XX") if ciclo else "XX"
    year_code = str(year) if year is not None else "X"
    return f"PBA-PRIMARY-{area_code}-{ciclo_code}-{year_code}-BLQ{block_num}"
