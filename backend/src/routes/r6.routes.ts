import { Router } from "express";
import * as r6Service from "../services/r6.service";

export const r6Router = Router();

r6Router.get("/leaderboard", async (_req, res) => {
  res.json(await r6Service.getLeaderboard());
});
