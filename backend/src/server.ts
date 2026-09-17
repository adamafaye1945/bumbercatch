import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { apiRouter } from "./routes";
import { HttpError } from "./utils/httpError";

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/api", apiRouter);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    console.error("[api] Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
