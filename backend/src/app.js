import express from "express";
import apiRoutes from "./routes/index.js";
import { corsConfig } from "./config/cors.js";
import { swaggerDocument } from "./config/swagger.js";
import { errorMiddleware, notFoundMiddleware } from "./middleware/errorMiddleware.js";
import { loggerMiddleware } from "./middleware/loggerMiddleware.js";

const app = express();
app.disable("x-powered-by");
app.use(corsConfig);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

app.get("/", (_request, response) => response.json({
  application: "MCU All-in-One API",
  version: "1.0.0",
  status: "running",
  health: "/api/health",
  documentation: "/api/docs",
}));
app.get("/api/docs", (_request, response) => response.json(swaggerDocument));
app.use("/api", apiRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
