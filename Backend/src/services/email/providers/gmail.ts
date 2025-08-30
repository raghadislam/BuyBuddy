import nodemailer from "nodemailer";
import { MailProvider, SendMailOptions } from "../interface";
import env from "../../../config/env.config";

export class GmailProvider implements MailProvider {
  transporter: nodemailer.Transporter;

  constructor() {
    // Simpler: Gmail with App Password
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_PASSWORD,
      },
    });

    // OAuth2 (requires refresh token)
  }

  async sendMail(opts: SendMailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: env.EMAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
  }
}
