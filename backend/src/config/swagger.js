const bearerAuth = [{ bearerAuth: [] }];

const responses = (description) => ({ 200: { description } });

export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "MCU All-in-One API",
    version: "1.0.0",
    description: "Interactive API documentation for the MCU public directory and administration portal.",
  },
  servers: [{ url: "http://localhost:3000/api", description: "Local development" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      System: {
        type: "object",
        required: ["title", "category", "description"],
        properties: {
          id: { type: "string", example: "mcu-main" },
          title: { type: "string", example: "MCU Main Website" },
          category: { type: "string", example: "University" },
          description: { type: "string", example: "Official MCU website." },
          url: { type: "string", example: "https://mcu.edu.ph" },
          status: { type: "string", enum: ["active", "inactive"] },
          color: { type: "string", example: "violet" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: { tags: ["System"], summary: "API health check", responses: responses("Healthy") },
    },
    "/auth/microsoft": {
      get: { tags: ["Authentication"], summary: "Start Microsoft Entra ID authentication", responses: { 302: { description: "Microsoft redirect" } } },
    },
    "/auth/microsoft/callback": {
      get: { tags: ["Authentication"], summary: "Complete Microsoft authentication", responses: { 302: { description: "React redirect" } } },
    },
    "/login": {
      post: {
        tags: ["Authentication"],
        summary: "Development-only API token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: { type: "string", example: "api.admin" },
                  password: { type: "string", example: "MCUApi@2026" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Bearer JWT" }, 401: { description: "Invalid credentials" } },
      },
    },
    "/me": {
      get: { tags: ["Authentication"], summary: "Get authenticated user", security: bearerAuth, responses: { 200: { description: "User claims" }, 401: { description: "Authentication required" } } },
    },
    "/public/systems": {
      get: {
        tags: ["Public Directory"], summary: "List active public systems",
        responses: {
          200: {
            description: "Active systems",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/System" } } } },
          },
        },
      },
    },
    "/public/categories": {
      get: { tags: ["Public Directory"], summary: "List active public categories", responses: responses("Active categories") },
    },
    "/dashboard": {
      get: { tags: ["Dashboard"], summary: "Get dashboard metrics and activity", security: bearerAuth, responses: { 200: { description: "Dashboard summary" }, 401: { description: "Authentication required" }, 403: { description: "Administrator role required" } } },
    },
    "/users": {
      get: { tags: ["Users"], summary: "List directory users", security: bearerAuth, responses: { 200: { description: "Users" }, 403: { description: "Administrator role required" } } },
    },
    "/users/{id}/role": {
      patch: {
        tags: ["Users"], summary: "Update a user's role (Super Admin only)", security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["roleId"], properties: { roleId: { type: "integer", example: 2 } } } } } },
        responses: { 200: { description: "Role updated" }, 403: { description: "Super Admin role required" }, 404: { description: "User not found" } },
      },
    },
    "/systems": {
      get: { tags: ["Systems"], summary: "List all managed systems", security: bearerAuth, responses: responses("Systems") },
      post: {
        tags: ["Systems"], summary: "Create a system", security: bearerAuth,
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/System" } } } },
        responses: { 201: { description: "Created" } },
      },
    },
    "/systems/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: { tags: ["Systems"], summary: "Get a system", security: bearerAuth, responses: { 200: { description: "System" }, 404: { description: "Not found" } } },
      put: {
        tags: ["Systems"], summary: "Update a system", security: bearerAuth,
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/System" } } } },
        responses: responses("Updated"),
      },
      delete: { tags: ["Systems"], summary: "Soft delete a system", security: bearerAuth, responses: { 204: { description: "Soft deleted" } } },
    },
    "/systems/{id}/restore": {
      patch: {
        tags: ["Systems"], summary: "Restore a soft-deleted system", security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: responses("Restored"),
      },
    },
    "/categories": {
      get: { tags: ["Categories"], summary: "List categories", security: bearerAuth, responses: responses("Categories") },
      post: { tags: ["Categories"], summary: "Create a category", security: bearerAuth, responses: { 201: { description: "Created" } } },
    },
  },
};
