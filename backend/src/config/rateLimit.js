import rateLimit from "express-rate-limit";

function positiveInteger(value, fallback) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

const windowMs = positiveInteger(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);

function tooManyRequests(_request, response) {
  response.status(429).json({
    message: "Too many sign-in attempts. Please wait a few minutes and try again.",
  });
}

const commonOptions = {
  windowMs,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: tooManyRequests,
};

// Applies only when a browser starts an Entra sign-in. The callback remains
// unrestricted so Microsoft can always return the user after authentication.
export const microsoftLoginLimiter = rateLimit({
  ...commonOptions,
  limit: positiveInteger(process.env.MICROSOFT_LOGIN_RATE_LIMIT, 20),
});

// Local API-test credentials are more susceptible to brute-force attempts.
export const localLoginLimiter = rateLimit({
  ...commonOptions,
  limit: positiveInteger(process.env.LOCAL_LOGIN_RATE_LIMIT, 5),
});
