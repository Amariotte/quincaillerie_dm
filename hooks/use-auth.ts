import apiConfig, { getApiUrl } from '@/config/api';
import { useState } from 'react';

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
  signIn: (email: string, password: string) => Promise<void>;
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

  const signIn = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    setError(null);

    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Veuillez entrer votre email et mot de passe');
      }

      if (!email.includes('@')) {
        throw new Error('Veuillez entrer un email valide');
      }

       console.log("login URL",getApiUrl(apiConfig.endpoints.login))
      
      // Call API
      const response = await fetch(getApiUrl(apiConfig.endpoints.login), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });



      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Erreur lors de la connexion'
        );
      }
      console.log("s", response)

      const data = await response.json();
      console.log("data",data)

      const { token, user } = data;

      setState({
        isLoading: false,
        isSignout: false,
        userToken: token,
        user,
      });
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

      // Call API
      const response = await fetch(getApiUrl(apiConfig.endpoints.register), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de l'inscription"
        );
      }

      const data = await response.json();
      const { token, user } = data;

      setState({
        isLoading: false,
        isSignout: false,
        userToken: token,
        user,
      });
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
      // Call API
      await fetch(getApiUrl('/auth/logout'), {
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
    signUp,
    signOut,
    error,
  };
}
