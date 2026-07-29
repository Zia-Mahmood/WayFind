import express from "express";
import { HookEvent, handleHook } from "./hooks";

export const start = (port: number, secret: string): void => {
  const app = express();
  app.post("/hook", (req: { body: HookEvent }, res: { sendStatus(code: number): void }) => {
    res.sendStatus(handleHook(req.body, secret));
  });
  app.listen(port);
};
