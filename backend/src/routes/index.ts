import { Router } from "express";
import { checklistRouter } from "./checklist.routes";
import { emailsRouter } from "./emails.routes";
import { notificationsRouter } from "./notifications.routes";
import { placesRouter } from "./places.routes";
import { homeStatusRouter } from "./homeStatus.routes";
import { garminStatsRouter } from "./garminStats.routes";
import { garminWeeklyRouter } from "./garminWeekly.routes";
import { remindersRouter } from "./reminders.routes";
import { voiceRouter } from "./voice.routes";
import { weatherRouter } from "./weather.routes";
import { r6Router } from "./r6.routes";

export const apiRouter = Router();

apiRouter.use("/checklist", checklistRouter);
apiRouter.use("/emails", emailsRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/places", placesRouter);
apiRouter.use("/home-status", homeStatusRouter);
apiRouter.use("/garmin-stats", garminStatsRouter);
apiRouter.use("/garmin-weekly", garminWeeklyRouter);
apiRouter.use("/reminders", remindersRouter);
apiRouter.use("/voice", voiceRouter);
apiRouter.use("/weather", weatherRouter);
apiRouter.use("/r6", r6Router);
