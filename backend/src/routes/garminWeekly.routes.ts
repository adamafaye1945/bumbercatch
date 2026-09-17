import { Router } from "express";
import * as garminWeeklyService from "../services/garminWeekly.service";
import type { GarminMetric } from "../services/garminWeekly.service";

export const garminWeeklyRouter = Router();

// GET /?metric=steps to filter to one metric's 7-day series, or omit for all.
garminWeeklyRouter.get("/", async (req, res) => {
  const metric = req.query.metric as GarminMetric | undefined;
  res.json(await garminWeeklyService.listGarminWeeklyStats(metric));
});

garminWeeklyRouter.get("/:id", async (req, res) => {
  res.json(await garminWeeklyService.getGarminWeeklyStat(Number(req.params.id)));
});

garminWeeklyRouter.post("/", async (req, res) => {
  const point = await garminWeeklyService.createGarminWeeklyStat(req.body);
  res.status(201).json(point);
});

garminWeeklyRouter.patch("/:id", async (req, res) => {
  res.json(await garminWeeklyService.updateGarminWeeklyStat(Number(req.params.id), req.body));
});

garminWeeklyRouter.delete("/:id", async (req, res) => {
  await garminWeeklyService.deleteGarminWeeklyStat(Number(req.params.id));
  res.status(204).send();
});
