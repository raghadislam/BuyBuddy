export interface SendMailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export interface MailProvider {
  sendMail(opts: SendMailOptions): Promise<void>;
}
