export const dynamic = "force-dynamic";

import { verifyCertificate } from "@/server/services/certificate-service";
import { cardClasses } from "@/components/ui/primitives";
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  let result: Awaited<ReturnType<typeof verifyCertificate>> = null;
  let unavailable = false;
  if (id) {
    try {
      result = await verifyCertificate(id);
    } catch {
      unavailable = true;
    }
  }
  return (
    <div className="mx-auto w-full max-w-xl px-6 py-12">
      <div className={cardClasses()}>
        <h1 className="text-2xl font-bold">Certificate verification</h1>
        <form className="mt-4 flex gap-2" method="get">
          <input name="id" defaultValue={id ?? ""} placeholder="Verification ID" className="flex-1 rounded-xl border px-4 py-2 text-sm" />
          <button className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white" type="submit">Verify</button>
        </form>
        {id && !result && !unavailable && <p className="mt-3 text-sm text-red-600">No valid certificate found.</p>}
        {id && !result && unavailable && (
          <p className="mt-3 text-sm text-amber-700">
            Verification is temporarily unavailable (database not reachable). Try again after setup.
          </p>
        )}
        {result && (
          <p className="mt-3 text-sm">
            Verified: {result.holderName} completed {result.courseTitle}.
          </p>
        )}
      </div>
    </div>
  );
}

