// src/services/email/templates/index.ts
import fs from "fs/promises";
import path from "path";
import Handlebars from "handlebars";
import env from "../../../config/env.config";

export async function renderTemplate(
  templateName: string,
  data: Record<string, any> = {}
): Promise<string> {
  const templatesRoot = env.TEMPLATES_PATH;
  const filePath = path.join(
    process.cwd(),
    templatesRoot,
    `${templateName}.html.hbs`
  );

  const raw = await fs.readFile(filePath, "utf-8");
  const compiled = Handlebars.compile(raw);
  return compiled(data);
}
