import { SendMailOptions } from "./interface";
import { createMailProvider } from "./adapter";
import env from "../../config/env.config";
import { renderTemplate } from "./templates";

const provider = createMailProvider();

export async function sendEmail(opts: SendMailOptions) {
  await provider.sendMail(opts);
}

export type VerificationResult = {
  code: string;
  expiresAt: Date;
};

export async function sendVerificationCode(
  to: string,
  options?: {
    subject?: string;
  }
): Promise<VerificationResult> {
  const ttl = env.EMAIL_VERIFICATION_TTL_MINUTES;
  const code = generateNumericCode(6);
  const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

  const subject = options?.subject ?? "Your verification code";
  const text = `Your verification code is: ${code}\nThis code will expire in ${ttl} minutes.`;

  let html: string = await renderTemplate("verification", {
    code,
    ttlMinutes: ttl,
  });

  const mailOpts: SendMailOptions = {
    to,
    subject,
    text,
    html,
  };

  await provider.sendMail(mailOpts);

  return { code, expiresAt };
}

function generateNumericCode(length: number): string {
  const max = 10 ** length;
  const n = Math.floor(Math.random() * max)
    .toString()
    .padStart(length, "0");
  return n;
}
