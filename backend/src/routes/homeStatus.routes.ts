import { Router } from "express";
import * as homeStatusService from "../services/homeStatus.service";

export const homeStatusRouter = Router();

// Singleton resource: only GET/PATCH make sense, there's always exactly one row.
homeStatusRouter.get("/", async (_req, res) => {
  res.json(await homeStatusService.getHomeStatus());
});

homeStatusRouter.patch("/", async (req, res) => {
  res.json(await homeStatusService.updateHomeStatus(req.body));
});
