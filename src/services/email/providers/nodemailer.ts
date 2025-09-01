import nodemailer from "nodemailer";
import { MailProvider, SendMailOptions } from "../interface";
import env from "../../../config/env.config";

export class NodemailerProvider implements MailProvider {
  transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(env.SMTP_URL);
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
