"use client";

import { useState } from "react";
import { cardClasses, buttonClasses } from "@/components/ui/primitives";

export default function ExerciseBox({
  exerciseId,
  starter,
  instructions,
}: {
  exerciseId: string;
  starter: string;
  instructions: string;
}) {
  const [code, setCode] = useState(starter);
  const [result, setResult] = useState<{ status: string; feedback: string } | null>(null);

  async function submit() {
    const res = await fetch("/api/exercises/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId, code }),
    });
    const json = await res.json();
    if (json.ok) setResult({ status: json.data.status, feedback: json.data.feedback });
  }

  return (
    <div className={cardClasses()}>
      <h2 className="font-semibold">Coding exercise</h2>
      <p className="mt-1 text-sm text-zinc-600">{instructions}</p>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={8}
        className="mt-3 w-full rounded-xl border bg-zinc-950 p-3 font-mono text-sm text-emerald-100"
      />
      <button onClick={submit} className={`${buttonClasses("primary")} mt-3`} type="button">
        Run & submit
      </button>
      {result && (
        <p className="mt-2 text-sm font-semibold">
          {result.status}: {result.feedback}
        </p>
      )}
    </div>
  );
}
