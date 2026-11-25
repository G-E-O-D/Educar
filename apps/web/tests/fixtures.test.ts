import { describe, it, expect } from 'vitest';
import { STUDENTS, CURRICULUM, deriveStats } from '@/data/fixtures';

describe('Shared fixtures consistency', () => {
  it('every student has valid correctAnswersPct (0–100)', () => {
    for (const s of STUDENTS) {
      expect(s.correctAnswersPct).toBeGreaterThanOrEqual(0);
      expect(s.correctAnswersPct).toBeLessThanOrEqual(100);
    }
  });

  it('needsSupport matches activitiesPending > 0', () => {
    for (const s of STUDENTS) {
      if (s.needsSupport) {
        expect(s.activitiesPending).toBeGreaterThan(0);
      }
    }
  });

  it('every student id is unique', () => {
    const ids = STUDENTS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every curriculum coveragePct is 0 for pendiente and 100 for completo', () => {
    for (const c of CURRICULUM) {
      if (c.status === 'pendiente') expect(c.coveragePct).toBe(0);
      if (c.status === 'completo')  expect(c.coveragePct).toBe(100);
    }
  });

  it('deriveStats totals match STUDENTS and CURRICULUM arrays', () => {
    const stats = deriveStats();
    expect(stats.totalStudents).toBe(STUDENTS.length);
    expect(stats.totalTopics).toBe(CURRICULUM.length);
    expect(stats.doneTopics).toBe(CURRICULUM.filter(c => c.status === 'completo').length);
    expect(stats.supportCount).toBe(STUDENTS.filter(s => s.needsSupport).length);
  });

  it('deriveStats coveragePct equals doneTopics/totalTopics rounded', () => {
    const stats = deriveStats();
    const expected = Math.round(stats.doneTopics / stats.totalTopics * 100);
    expect(stats.coveragePct).toBe(expected);
  });

  it('deriveStats avgCorrect equals rounded mean of correctAnswersPct', () => {
    const stats = deriveStats();
    const expected = Math.round(STUDENTS.reduce((s, r) => s + r.correctAnswersPct, 0) / STUDENTS.length);
    expect(stats.avgCorrect).toBe(expected);
  });

  it('no student has "Lengua" in name (renamed to Prácticas del Lenguaje)', () => {
    for (const c of CURRICULUM) {
      expect(c.area).not.toBe('Lengua');
    }
  });
});
