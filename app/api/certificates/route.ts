import { z } from "zod";
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { ok, errorToResponse } from "@/lib/api-response";
import { issueCertificate, verifyCertificate } from "@/server/services/certificate-service";

export async function GET(req: NextRequest) {
  try {
    const verificationId = req.nextUrl.searchParams.get("verificationId") ?? "";
    const parsed = z.string().min(1).parse(verificationId);
    const result = await verifyCertificate(parsed);
    if (!result) return errorToResponse(new Error("NOT_FOUND"));
    return ok(result);
  } catch (e) {
    return errorToResponse(e);
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await requireUser();
    const { courseId } = z.object({ courseId: z.string().min(1) }).parse(await req.json());
    const cert = await issueCertificate(user.id, courseId);
    return ok(cert);
  } catch (e) {
    return errorToResponse(e);
  }
}
