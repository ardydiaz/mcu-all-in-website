import { jwtCookieName, verifyToken } from "../config/jwt.js";

function parseCookies(header = "") {
  return Object.fromEntries(header.split(";").filter(Boolean).map((cookie) => {
    const [name, ...value] = cookie.trim().split("=");
    return [name, decodeURIComponent(value.join("="))];
  }));
}

export function authMiddleware(request, response, next) {
  const bearer = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  const token = bearer || parseCookies(request.headers.cookie)[jwtCookieName];
  const user = verifyToken(token);
  if (!user) return response.status(401).json({ message: "Authentication required." });
  request.user = user;
  next();
}
