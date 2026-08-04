import { logger } from "../helpers/logger.js";
export function notFoundMiddleware(request, response) {
  response.status(404).json({ message: `Route ${request.method} ${request.originalUrl} was not found.` });
}
export function errorMiddleware(error, _request, response, _next) {
  logger.error(error.stack || error.message);
  const status = error.status || 500;
  const isDevelopment = process.env.NODE_ENV !== "production";
  response.status(status).json({
    message: error.status || isDevelopment
      ? error.message
      : "An unexpected server error occurred.",
  });
}
