export interface GradeInput {
  questionId: string;
  correctOptionIds: string[];
  selectedOptionIds: string[];
}

/** Pure grading helper — no server imports, safe to unit test. */
export function gradeAnswers(items: GradeInput[]): { correct: boolean[]; score: number } {
  const correct = items.map((item) => {
    const a = [...item.correctOptionIds].sort();
    const b = [...item.selectedOptionIds].sort();
    return a.length === b.length && a.every((id, i) => id === b[i]);
  });
  const score = items.length ? Math.round((correct.filter(Boolean).length / items.length) * 100) : 0;
  return { correct, score };
}
