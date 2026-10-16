import { describe, it, expect } from "vitest";
import {
  courseFilterSchema,
  enrollSchema,
  quizSubmitSchema,
  exerciseSubmitSchema,
  signUpSchema,
} from "@/lib/validation/schemas";

describe("input validation", () => {
  it("rejects invalid signup payloads", () => {
    expect(() => signUpSchema.parse({ name: "A", email: "bad", password: "short" })).toThrow();
    expect(
      signUpSchema.parse({ name: "Ada Lovelace", email: "ada@example.com", password: "supersecret1" }),
    ).toBeTruthy();
  });
  it("caps oversized pageSize at 100", () => {
    expect(() => courseFilterSchema.parse({ page: "2", pageSize: "500" })).toThrow();
    const parsed = courseFilterSchema.parse({ page: "2", pageSize: "50", q: "python" });
    expect(parsed.page).toBe(2);
    expect(parsed.pageSize).toBe(50);
  });
  it("requires non-empty enrollment and quiz payloads", () => {
    expect(() => enrollSchema.parse({ courseId: "" })).toThrow();
    expect(() => quizSubmitSchema.parse({ quizId: "q", answers: [] })).toThrow();
    expect(() => exerciseSubmitSchema.parse({ exerciseId: "e", code: "" })).toThrow();
  });
});
