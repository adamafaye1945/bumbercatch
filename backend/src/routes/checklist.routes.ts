import { Router } from "express";
import * as checklistService from "../services/checklist.service";

export const checklistRouter = Router();

checklistRouter.get("/", async (_req, res) => {
  res.json(await checklistService.listChecklistItems());
});

checklistRouter.get("/:id", async (req, res) => {
  res.json(await checklistService.getChecklistItem(req.params.id));
});

checklistRouter.post("/", async (req, res) => {
  const item = await checklistService.createChecklistItem(req.body);
  res.status(201).json(item);
});

checklistRouter.patch("/:id", async (req, res) => {
  res.json(await checklistService.updateChecklistItem(req.params.id, req.body));
});

checklistRouter.delete("/:id", async (req, res) => {
  await checklistService.deleteChecklistItem(req.params.id);
  res.status(204).send();
});
