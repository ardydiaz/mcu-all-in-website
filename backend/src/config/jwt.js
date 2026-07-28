import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "mcu-local-development-secret";
export const jwtCookieName = "mcu_admin_session";
export const jwtExpiresInSeconds = 60 * 60 * 8;

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
