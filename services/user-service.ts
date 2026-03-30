import apiConfig from "@/config/api";
import { userDataFake, userDataFakeAuthResponse } from "@/data/datas.fake";
import { isModeDemoEnabled } from "@/tools/tools";
import { AuthResponse, user } from "@/types/user.type";
import { ImageSource } from "expo-image";
import {
  getJsonAuth,
  postJson,
  postJsonAuth,
  uploadMultipartAuth,
} from "./api-client";

export type ProfilePhotoFile = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

type NativeUploadFilePart = {
  uri: string;
  name: string;
  type: string;
};

type UpdateProfilePhotoResponse = {
  message?: string;
};

export async function fetchConnectedUser(userToken: string): Promise<user> {
  if (!userToken) {
    throw new Error("Token utilisateur manquant");
  }

  if (isModeDemoEnabled()) {
    return userDataFake;
  }

  const data = await getJsonAuth<user>(
    apiConfig.endpoints.currentUser,
    userToken,
  );
  return data;
}

export function getConnectedUserProfilePhotoSource(
  userToken: string,
  cacheKey?: string | number,
): ImageSource {
  if (!userToken) {
    throw new Error("Token utilisateur manquant");
  }

  if (isModeDemoEnabled()) {
    return { uri: `https://i.pravatar.cc/240?u=${encodeURIComponent("demo")}` };
  }

  const baseURL = apiConfig.baseURL;
  if (!baseURL) {
    throw new Error(
      "EXPO_PUBLIC_API_BASE_URL is missing. Set it before creating a production build.",
    );
  }

  const profilePhotoUrl = new URL(
    `${baseURL}${apiConfig.endpoints.profilePhoto}`,
  );
  if (cacheKey != null) {
    profilePhotoUrl.searchParams.set("t", String(cacheKey));
  }

  return {
    uri: profilePhotoUrl.toString(),
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  };
}

export async function updateConnectedUserProfilePhoto(
  userToken: string,
  photo: ProfilePhotoFile,
): Promise<string> {
  if (!userToken) {
    throw new Error("Token utilisateur manquant");
  }

  if (!photo.uri) {
    throw new Error("Image de profil invalide");
  }

  if (isModeDemoEnabled()) {
    return "Photo mise à jour avec succès";
  }

  const normalizedFileName =
    photo.fileName?.trim() || `profile-${Date.now()}.jpg`;
  const normalizedMimeType = photo.mimeType?.trim() || "image/jpeg";
  const formData = new FormData();
  const filePart: NativeUploadFilePart = {
    uri: photo.uri,
    name: normalizedFileName,
    type: normalizedMimeType,
  };

  formData.append("file", filePart as unknown as Blob);

  const response = await uploadMultipartAuth<UpdateProfilePhotoResponse>(
    apiConfig.endpoints.profilePhoto,
    userToken,
    formData,
    "POST",
  );

  alert(response?.message?.trim());

  return response?.message?.trim() || "Photo mise à jour avec succès";
}

export async function signInApi(
  login: string,
  password: string,
): Promise<AuthResponse> {
  if (isModeDemoEnabled()) {
    return userDataFakeAuthResponse;
  }
  try {
    const data = await postJson<
      AuthResponse,
      { login: string; password: string }
    >(apiConfig.endpoints.login, { login, password });

    const token =
      typeof data?.access_token === "string" ? data.access_token : "";

    if (!token) {
      throw new Error("Réponse invalide du serveur de connexion");
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function refreshAccessTokenApi(
  refreshToken: string,
): Promise<AuthResponse> {
  if (isModeDemoEnabled()) {
    return userDataFakeAuthResponse;
  }

  if (!refreshToken) {
    throw new Error("Refresh token manquant");
  }

  const data = await postJson<AuthResponse, { refresh_token: string }>(
    apiConfig.endpoints.refresh,
    { refresh_token: refreshToken },
  );

  const token = typeof data?.access_token === "string" ? data.access_token : "";

  if (!token) {
    throw new Error("Réponse invalide du serveur de rafraîchissement");
  }

  return data;
}

export async function signOutApi(userToken: string): Promise<void> {
  if (isModeDemoEnabled()) {
    return;
  }

  if (!userToken) {
    throw new Error("Token utilisateur manquant");
  }

  await getJsonAuth<void>(apiConfig.endpoints.logout, userToken);
}

export async function updatePasswordApi(
  userToken: string,
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  if (isModeDemoEnabled()) {
    return;
  }

  if (!userToken) {
    throw new Error("Token utilisateur manquant");
  }

  const response = await postJsonAuth<void>(
    apiConfig.endpoints.changePassword,
    userToken,
    { oldPassword, newPassword },
  );
  return response;
}
