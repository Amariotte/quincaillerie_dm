import { userDataFake } from '@/data/fakeDatas/user.fake';
import { signInApi, signOutApi, signUpApi } from '@/services/auth-service';
import { fetchConnectedUser } from '@/services/user-service';
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
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  error: string | null;
}


function toAuthUser(user: user | null | undefined): AuthState['user'] {
  if (!user) {
    return null;
  }

  const id = user.id ?? '';
  const email = user.email ?? '';
  const nom = user.nom ?? '';

  if (!id || !email || !nom) {
    return null;
  }

  return { id, email, nom, representantLegal: user.representantLegal ?? '', dateNaissance: user.dateNaissance ?? '', adresse: user.adresse ?? '' };
}
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    isLoading: false,
    isSignout: false,
    userToken: null,
    user: null  });

  const [error, setError] = useState<string | null>(null);

  const applyAuthenticatedState = (token: string, user: AuthState['user']) => {
    setState({
      isLoading: false,
      isSignout: false,
      userToken: token,
      user: null,
    });
  };

  const loadUserProfile = async (token: string) => {
    try {
      const profile = await fetchConnectedUser(token);
      setState((prev) => ({ ...prev, userProfile: profile }));
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
      const baseUser = authRes.user ?? await fetchConnectedUser(authRes.token);
      applyAuthenticatedState(authRes.token, baseUser);
      await loadUserProfile(authRes.token);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw err;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    setError(null);

    try {
      // Validate input
      if (!email || !password || !name) {
        throw new Error('Veuillez remplir tous les champs');
      }

      if (!email.includes('@')) {
        throw new Error('Veuillez entrer un email valide');
      }

      if (password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }

      if (email.trim().toLowerCase() === userDataFake.email) {
        await wait(DEMO_DELAY_MS);
        applyAuthenticatedState(DEMO_TOKEN, userDataFake);
        await loadUserProfile(DEMO_TOKEN);
        return;
      }

      const authRes = await signUpApi(email, password, name);
      const baseUser = authRes.user ?? await fetchConnectedUser(authRes.token);
      applyAuthenticatedState(authRes.token, baseUser);
      await loadUserProfile(authRes.token);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de l'inscription";
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

        setState({
          isLoading: false,
          isSignout: true,
          userToken: null,
          user: null
        });
        setError(null);
        return;
      }

      // Call API
      await signOutApi(state.userToken ?? '');

      setState({
        isLoading: false,
        isSignout: true,
        userToken: null,
        user: null,
      });
      setError(null);
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
    signUp,
    signOut,
    refreshUserProfile,
    error,
  };
}
