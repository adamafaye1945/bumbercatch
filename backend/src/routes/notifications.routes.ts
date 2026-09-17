import { Router } from "express";
import * as notificationsService from "../services/notifications.service";

export const notificationsRouter = Router();

notificationsRouter.get("/", async (_req, res) => {
  res.json(await notificationsService.listNotifications());
});

notificationsRouter.get("/:id", async (req, res) => {
  res.json(await notificationsService.getNotification(req.params.id));
});

notificationsRouter.post("/", async (req, res) => {
  const notification = await notificationsService.createNotification(req.body);
  res.status(201).json(notification);
});

notificationsRouter.post("/read-all", async (_req, res) => {
  await notificationsService.markAllNotificationsRead();
  res.status(204).send();
});

notificationsRouter.patch("/:id", async (req, res) => {
  res.json(await notificationsService.updateNotification(req.params.id, req.body));
});

notificationsRouter.delete("/:id", async (req, res) => {
  await notificationsService.deleteNotification(req.params.id);
  res.status(204).send();
});
