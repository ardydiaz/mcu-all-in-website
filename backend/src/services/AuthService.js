import { UserModel } from "../models/UserModel.js";
import { signToken } from "../config/jwt.js";
import { ActivityLogModel } from "../models/ActivityLogModel.js";
import { mkdir, writeFile } from "node:fs/promises";
import { microsoftPhotoPath, profilePhotoDirectory } from "../helpers/profilePhoto.js";

async function getMicrosoftProfile(accessToken) {
  const response = await fetch(
    "https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName,department",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!response.ok) {
    const error = new Error("Unable to retrieve the signed-in Microsoft profile.");
    error.status = 502;
    throw error;
  }
  const graphUser = await response.json();
  return {
    id: graphUser.id,
    email: String(graphUser.mail || graphUser.userPrincipalName || "").toLowerCase(),
    fullname: graphUser.displayName,
    department: graphUser.department || null,
  };
}

async function cacheMicrosoftProfilePhoto(accessToken, microsoftId) {
  try {
    const response = await fetch("https://graph.microsoft.com/v1.0/me/photo/$value", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return;
    const photo = Buffer.from(await response.arrayBuffer());
    if (!photo.length || photo.length > 5 * 1024 * 1024) return;
    await mkdir(profilePhotoDirectory, { recursive: true });
    await writeFile(microsoftPhotoPath(microsoftId), photo);
  } catch {
    // A missing photo or tenant permission must never prevent a successful sign-in.
  }
}

export const AuthService = {
  async authenticateMicrosoft(accessToken) {
    const profile = await getMicrosoftProfile(accessToken);
    if (!profile.id || !profile.email) {
      const error = new Error("Microsoft did not return a usable account identifier or email address.");
      error.status = 422;
      throw error;
    }

    let user = await UserModel.findByEmail(profile.email);
    if (!user) {
      user = await UserModel.createFromMicrosoft(
        profile,
        Number(process.env.MICROSOFT_DEFAULT_ROLE_ID) || 4,
      );
      await ActivityLogModel.record("user.provisioned", profile.email, { userId: user.id });
    } else {
      user = await UserModel.syncMicrosoftProfile(user.id, profile);
    }

    if (user.status !== "active") {
      const error = new Error("This MCU account is not active.");
      error.status = 403;
      throw error;
    }

    await cacheMicrosoftProfilePhoto(accessToken, profile.id);

    const token = signToken({
      sub: String(user.id),
      microsoftId: user.microsoft_id,
      email: user.email,
      name: user.fullname,
      roleId: user.role_id,
      role: user.role,
    });

    await ActivityLogModel.record("auth.microsoft_login", user.email, { role: user.role });
    return { token, user };
  },
};
