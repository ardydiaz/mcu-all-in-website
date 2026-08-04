# MCU All-in-One API

Layered Node.js and Express API for Microsoft Entra authentication, systems, users,
categories, announcements, roles, analytics, uploads, and dashboard data.

## Start

```powershell
npm install
npm run dev
```

The API runs at `http://localhost:3000`. The React administration interface
is located in `frontend/src/pages/admin`.

Service changes are stored in `data/services.json`.

## Microsoft Entra ID and MySQL setup

1. Create a Microsoft Entra application registration.
2. Add the Web redirect URI
   `http://localhost:3000/api/auth/microsoft/callback`.
3. Add Microsoft Graph delegated permission `User.Read`.
4. Create a client secret.
5. Copy `.env.example` to `.env` and supply the tenant, client, secret, and
   MySQL values.
6. Run `database/schema.sql` against MySQL.
7. Set `DB_ENABLED=true`.

New Microsoft users receive the Student role (`role_id = 4`) by default.
Promote authorized staff to Administrator or Super Admin directly in MySQL.

## Development Bearer token

For Postman testing in development, send `POST /api/login` with the
`API_TEST_USERNAME` and `API_TEST_PASSWORD` values from `.env`. The response
contains a standard Bearer JWT with the Super Admin role. This endpoint
returns `404` when `NODE_ENV=production`; production authentication remains
Microsoft-only.

## API documentation (Swagger)

With the API running, open `http://localhost:3000/api/docs` for the interactive
Swagger UI. The OpenAPI document is also available at
`http://localhost:3000/api/openapi.json`.

To test protected endpoints, first call `POST /api/login` in development,
copy the returned `token`, select **Authorize** in Swagger, and paste the JWT.

## Main endpoints

- `GET /api/auth/microsoft`
- `GET /api/auth/microsoft/callback`
- `POST /api/logout`
- `GET /api/me`
- `GET /api/dashboard`
- `/api/systems`
- `/api/services` (React compatibility alias)
- `/api/users`
- `/api/categories`
- `/api/announcements`
- `/api/roles`
- `/api/analytics`
- `/api/uploads`
- `GET /api/health`
- `GET /api/docs`

## Roles

1. Super Admin
2. Administrator
3. Faculty
4. Student
