import { Router } from "express";
import * as voiceService from "../services/voice.service";

export const voiceRouter = Router();

voiceRouter.post("/cancel", (_req, res) => {
  voiceService.requestVoiceCancel();
  res.status(204).send();
});

// The daemon polls this while recording; reading it also clears the flag so
// a stale cancel doesn't carry over into the next recording.
voiceRouter.get("/cancel", (_req, res) => {
  res.json({ cancel: voiceService.consumeVoiceCancel() });
});
