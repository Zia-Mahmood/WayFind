import { createHmac } from "node:crypto";

export function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verify(payload: string, secret: string, signature: string): boolean {
  return sign(payload, secret) === signature;
}
