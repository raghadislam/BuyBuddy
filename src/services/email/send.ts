import crypto from "crypto";

import { SendMailOptions } from "./interface";
import { createMailProvider } from "./adapter";
import env from "../../config/env.config";
import { renderTemplate } from "./templates";
import prisma from "../../config/prisma.config";

const provider = createMailProvider();

function generateNumericCode(length: number): string {
  const max = 10 ** length;
  const n = Math.floor(Math.random() * max)
    .toString()
    .padStart(length, "0");
  return n;
}

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
  const hashed = crypto.createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

  await prisma.user.update({
    where: { email: to },
    data: {
      verificationCode: hashed,
      verificationCodeExpiresAt: expiresAt,
    },
  });

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

export async function sendAccountVerifiedEmail(
  to: string,
  options?: {
    subject?: string;
    firstName?: string;
  }
): Promise<void> {
  const subject =
    options?.subject ??
    "You're verified — welcome to " + (env.APP_NAME ?? "our app");

  const html = await renderTemplate("accountVerified", {
    firstName: options?.firstName ?? null,
    appName: env.APP_NAME ?? "Our App",
    time: new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" }),
    year: new Date().getFullYear(),
  });

  const text = `
Hi ${options?.firstName ?? "there"}!

Your ${
    env.APP_NAME ?? "App"
  } account has been verified — and you're now signed in on the mobile app.

Time: ${new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" })}

Thanks,
The ${env.APP_NAME ?? "App"} Team
© ${new Date().getFullYear()} ${env.APP_NAME ?? "App"}
  `.trim();

  const mailOpts: SendMailOptions = {
    to,
    subject,
    text,
    html,
  };

  await sendEmail(mailOpts);
}
