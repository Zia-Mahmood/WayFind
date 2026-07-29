import { verify } from "./crypto";

export interface HookEvent {
  event: string;
  payload: string;
  signature: string;
}

export const handleHook = (e: HookEvent, secret: string): number => {
  if (!verify(e.payload, secret, e.signature)) {
    return 401;
  }
  return 204;
};
