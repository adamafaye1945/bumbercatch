import { Router } from "express";
import * as emailsService from "../services/emails.service";

export const emailsRouter = Router();

emailsRouter.get("/", async (_req, res) => {
  res.json(await emailsService.listEmails());
});

emailsRouter.get("/:id", async (req, res) => {
  res.json(await emailsService.getEmail(req.params.id));
});

emailsRouter.post("/", async (req, res) => {
  const email = await emailsService.createEmail(req.body);
  res.status(201).json(email);
});

emailsRouter.patch("/:id", async (req, res) => {
  res.json(await emailsService.updateEmail(req.params.id, req.body));
});

emailsRouter.delete("/:id", async (req, res) => {
  await emailsService.deleteEmail(req.params.id);
  res.status(204).send();
});
