import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "mcu-local-development-secret";
export const jwtCookieName = "mcu_admin_session";
// Absolute server-side expiration. Browser inactivity is enforced separately
// by the React session guard, which also calls /api/logout to revoke the cookie.
export const jwtExpiresInSeconds = Math.max(
  60,
  Number.parseInt(process.env.JWT_EXPIRES_IN_SECONDS || "28800", 10) || 28800,
);

export function signToken(payload) {
  return jwt.sign(payload, secret, {
    expiresIn: jwtExpiresInSeconds,
    issuer: "mcu-all-in-one-api",
    audience: "mcu-all-in-one-react",
  });
}

export function verifyToken(token = "") {
  try {
    return jwt.verify(token, secret, {
      issuer: "mcu-all-in-one-api",
      audience: "mcu-all-in-one-react",
    });
  } catch {
    return null;
  }
}
