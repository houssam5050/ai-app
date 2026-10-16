import "server-only";

export interface EmailProvider {
  send(input: { to: string; subject: string; html: string }): Promise<void>;
}

class LogEmailProvider implements EmailProvider {
  async send(input: { to: string; subject: string; html: string }) {
    console.log(`[email:dev] to=${input.to} subject=${input.subject}`);
  }
}

export function getEmailProvider(): EmailProvider {
  // Production Resend adapter can replace this behind the same interface.
  return new LogEmailProvider();
}

/** Post-commit helper: never send email inside a DB transaction. */
export async function sendEmailAfterCommit(
  input: { to: string; subject: string; html: string },
) {
  await getEmailProvider().send(input);
}
