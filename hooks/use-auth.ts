import { userDataFake } from '@/data/datas.fake';
import { fetchConnectedUser, signInApi, signOutApi } from '@/services/user-service';
import { user } from '@/types/user.type';
import { useState } from 'react';

const DEMO_DELAY_MS = 700;
const DEMO_TOKEN = 'demo-token';

export const DEMO_ACCOUNT = {
  login: 'demo',
  password: 'demo123'
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface AuthState {
  isLoading: boolean;
  isSignout: boolean;
  userToken: string | null;
  user: user | null;
}

export interface UseAuthReturn extends AuthState {
  signIn: (login: string, password: string) => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthSession: () => void;
  refreshUserProfile: () => Promise<void>;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    isLoading: false,
    isSignout: false,
    userToken: null,
    user: null,
  });

  const [error, setError] = useState<string | null>(null);

  const applyAuthenticatedState = (token: string, user: AuthState['user']) => {
    setState({
      isLoading: false,
      isSignout: false,
      userToken: token,
      user,
    });
  };

  const clearAuthSession = () => {
    setState({
      isLoading: false,
      isSignout: true,
      userToken: null,
      user: null,
    });
    setError(null);
  };

  const loadUserProfile = async (token: string) => {
    try {
      const profile = await fetchConnectedUser(token);
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

  const signInDemo = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    setError(null);

    try {
      await wait(DEMO_DELAY_MS);

      applyAuthenticatedState(DEMO_TOKEN, userDataFake);
      await loadUserProfile(DEMO_TOKEN);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erreur de connexion en mode demo';
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
        throw new Error('Veuillez entrer votre login et mot de passe');
      }

      if (login.trim().toLowerCase() === DEMO_ACCOUNT.login &&
        password === DEMO_ACCOUNT.password
      ) {
        await wait(DEMO_DELAY_MS);
        applyAuthenticatedState(DEMO_TOKEN, userDataFake);
        await loadUserProfile(DEMO_TOKEN);
        return;
      }

      const authRes = await signInApi(login, password);
      applyAuthenticatedState(authRes.access_token, authRes.user);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erreur de connexion';
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
      await signOutApi(state.userToken ?? '');

      clearAuthSession();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erreur lors de la déconnexion';
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
    refreshUserProfile,
    error,
  };
}
