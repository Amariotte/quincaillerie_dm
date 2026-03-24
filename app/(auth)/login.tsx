import { useAuthContext } from '@/hooks/auth-context';
import COLORS from '@/styles/colors';
import { sharedStyles } from '@/styles/shared';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import styles from './style.js';

import { DEMO_ACCOUNT } from '@/hooks/use-auth';
import { isModeDemoEnabled } from '@/tools/tools';
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<'login' | 'password' | null>(null);
  const passwordInputRef = useRef<TextInput>(null);
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
      <View style={styles.loginContainer}>
        <View style={styles.logoContainer}>
          <Image source={brandLogo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandName}>{process.env.EXPO_PUBLIC_APP_NAME}</Text>
        </View>

        <View style={styles.formBlock}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={sharedStyles.errorMessage}>{error}</Text>
            </View>
          )}

          <Text style={styles.loginLabel}>Nom d'utilisateur</Text>
          <View
            style={[
              styles.inputRow,
              focusedField === 'login' && styles.inputRowFocused,
              validationErrors.login && styles.inputRowError,
            ]}
          >
            <FontAwesome name="user" size={18} color={COLORS.primaryColor} style={styles.inputIcon} />
            <TextInput
              placeholder="Nom d'utilisateur"
              placeholderTextColor={COLORS.accentColor}
              value={login}
              onChangeText={setLogin}
              style={styles.loginInput}
              editable={!isLoading}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              textContentType="username"
              returnKeyType="next"
              onFocus={() => setFocusedField('login')}
              onBlur={() => setFocusedField(null)}
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
          </View>
          {validationErrors.login && (
            <Text style={styles.fieldError}>{validationErrors.login}</Text>
          )}

          <Text style={styles.loginLabel}>Mot de passe</Text>
          <View
            style={[
              styles.inputRow,
              focusedField === 'password' && styles.inputRowFocused,
              validationErrors.password && styles.inputRowError,
            ]}
          >
            <FontAwesome name="lock" size={18} color={COLORS.primaryColor} style={styles.inputIcon} />
            <TextInput
              ref={passwordInputRef}
              placeholder="Mot de passe"
              placeholderTextColor={COLORS.accentColor}
              value={password}
              onChangeText={setPassword}
              style={styles.loginInput}
              secureTextEntry={!isPasswordVisible}
              editable={!isLoading}
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              onPress={() => setIsPasswordVisible((prev) => !prev)}
              activeOpacity={0.8}
              style={styles.passwordToggle}
              disabled={isLoading}
            >
              <FontAwesome
                name={isPasswordVisible ? 'eye-slash' : 'eye'}
                size={18}
                color={COLORS.primaryColor}
              />
            </TouchableOpacity>
          </View>
          {validationErrors.password && (
            <Text style={styles.fieldError}>{validationErrors.password}</Text>
          )}

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Connexion...' : 'Se connecter →'}
            </Text>
          </TouchableOpacity>


          {isModeDemoEnabled() && (
            <TouchableOpacity
              style={[styles.guestButton, isLoading && styles.buttonDisabled]}
              onPress={handleDemoLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.guestButtonText}>Mode demo→</Text>
            </TouchableOpacity>
          )}

          <View style={styles.socialLinksContainer}>
            <TouchableOpacity style={styles.socialIcon} activeOpacity={0.85}>
              <FontAwesome name="facebook" size={18} color={COLORS.primaryColor} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon} activeOpacity={0.85}>
              <FontAwesome name="instagram" size={18} color={COLORS.primaryColor} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon} activeOpacity={0.85}>
              <FontAwesome name="linkedin" size={18} color={COLORS.primaryColor} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

