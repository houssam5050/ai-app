"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { buttonClasses, cardClasses } from "@/components/ui/primitives";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setError("");
    const res = await authClient.signIn.email(values);
    if (res.error) setError(res.error.message ?? "Sign in failed");
    else router.push("/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 py-12">
      <div className={cardClasses()}>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
          <input {...form.register("email")} placeholder="Email" className="rounded-xl border px-4 py-2.5" />
          <input {...form.register("password")} type="password" placeholder="Password" className="rounded-xl border px-4 py-2.5" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className={buttonClasses("primary")} type="submit">Sign in</button>
        </form>
      </div>
    </div>
  );
}
