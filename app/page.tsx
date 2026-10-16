import Link from "next/link";
import { Flame, Trophy, BookOpen, Sparkles } from "lucide-react";
import { buttonClasses, cardClasses } from "@/components/ui/primitives";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
      <section className="grid gap-8 rounded-3xl bg-zinc-950 p-10 text-white md:grid-cols-2">
        <div className="flex flex-col gap-5">
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
            <Sparkles size={14} /> Interactive DataCamp-style learning
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Learn data skills by doing, not watching.
          </h1>
          <p className="text-zinc-300">
            Courses, hands-on coding, quizzes, streaks, XP, and achievements —
            backed by a real database and verified progress.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/courses" className={buttonClasses("primary")}>
              <BookOpen size={16} /> Browse courses
            </Link>
            <Link href="/dashboard" className={buttonClasses("secondary")}>
              Go to dashboard
            </Link>
          </div>
        </div>
        <div className="grid gap-4">
          {[
            { icon: Flame, title: "Streaks that stick", text: "Daily activity builds current and longest streaks." },
            { icon: Trophy, title: "XP + achievements", text: "Every reward is an auditable XP transaction." },
            { icon: BookOpen, title: "Verified completion", text: "Quizzes and code are validated server-side." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <f.icon size={20} className="text-emerald-300" />
              <h3 className="mt-2 font-semibold">{f.title}</h3>
              <p className="text-sm text-zinc-300">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Python Foundations", meta: "Beginner · 3 lessons" },
          { title: "Data Analysis with Pandas", meta: "Intermediate · hands-on" },
          { title: "Python Beginner Path", meta: "Learning path · milestone-tracked" },
        ].map((c) => (
          <div key={c.title} className={cardClasses()}>
            <h3 className="font-semibold">{c.title}</h3>
            <p className="mt-1 text-sm text-zinc-500">{c.meta}</p>
            <Link href="/courses" className="mt-4 inline-block text-sm font-semibold text-emerald-700">
              View catalog →
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}
