import { userDataFake } from "@/data/datas.fake";
import { setCacheUserCode } from "@/services/cache-service";
import {
  fetchConnectedUser,
  refreshAccessTokenApi,
  signInApi,
  signOutApi,
} from "@/services/user-service";
import { user } from "@/types/user.type";
import { useCallback, useState } from "react";

const DEMO_DELAY_MS = 700;
const DEMO_TOKEN = "demo-token";

export const DEMO_ACCOUNT = {
  login: "demo",
  password: "demo123",
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface AuthState {
  isLoading: boolean;
  isSignout: boolean;
  userToken: string | null;
  refreshToken: string | null;
  user: user | null;
  profilePhotoVersion: number;
}

export interface UseAuthReturn extends AuthState {
  signIn: (login: string, password: string) => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthSession: () => void;
  refreshAccessToken: () => Promise<string | null>;
  refreshUserProfile: () => Promise<void>;
  refreshProfilePhoto: () => void;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    isLoading: false,
    isSignout: false,
    userToken: null,
    refreshToken: null,
    user: null,
    profilePhotoVersion: 0,
  });

  const [error, setError] = useState<string | null>(null);

  const applyAuthenticatedState = (
    token: string,
    refreshToken: string | null,
    user: AuthState["user"],
  ) => {
    setCacheUserCode(user?.code ?? null);
    setState({
      isLoading: false,
      isSignout: false,
      userToken: token,
      refreshToken,
      user,
      profilePhotoVersion: 0,
    });
  };

  const clearAuthSession = useCallback(() => {
    setCacheUserCode(null);
    setState({
      isLoading: false,
      isSignout: true,
      userToken: null,
      refreshToken: null,
      user: null,
      profilePhotoVersion: 0,
    });
    setError(null);
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (!state.refreshToken) {
      return null;
    }

    if (state.userToken === DEMO_TOKEN) {
      return state.userToken;
    }

    try {
      const authRes = await refreshAccessTokenApi(state.refreshToken);
      const nextAccessToken =
        typeof authRes?.access_token === "string" ? authRes.access_token : "";

      if (!nextAccessToken) {
        throw new Error("Réponse invalide du serveur de rafraîchissement");
      }

      setCacheUserCode(authRes.user?.code ?? state.user?.code ?? null);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isSignout: false,
        userToken: nextAccessToken,
        refreshToken: authRes.refresh_token || prev.refreshToken,
        user: authRes.user ?? prev.user,
      }));

      return nextAccessToken;
    } catch {
      return null;
    }
  }, [state.refreshToken, state.user, state.userToken]);

  const loadUserProfile = async (token: string) => {
    try {
      const profile = await fetchConnectedUser(token);
      setCacheUserCode(profile?.code ?? null);
      setState((prev) => ({ ...prev, user: profile }));
    } catch {
      // profil non critique, on ne bloque pas l'appli
    }
  };

  const refreshUserProfile = async () => {
    if (!state.userToken) {
      return;
    }
    await loadUserProfile(state.userToken);
  };

  const refreshProfilePhoto = () => {
    setState((prev) => ({ ...prev, profilePhotoVersion: Date.now() }));
  };

  const signInDemo = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    setError(null);

    try {
      await wait(DEMO_DELAY_MS);

      applyAuthenticatedState(DEMO_TOKEN, null, userDataFake);
      await loadUserProfile(DEMO_TOKEN);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur de connexion en mode demo";
      setError(errorMessage);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw err;
    }
  };

  const signIn = async (login: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    setError(null);

    try {
      // Validate input
      if (!login || !password) {
        throw new Error("Veuillez entrer votre login et mot de passe");
      }

      if (
        login.trim().toLowerCase() === DEMO_ACCOUNT.login &&
        password === DEMO_ACCOUNT.password
      ) {
        await wait(DEMO_DELAY_MS);
        applyAuthenticatedState(DEMO_TOKEN, null, userDataFake);
        await loadUserProfile(DEMO_TOKEN);
        return;
      }

      const authRes = await signInApi(login, password);
      applyAuthenticatedState(
        authRes.access_token,
        authRes.refresh_token,
        authRes.user,
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur de connexion";
      setError(errorMessage);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw err;
    }
  };

  const signOut = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      if (state.userToken === DEMO_TOKEN) {
        await wait(250);

        clearAuthSession();
        return;
      }

      // Call API
      await signOutApi(state.userToken ?? "");

      clearAuthSession();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la déconnexion";
      setError(errorMessage);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw err;
    }
  };

  return {
    ...state,
    signIn,
    signInDemo,
    signOut,
    clearAuthSession,
    refreshAccessToken,
    refreshUserProfile,
    refreshProfilePhoto,
    error,
  };
}
