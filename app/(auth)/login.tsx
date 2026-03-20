import { useAuthContext } from '@/hooks/auth-context';
import { DEMO_ACCOUNT } from '@/hooks/use-auth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import styles from './style.js';
 
import {
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    login?: string;
    password?: string;
  }>({});
  const { signIn, signInDemo, isLoading, error } = useAuthContext();
  const brandLogo = require('../../assets/images/logo.png');

  const validateForm = () => {
    const errors: {
      login?: string;
      password?: string;
    } = {};

    if (!login.trim()) {
 
      errors.login = 'Le login est requis';
    }

    if (!password.trim()) {
      errors.password = 'Le mot de passe est requis';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();

    if (!validateForm()) {
      return;
    }

    try {
      await signIn(login.trim(), password);
      router.replace('/(tabs)');
    } catch {
      // L'erreur est déjà exposée par le hook.
    }
  };

  const handleDemoLogin = async () => {
    Keyboard.dismiss();
    setLogin(DEMO_ACCOUNT.login);
    setPassword(DEMO_ACCOUNT.password);
    setValidationErrors({});

    try {
      await signInDemo();
      router.replace('/(tabs)');
    } catch {
      // L'erreur est déjà exposée par le hook.
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topSection}>
        {/* Partie haute (verte) */}
         <View style={styles.logoContainer}>
            <Image source={brandLogo} style={styles.logo} resizeMode="contain" />
          </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Connectez-vous</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}

          <TextInput
            placeholder="Nom d'utilisateur"
            value={login}
            onChangeText={setLogin}
            style={styles.input}
            editable={!isLoading}
          />
          {validationErrors.login && (
            <Text style={styles.fieldError}>{validationErrors.login}</Text>
          )}

          <TextInput
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
            editable={!isLoading}
          />
          {validationErrors.password && (
            <Text style={styles.fieldError}>{validationErrors.password}</Text>
          )}

          <TouchableOpacity
            style={[styles.buttonCnx, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.demoButton, isLoading && styles.buttonDisabled]}
            onPress={handleDemoLogin}
            disabled={isLoading}
          >
            <Text style={styles.demoButtonText}>Entrer en mode demo</Text>
          </TouchableOpacity>

          <Text style={styles.demoHint}>
            Compte demo : {DEMO_ACCOUNT.login} / {DEMO_ACCOUNT.password}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

