export const swaggerDocument = {
  openapi: "3.0.3",
  info: { title: "MCU All-in-One API", version: "1.0.0" },
  servers: [{ url: "http://localhost:3000/api" }],
  paths: {
    "/health": { get: { summary: "API health check", responses: { 200: { description: "Healthy" } } } },
    "/auth/microsoft": { get: { summary: "Start Microsoft Entra ID authentication", responses: { 302: { description: "Microsoft redirect" } } } },
    "/auth/microsoft/callback": { get: { summary: "Complete Microsoft authentication", responses: { 302: { description: "React redirect" } } } },
    "/systems": { get: { summary: "List MCU systems", responses: { 200: { description: "System list" } } } },
  },
};
