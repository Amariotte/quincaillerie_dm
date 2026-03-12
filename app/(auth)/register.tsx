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

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const { signUp, isLoading, error } = useAuth();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!name.trim()) {
      errors.name = 'Le nom est requis';
    }

    if (!email.includes('@')) {
      errors.email = 'Veuillez entrer un email valide';
    }

    if (password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    Keyboard.dismiss();

    if (!validateForm()) {
      return;
    }

    try {
      await signUp(email, password, name);
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
              <MaterialIcons name="person-add" size={48} color="white" />
            </View>
            <Text style={[styles.title, { color: textColor }]}>
              Créer un compte
            </Text>
            <Text style={[styles.subtitle, { color: textColor }]}>
              Rejoignez-nous dès aujourd&apos;hui
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {error && (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={20} color="#ef4444" />
                <Text
                  style={styles.errorMessage}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {error}
                </Text>
              </View>
            )}

            <AuthInput
              label="Nom complet"
              placeholder="Jean Dupont"
              autoCapitalize="words"
              autoComplete="name"
              value={name}
              onChangeText={setName}
              editable={!isLoading}
              error={validationErrors.name}
              icon={<MaterialIcons name="person" size={20} color={tintColor} />}
            />

            <AuthInput
              label="Email"
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              error={validationErrors.email}
              icon={<MaterialIcons name="email" size={20} color={tintColor} />}
            />

            <AuthInput
              label="Mot de passe"
              placeholder="••••••••"
              secureTextEntry={true}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
              error={validationErrors.password}
              icon={<MaterialIcons name="lock" size={20} color={tintColor} />}
            />

            <AuthInput
              label="Confirmer le mot de passe"
              placeholder="••••••••"
              secureTextEntry={true}
              autoCapitalize="none"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!isLoading}
              error={validationErrors.confirmPassword}
              icon={<MaterialIcons name="lock" size={20} color={tintColor} />}
            />

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <View style={styles.requirementItem}>
              <MaterialIcons
                name={password.length >= 6 ? 'check-circle' : 'radio-button-unchecked'}
                size={16}
                color={password.length >= 6 ? '#10b981' : '#d1d5db'}
              />
              <Text
                style={[
                  styles.requirementText,
                  {
                    color: password.length >= 6 ? '#10b981' : textColor,
                  },
                ]}
              >
                Au moins 6 caractères
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <MaterialIcons
                name={
                  password && confirmPassword && password === confirmPassword
                    ? 'check-circle'
                    : 'radio-button-unchecked'
                }
                size={16}
                color={
                  password && confirmPassword && password === confirmPassword
                    ? '#10b981'
                    : '#d1d5db'
                }
              />
              <Text
                style={[
                  styles.requirementText,
                  {
                    color:
                      password &&
                      confirmPassword &&
                      password === confirmPassword
                        ? '#10b981'
                        : textColor,
                  },
                ]}
              >
                Les mots de passe correspondent
              </Text>
            </View>
          </View>

            {/* Register Button */}
            <AuthButton
              title={isLoading ? 'Inscription...' : "S'inscrire"}
              onPress={handleRegister}
              loading={isLoading}
              disabled={
                !name || !email || !password || !confirmPassword || isLoading
              }
              style={{ marginTop: 16 }}
            />
          </View>

          {/* Footer */}
          <View style={styles.footerSection}>
            <Text style={[styles.footerText, { color: textColor }]}>
              Vous avez déjà un compte?{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text
                  style={[
                    styles.loginLink,
                    {
                      color: tintColor,
                    },
                  ]}
                >
                  Se connecter
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
    marginBottom: 30,
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
  requirementsContainer: {
    marginBottom: 24,
    paddingVertical: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    marginLeft: 8,
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
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
