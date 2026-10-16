import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/edtech?schema=public",
});

const db = new PrismaClient({ adapter });


async function main() {
  for (const c of [
    { name: "Python", slug: "python" },
    { name: "Data Science", slug: "data-science" },
    { name: "Web Development", slug: "web-dev" },
  ]) {
    await db.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  for (const a of [
    { key: "first-lesson", title: "First Steps", description: "Complete your first lesson.", xpReward: 10 },
    { key: "first-quiz-pass", title: "Quiz Whiz", description: "Pass your first quiz.", xpReward: 20 },
    { key: "streak-7", title: "Week Warrior", description: "Learn 7 days in a row.", xpReward: 50 },
    { key: "first-course", title: "Course Finisher", description: "Complete your first course.", xpReward: 100 },
    { key: "coder-5", title: "Code Cadet", description: "Pass 5 coding exercises.", xpReward: 50 },
  ]) {
    await db.achievement.upsert({ where: { key: a.key }, update: {}, create: a });
  }

  for (const m of [
    { key: "lesson-1", title: "Complete 1 lesson", description: "Finish any lesson today.", target: 1, xpReward: 10 },
    { key: "quiz-1", title: "Pass 1 quiz", description: "Pass any quiz today.", target: 1, xpReward: 15 },
    { key: "minutes-30", title: "Learn 30 minutes", description: "Reach 30 learning minutes.", target: 30, xpReward: 20 },
  ]) {
    const existing = await db.dailyMission.findUnique({ where: { key: m.key } });
    if (!existing) await db.dailyMission.create({ data: m });
  }
  const pythonCat = await db.category.findUnique({ where: { slug: "python" } });
  const dsCat = await db.category.findUnique({ where: { slug: "data-science" } });

  for (const c of [
    {
      title: "Python Foundations",
      slug: "python-foundations",
      description: "Variables, control flow, functions, and data structures.",
      status: "PUBLISHED" as const,
      difficulty: "BEGINNER" as const,
      categoryId: pythonCat?.id,
    },
    {
      title: "Data Analysis with Pandas",
      slug: "pandas-analysis",
      description: "Clean, transform, and analyze datasets with pandas.",
      status: "PUBLISHED" as const,
      difficulty: "INTERMEDIATE" as const,
      categoryId: dsCat?.id,
    },
  ]) {
    await db.course.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  const python = await db.course.findUnique({ where: { slug: "python-foundations" } });
  if (python) {
    const ch1 = await db.chapter.upsert({
      where: { id: "seed-ch1" },
      update: {},
      create: { id: "seed-ch1", courseId: python.id, title: "Getting Started", position: 0 },
    });
    await db.lesson.upsert({
      where: { id: "seed-lesson-1" },
      update: {},
      create: {
        id: "seed-lesson-1", chapterId: ch1.id, title: "Hello, Python", type: "TEXT",
        content: "Python is versatile. Set up and run your first program.",
        position: 0, durationMin: 10,
      },
    });
    const l2 = await db.lesson.upsert({
      where: { id: "seed-lesson-2" },
      update: {},
      create: {
        id: "seed-lesson-2", chapterId: ch1.id, title: "Variables Quiz", type: "QUIZ",
        content: "Test your understanding of variables.", position: 1, durationMin: 10,
      },
    });
    let quiz = await db.quiz.findUnique({ where: { lessonId: l2.id } });
    if (!quiz) {
      quiz = await db.quiz.create({ data: { lessonId: l2.id, title: "Variables Quiz", passScore: 70 } });
      const q = await db.question.create({
        data: {
          quizId: quiz.id, prompt: "Which is a valid Python variable name?",
          type: "SINGLE_CHOICE", position: 0,
          explanation: "Names cannot start with a digit.",
        },
      });
      await db.answerOption.createMany({
        data: [
          { questionId: q.id, text: "2cool", isCorrect: false, position: 0 },
          { questionId: q.id, text: "cool_2", isCorrect: true, position: 1 },
          { questionId: q.id, text: "cool-2", isCorrect: false, position: 2 },
        ],
      });
    }
    const l3 = await db.lesson.upsert({
      where: { id: "seed-lesson-3" },
      update: {},
      create: {
        id: "seed-lesson-3", chapterId: ch1.id, title: "First Function", type: "CODING",
        content: "Write a function that returns hello.", position: 2, durationMin: 15,
      },
    });
    const existingEx = await db.codingExercise.findUnique({ where: { lessonId: l3.id } });
    if (!existingEx) {
      await db.codingExercise.create({
        data: {
          lessonId: l3.id, title: "First Function",
          instructions: "Define hello() returning 'hello'.",
          starterCode: "def hello():\n    pass",
          language: "python",
          testsJson: JSON.stringify([{ contains: ["def hello", "hello"] }]),
        },
      });
    }
  }

  const path = await db.learningPath.upsert({
    where: { slug: "python-beginner" },
    update: {},
    create: { title: "Python Beginner Path", slug: "python-beginner", description: "Start your Python journey." },
  });
  if (python) {
    const link = await db.learningPathCourse.findUnique({
      where: { pathId_courseId: { pathId: path.id, courseId: python.id } },
    });
    if (!link) await db.learningPathCourse.create({ data: { pathId: path.id, courseId: python.id, position: 0 } });
  }

  for (const plan of [
    { key: "free", name: "Free", priceCents: 0 },
    { key: "pro", name: "Pro", priceCents: 1900 },
  ]) {
    const existing = await db.plan.findUnique({ where: { key: plan.key } });
    if (!existing) await db.plan.create({ data: plan });
  }

  console.log("Seed complete. Create super-admin: npx tsx prisma/make-super-admin.ts <email>");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
