import { describe, it, expect } from "vitest";
import { gradeAnswers } from "@/server/services/quiz-grading";

describe("quiz grading", () => {
  it("scores single-choice correctly", () => {
    const { correct, score } = gradeAnswers([
      { questionId: "q1", correctOptionIds: ["a"], selectedOptionIds: ["a"] },
      { questionId: "q2", correctOptionIds: ["b"], selectedOptionIds: ["c"] },
    ]);
    expect(correct).toEqual([true, false]);
    expect(score).toBe(50);
  });

  it("requires exact match for multiple-choice", () => {
    const full = gradeAnswers([
      { questionId: "q1", correctOptionIds: ["a", "b"], selectedOptionIds: ["b", "a"] },
    ]);
    expect(full.correct).toEqual([true]);
    expect(full.score).toBe(100);

    const partial = gradeAnswers([
      { questionId: "q1", correctOptionIds: ["a", "b"], selectedOptionIds: ["a"] },
    ]);
    expect(partial.correct).toEqual([false]);
    expect(partial.score).toBe(0);
  });

  it("scores empty quiz as 0", () => {
    expect(gradeAnswers([]).score).toBe(0);
  });
});
