import { ConfidentialClientApplication } from "@azure/msal-node";

const tenantId = process.env.MS_TENANT_ID || "";
const clientId = process.env.MS_CLIENT_ID || "";
const clientSecret = process.env.MS_CLIENT_SECRET || "";

export const microsoftRedirectUri =
  process.env.MS_REDIRECT_URI || "http://localhost:3000/api/auth/microsoft/callback";
export const microsoftScopes = ["openid", "profile", "email", "User.Read"];

export function getMicrosoftClient() {
  if (!tenantId || !clientId || !clientSecret) {
    const error = new Error("Microsoft Entra ID is not configured on the API server.");
    error.status = 503;
    throw error;
  }
  return new ConfidentialClientApplication({
    auth: {
      clientId,
      clientSecret,
      authority: `https://login.microsoftonline.com/${tenantId}`,
    },
  });
}
