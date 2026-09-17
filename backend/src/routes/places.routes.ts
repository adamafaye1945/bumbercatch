import { Router } from "express";
import * as placesService from "../services/places.service";

export const placesRouter = Router();

placesRouter.get("/", async (_req, res) => {
  res.json(await placesService.listFavoritePlaces());
});

placesRouter.get("/:id", async (req, res) => {
  res.json(await placesService.getFavoritePlace(req.params.id));
});

placesRouter.post("/", async (req, res) => {
  const place = await placesService.createFavoritePlace(req.body);
  res.status(201).json(place);
});

placesRouter.patch("/:id", async (req, res) => {
  res.json(await placesService.updateFavoritePlace(req.params.id, req.body));
});

placesRouter.delete("/:id", async (req, res) => {
  await placesService.deleteFavoritePlace(req.params.id);
  res.status(204).send();
});
