import crypto from "node:crypto";
import { AuthService } from "../services/AuthService.js";
import { jwtCookieName, jwtExpiresInSeconds } from "../config/jwt.js";
import {
  getMicrosoftClient,
  microsoftRedirectUri,
  microsoftScopes,
} from "../config/microsoft.js";
import { signToken } from "../config/jwt.js";

const stateCookie = "mcu_oauth_state";
const returnCookie = "mcu_oauth_return";

function cookies(request) {
  return Object.fromEntries((request.headers.cookie || "").split(";").filter(Boolean).map((cookie) => {
    const [name, ...value] = cookie.trim().split("=");
    return [name, decodeURIComponent(value.join("="))];
  }));
}

function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge,
    path: "/",
  };
}

export const AuthController = {
  async microsoftRedirect(request, response) {
    const state = crypto.randomBytes(32).toString("hex");
    const requestedReturn = String(request.query.returnTo || "");
    const returnTo = requestedReturn.startsWith("/") ? requestedReturn : "/admin";
    response.cookie(stateCookie, state, cookieOptions(10 * 60 * 1000));
    response.cookie(returnCookie, returnTo, cookieOptions(10 * 60 * 1000));

    const authorizationUrl = await getMicrosoftClient().getAuthCodeUrl({
      scopes: microsoftScopes,
      redirectUri: microsoftRedirectUri,
      responseMode: "query",
      state,
      prompt: "select_account",
    });
    response.redirect(authorizationUrl);
  },

  async microsoftCallback(request, response) {
    const requestCookies = cookies(request);
    if (!request.query.state || request.query.state !== requestCookies[stateCookie]) {
      return response.status(400).json({ message: "Invalid or expired Microsoft authentication state." });
    }
    if (!request.query.code) {
      return response.status(400).json({ message: request.query.error_description || "Microsoft authentication was cancelled." });
    }

    const result = await getMicrosoftClient().acquireTokenByCode({
      code: request.query.code,
      scopes: microsoftScopes,
      redirectUri: microsoftRedirectUri,
    });
    const authentication = await AuthService.authenticateMicrosoft(result.accessToken);

    response.cookie(jwtCookieName, authentication.token, cookieOptions(jwtExpiresInSeconds * 1000));
    response.clearCookie(stateCookie, { path: "/" });
    response.clearCookie(returnCookie, { path: "/" });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const isAdmin = ["super_admin", "administrator"].includes(authentication.user.role);
    const requestedReturn = requestCookies[returnCookie];
    const safeReturn = requestedReturn?.startsWith("/") ? requestedReturn : null;
    const adminAccessDenied = !isAdmin && safeReturn?.startsWith("/admin");
    const destination = isAdmin ? (safeReturn || "/admin") : (safeReturn || "/");
    const loginHandoff = new URL("/login", clientUrl);
    loginHandoff.searchParams.set("microsoftLogin", adminAccessDenied ? "approvalRequired" : "success");
    if (!adminAccessDenied) loginHandoff.searchParams.set("next", destination);
    response.redirect(loginHandoff.toString());
  },

  localLogin(request, response) {
    if (process.env.NODE_ENV === "production") {
      return response.status(404).json({ message: "Route not found." });
    }

    const defaultUsername = process.env.API_TEST_USERNAME || "api.admin";
    const defaultPassword = process.env.API_TEST_PASSWORD || "MCUApi@2026";
    if (request.body.username !== defaultUsername || request.body.password !== defaultPassword) {
      return response.status(401).json({ message: "Invalid API test credentials." });
    }

    const user = {
      id: "api-test-admin",
      email: process.env.API_TEST_EMAIL || "api.admin@mcu.edu.ph",
      name: "MCU API Test Administrator",
      roleId: 1,
      role: "super_admin",
    };
    const token = signToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      role: user.role,
    });

    return response.json({
      message: "Development API token generated.",
      tokenType: "Bearer",
      expiresIn: jwtExpiresInSeconds,
      token,
      user,
    });
  },

  logout(_request, response) {
    response.clearCookie(jwtCookieName, { httpOnly: true, sameSite: "lax", path: "/" });
    response.status(204).end();
  },

  me(request, response) {
    response.json({ user: request.user });
  },
};
