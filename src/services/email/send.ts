import { SendMailOptions } from "./interface";
import { createMailProvider } from "./adapter";
import env from "../../config/env.config";
import { renderTemplate } from "./templates";

const provider = createMailProvider();

export async function sendEmail(opts: SendMailOptions) {
  await provider.sendMail(opts);
}

export async function sendVerificationCode(
  to: string,
  code: string,
  options?: {
    subject?: string;
  }
): Promise<void> {
  const ttl = env.EMAIL_VERIFICATION_TTL_MINUTES;
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

  return;
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

export async function sendPasswordResetCode(
  to: string,
  code: string,
  options?: { subject?: string }
): Promise<void> {
  const ttl =
    env.PASSWORD_RESET_TTL_MINUTES ?? env.EMAIL_VERIFICATION_TTL_MINUTES ?? 15;
  const subject = options?.subject ?? "Reset your password";
  const text = `You requested to reset your password. Use this code to reset it: ${code}\nThis code expires in ${ttl} minutes.\nIf you didn't request this, ignore this email.`;

  const html = await renderTemplate("passwordReset", {
    code,
    ttlMinutes: ttl,
    appName: env.APP_NAME ?? "Our App",
    time: new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" }),
  });

  const mailOpts: SendMailOptions = {
    to,
    subject,
    text,
    html,
  };

  await provider.sendMail(mailOpts);
  return;
}
