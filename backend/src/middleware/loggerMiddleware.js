import { logger } from "../helpers/logger.js";
export function loggerMiddleware(request, response, next) {
  const started = Date.now();
  response.on("finish", () => logger.info(request.method, request.originalUrl, response.statusCode, `${Date.now() - started}ms`));
  next();
}
