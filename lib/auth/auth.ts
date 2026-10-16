import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db/prisma";

function getAuthEnv() {
  return {
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET ?? "dev-only-secret-replace-in-production-000",
  };
}

const env = getAuthEnv();

export const auth = betterAuth({
  baseURL: env.baseURL,
  secret: env.secret,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "STUDENT", required: false },
      status: { type: "string", defaultValue: "ACTIVE", required: false },
    },
  },
  advanced: {
    cookiePrefix: "edtech",
  },
});

export type AuthSession = typeof auth.$Infer.Session;
