import { AuthButton } from '@/components/auth-button';
import { AuthInput } from '@/components/auth-input';
import { useAuth } from '@/hooks/use-auth';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import {
    Keyboard,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoading, error } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const handleLogin = async () => {
    Keyboard.dismiss();
    try {
      await signIn(email, password);
      // Navigation will be handled by the router based on auth state
    } catch {
      // Error is already handled by the hook
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerSection}>
            <View
              style={[
                styles.logoContainer,
                {
                  backgroundColor: tintColor,
                },
              ]}
            >
              <MaterialIcons name="login" size={48} color="white" />
            </View>
            <Text style={[styles.title, { color: textColor }]}>
              Bienvenue
            </Text>
            <Text style={[styles.subtitle, { color: textColor }]}>
              Connectez-vous à votre compte
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {error && (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={20} color="#ef4444" />
                <Text style={styles.errorMessage}>{error}</Text>
              </View>
            )}

            <AuthInput
              label="Email"
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              icon={<MaterialIcons name="email" size={20} color={tintColor} />}
            />

            <AuthInput
              label="Mot de passe"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
              icon={<MaterialIcons name="lock" size={20} color={tintColor} />}
            />

            <TouchableOpacity style={styles.showPasswordButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={18}
                color={tintColor}
              />
              <Text style={[styles.showPasswordText, { color: tintColor }]}>
                {showPassword ? 'Masquer' : 'Afficher'}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity style={styles.forgotPasswordButton}>
              <Text style={[styles.forgotPasswordText, { color: tintColor }]}>
                Mot de passe oublié?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <AuthButton
              title={isLoading ? 'Connexion...' : 'Se connecter'}
              onPress={handleLogin}
              loading={isLoading}
              disabled={!email || !password || isLoading}
            />
          </View>

          {/* Footer */}
          <View style={styles.footerSection}>
            <Text style={[styles.footerText, { color: textColor }]}>
              Vous n&apos;avez pas de compte?{' '}
            </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text
                  style={[
                    styles.signupLink,
                    {
                      color: tintColor,
                    },
                  ]}
                >
                  S&apos;inscrire
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    opacity: 0.7,
    textAlign: 'center',
  },
  formSection: {
    marginVertical: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorMessage: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  showPasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16,
  },
  showPasswordText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPasswordButton: {
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '400',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
