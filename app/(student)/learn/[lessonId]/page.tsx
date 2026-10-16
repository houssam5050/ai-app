import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { completeLesson } from "@/server/services/progress-service";
import { cardClasses, buttonClasses } from "@/components/ui/primitives";
import QuizBox from "@/features/assessments/quiz-box";
import ExerciseBox from "@/features/assessments/exercise-box";

export const dynamic = "force-dynamic";

async function complete(id: string) {
  "use server";
  const { user } = await requireUser();
  await completeLesson(user.id, id, 5);
  redirect("/dashboard");
}

export default async function LearnPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  let userId: string;
  try {
    userId = (await requireUser()).user.id;
  } catch {
    redirect("/signin");
  }

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      chapter: { include: { course: true } },
      quiz: { include: { questions: { include: { options: true }, orderBy: { position: "asc" } } } },
      exercise: true,
    },
  });
  if (!lesson) notFound();

  const enrolled = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: lesson.chapter.course.id } },
  });
  if (!enrolled) redirect(`/courses/${lesson.chapter.course.slug}`);

  const safeQuiz = lesson.quiz
    ? {
        id: lesson.quiz.id,
        title: lesson.quiz.title,
        questions: lesson.quiz.questions.map((q) => ({
          id: q.id,
          prompt: q.prompt,
          options: q.options.map((o) => ({ id: o.id, text: o.text })),
        })),
      }
    : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <p className="text-sm text-zinc-500">{lesson.chapter.course.title} · {lesson.chapter.title}</p>
      <h1 className="text-3xl font-bold">{lesson.title}</h1>
      <div className={cardClasses()}>
        <p className="whitespace-pre-wrap text-zinc-700">{lesson.content}</p>
        {lesson.videoUrl && <p className="mt-2 text-sm">Video: {lesson.videoUrl}</p>}
      </div>

      {safeQuiz && <QuizBox quiz={safeQuiz} />}
      {lesson.exercise && (
        <ExerciseBox exerciseId={lesson.exercise.id} starter={lesson.exercise.starterCode} instructions={lesson.exercise.instructions} />
      )}

      <form action={complete.bind(null, lesson.id)}>
        <button className={buttonClasses("primary")} type="submit">Mark complete</button>
      </form>
    </div>
  );
}
