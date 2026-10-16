"use client";

import { useState } from "react";
import { cardClasses, buttonClasses } from "@/components/ui/primitives";

export default function QuizBox({
  quiz,
}: {
  quiz: {
    id: string;
    title: string;
    questions: { id: string; prompt: string; options: { id: string; text: string }[] }[];
  };
}) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  async function submit() {
    const res = await fetch("/api/quizzes/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quizId: quiz.id,
        answers: quiz.questions.map((q) => ({
          questionId: q.id,
          selectedOptionIds: answers[q.id] ?? [],
        })),
      }),
    });
    const json = await res.json();
    if (json.ok) setResult({ score: json.data.score, passed: json.data.passed });
  }

  return (
    <div className={cardClasses()}>
      <h2 className="font-semibold">{quiz.title}</h2>
      <div className="mt-4 flex flex-col gap-4">
        {quiz.questions.map((q) => (
          <div key={q.id}>
            <p className="text-sm font-semibold">{q.prompt}</p>
            <div className="mt-2 flex flex-col gap-2">
              {q.options.map((o) => (
                <label key={o.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={answers[q.id]?.includes(o.id) ?? false}
                    onChange={(e) => {
                      const prev = answers[q.id] ?? [];
                      setAnswers({
                        ...answers,
                        [q.id]: e.target.checked ? [...prev, o.id] : prev.filter((x) => x !== o.id),
                      });
                    }}
                  />
                  {o.text}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={submit} className={`${buttonClasses("primary")} mt-4`} type="button">
        Submit quiz
      </button>
      {result && (
        <p className="mt-2 text-sm font-semibold">
          Score {result.score}% — {result.passed ? "Passed ✓" : "Try again"}
        </p>
      )}
    </div>
  );
}
