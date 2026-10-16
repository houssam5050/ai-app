import { requireUser } from "@/lib/auth/session";
import { ok, errorToResponse } from "@/lib/api-response";
import { getDashboardSummary } from "@/server/services/dashboard-service";

export async function GET() {
  try {
    const { user } = await requireUser();
    const data = await getDashboardSummary(user.id);
    return ok(data);
  } catch (e) {
    return errorToResponse(e);
  }
}
