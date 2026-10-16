"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { buttonClasses, cardClasses } from "@/components/ui/primitives";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

type FormValues = z.infer<typeof schema>;

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setError("");
    const res = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });
    if (res.error) setError(res.error.message ?? "Sign up failed");
    else router.push("/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 py-12">
      <div className={cardClasses()}>
        <h1 className="text-2xl font-bold">Create your account</h1>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
          <input {...form.register("name")} placeholder="Full name" className="rounded-xl border px-4 py-2.5" />
          <input {...form.register("email")} placeholder="Email" className="rounded-xl border px-4 py-2.5" />
          <input {...form.register("password")} type="password" placeholder="Password (8+ chars)" className="rounded-xl border px-4 py-2.5" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className={buttonClasses("primary")} type="submit">Sign up</button>
        </form>
      </div>
    </div>
  );
}
