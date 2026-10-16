import { cn } from "@/lib/utils/cn";

export function buttonClasses(variant: "primary" | "secondary" | "ghost" = "primary") {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";
  if (variant === "primary")
    return cn(base, "bg-emerald-600 text-white hover:bg-emerald-700");
  if (variant === "secondary")
    return cn(base, "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100");
  return cn(base, "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800");
}

export function cardClasses() {
  return "rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950";
}
