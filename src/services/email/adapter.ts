import { MailProvider, SendMailOptions } from "./interface";
import { NodemailerProvider } from "./providers/nodemailer";
import { GmailProvider } from "./providers/gmail";
import env from "../../config/env.config";

export function createMailProvider(): MailProvider {
  switch (env.NODE_ENV) {
    case "development":
      return new GmailProvider();
    case "development":
    default:
      return new NodemailerProvider();
  }
}
