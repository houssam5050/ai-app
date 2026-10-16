import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex w-full max-w-6xl items-center gap-5 px-6 py-4 text-sm font-semibold">
        <Link href="/" className="text-base font-bold text-emerald-700">EdTech</Link>
        <Link href="/courses">Courses</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/leaderboard">Leaderboard</Link>
        <Link href="/admin">Admin</Link>
        <div className="ml-auto flex gap-3">
          <Link href="/signin" className="text-zinc-500">Sign in</Link>
          <Link href="/signup" className="text-emerald-700">Sign up</Link>
        </div>
      </nav>
    </header>
  );
}
