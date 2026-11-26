"""
test_id_generator.py — Pruebas del generador de identificadores.
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from id_generator import IDGenerator, make_block_code


class TestIDGenerator:
    def setup_method(self):
        self.gen = IDGenerator()

    def test_deterministic_format(self):
        sid = self.gen.generate("Matemática", "Segundo Ciclo", 4, 1, "CONCEPT")
        assert sid.startswith("MAT-2C-4-BLQ1-CON-")
        assert sid.endswith("0001")

    def test_sequential_within_prefix(self):
        sid1 = self.gen.generate("Matemática", "Segundo Ciclo", 4, 1, "CONCEPT")
        sid2 = self.gen.generate("Matemática", "Segundo Ciclo", 4, 1, "CONCEPT")
        assert sid1 != sid2
        assert sid1.endswith("0001")
        assert sid2.endswith("0002")

    def test_different_types_independent_counters(self):
        c1 = self.gen.generate("Matemática", "Segundo Ciclo", 4, 1, "CONCEPT")
        w1 = self.gen.generate("Matemática", "Segundo Ciclo", 4, 1, "WAY_OF_KNOWING")
        c2 = self.gen.generate("Matemática", "Segundo Ciclo", 4, 1, "CONCEPT")
        # CON counter: 1 → 2
        assert c1.endswith("0001")
        assert w1.endswith("0001")  # propio counter
        assert c2.endswith("0002")

    def test_different_years_independent(self):
        y4 = self.gen.generate("Matemática", "Segundo Ciclo", 4, 1, "CONCEPT")
        y5 = self.gen.generate("Matemática", "Segundo Ciclo", 5, 1, "CONCEPT")
        assert "4-BLQ1-CON" in y4
        assert "5-BLQ1-CON" in y5
        assert y4 != y5

    def test_no_conflicts_after_many(self):
        for i in range(50):
            self.gen.generate("Matemática", "Segundo Ciclo", 4, 1, "CONCEPT")
        conflicts = self.gen.has_conflicts()
        assert conflicts == []

    def test_reproducible_format(self):
        """Dos generators nuevos con misma secuencia producen los mismos IDs."""
        gen2 = IDGenerator()
        sid_a = self.gen.generate("Ciencias Sociales", "Segundo Ciclo", 4, 1, "CONCEPT")
        sid_b = gen2.generate("Ciencias Sociales", "Segundo Ciclo", 4, 1, "CONCEPT")
        assert sid_a == sid_b

    def test_cycle_scope_year_none(self):
        sid = self.gen.generate("Ciencias Naturales", "Segundo Ciclo", None, 1, "TEACHING_SITUATION")
        assert "X-BLQ1-SIT" in sid

    def test_unidad_pedagogica(self):
        sid = self.gen.generate("Matemática", "Primer Ciclo", "UP_1_2", 1, "CONCEPT")
        assert "UP" in sid

    def test_summary(self):
        self.gen.generate("Matemática", "Segundo Ciclo", 4, 1, "CONCEPT")
        s = self.gen.summary()
        assert s["total_issued"] == 1
        assert s["conflicts"] == []


class TestMakeBlockCode:
    def test_basic(self):
        code = make_block_code("Matemática", "Segundo Ciclo", 4, 1)
        assert "PBA-PRIMARY-MAT-2C-4-BLQ1" == code

    def test_no_year(self):
        code = make_block_code("Ciencias Naturales", "Segundo Ciclo", None, 2)
        assert "BLQ2" in code
        assert "-X-" in code
