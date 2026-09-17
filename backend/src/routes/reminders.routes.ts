import { Router } from "express";
import * as remindersService from "../services/reminders.service";

export const remindersRouter = Router();

remindersRouter.get("/", async (_req, res) => {
  res.json(await remindersService.listReminders());
});

remindersRouter.get("/:id", async (req, res) => {
  res.json(await remindersService.getReminder(req.params.id));
});

remindersRouter.post("/", async (req, res) => {
  const reminder = await remindersService.createReminder(req.body);
  res.status(201).json(reminder);
});

remindersRouter.post("/:id/dismiss", async (req, res) => {
  res.json(await remindersService.dismissReminder(req.params.id));
});

remindersRouter.post("/:id/snooze", async (req, res) => {
  const minutes = typeof req.body?.minutes === "number" ? req.body.minutes : undefined;
  res.json(await remindersService.snoozeReminder(req.params.id, minutes));
});

remindersRouter.delete("/:id", async (req, res) => {
  await remindersService.deleteReminder(req.params.id);
  res.status(204).send();
});
