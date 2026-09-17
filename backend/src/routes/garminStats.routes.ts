import { Router } from "express";
import * as garminStatsService from "../services/garminStats.service";

export const garminStatsRouter = Router();

// Singleton resource: only GET/PATCH make sense, there's always exactly one row.
garminStatsRouter.get("/", async (_req, res) => {
  res.json(await garminStatsService.getGarminStats());
});

garminStatsRouter.patch("/", async (req, res) => {
  res.json(await garminStatsService.updateGarminStats(req.body));
});
