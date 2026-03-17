import apiConfig, { getApiUrl } from '@/config/api';
import { useState } from 'react';

const DEMO_DELAY_MS = 700;
const DEMO_TOKEN = 'demo-token';

export const DEMO_ACCOUNT = {
  login: 'demo',
  password: 'demo123',
  email: 'demo@quincaillerie.dm',
  name: 'Compte demo',
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseResponseBody(response: Response) {
  const rawBody = await response.text();

  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}

export interface AuthState {
  isLoading: boolean;
  isSignout: boolean;
  userToken: string | null;
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
}

export interface UseAuthReturn extends AuthState {
  signIn: (login: string, password: string) => Promise<void>;
  signInDemo: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
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

  const signInDemo = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    setError(null);

    try {
      await wait(DEMO_DELAY_MS);

      applyAuthenticatedState(DEMO_TOKEN, {
        id: 'demo-user',
        email: DEMO_ACCOUNT.email,
        name: DEMO_ACCOUNT.name,
      });
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

      if (
        login.trim().toLowerCase() === DEMO_ACCOUNT.login &&
        password === DEMO_ACCOUNT.password
      ) {
        await wait(DEMO_DELAY_MS);

        applyAuthenticatedState(DEMO_TOKEN, {
          id: 'demo-user',
          email: DEMO_ACCOUNT.email,
          name: DEMO_ACCOUNT.name,
        });
        return;
      }
      
      // Call API
      const response = await fetch(getApiUrl(apiConfig.endpoints.login), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      const data = await parseResponseBody(response);

      if (!response.ok) {
        throw new Error(
          data?.message || 'Erreur lors de la connexion'
        );
      }

      const { token, user } = data ?? {};

      if (!token || !user) {
        throw new Error('Réponse invalide du serveur de connexion');
      }

      applyAuthenticatedState(token, user);
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

      if (email.trim().toLowerCase() === DEMO_ACCOUNT.email) {
        await wait(DEMO_DELAY_MS);

        applyAuthenticatedState(DEMO_TOKEN, {
          id: 'demo-user',
          email: DEMO_ACCOUNT.email,
          name: name.trim() || DEMO_ACCOUNT.name,
        });
        return;
      }

      // Call API
      const response = await fetch(getApiUrl(apiConfig.endpoints.register), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await parseResponseBody(response);

      if (!response.ok) {
        throw new Error(
          data?.message || "Erreur lors de l'inscription"
        );
      }

      const { token, user } = data ?? {};

      if (!token || !user) {
        throw new Error("Réponse invalide du serveur d'inscription");
      }

      applyAuthenticatedState(token, user);
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
          user: null,
        });
        setError(null);
        return;
      }

      // Call API
      await fetch(getApiUrl(apiConfig.endpoints.logout), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

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
    error,
  };
}
