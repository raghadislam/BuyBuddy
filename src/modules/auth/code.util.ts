import crypto from "crypto";
import bcrypt from "bcrypt";

export const generateNumericCode = (length = 6): string => {
  const max = 10 ** length;
  const num = crypto.randomInt(0, max);
  return num.toString().padStart(length, "0");
};

export const hashCode = async (code: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(code, saltRounds);
};

export const compareCode = async (
  code: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(code, hash);
};
