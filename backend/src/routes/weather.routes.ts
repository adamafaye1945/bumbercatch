import { Router } from "express";
import * as weatherService from "../services/weather.service";

export const weatherRouter = Router();

weatherRouter.get("/", async (_req, res) => {
  res.json(await weatherService.getWeatherForecast());
});
