import { AppHeader } from '@/components/app-header';
import COLORS from '@/constants/colors';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { updatePasswordApi } from '@/services/user-service';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style.js';

export default function ChangePasswordScreen() {
  const { userToken } = useAuthContext();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor, borderColor } = useAppTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !nextPassword || !confirmPassword) {
      setErrorMessage('Veuillez remplir tous les champs.');
      return;
    }

    if (nextPassword.length < 6) {
      setErrorMessage('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (nextPassword !== confirmPassword) {
      setErrorMessage('Les deux nouveaux mots de passe ne correspondent pas.');
      return;
    }

    if (!userToken) {
      setErrorMessage('Session invalide. Veuillez vous reconnecter.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await updatePasswordApi(userToken, currentPassword, nextPassword);
      Alert.alert('Mot de passe modifié', 'Le mot de passe a été mis à jour avec succès.');
      setCurrentPassword('');
      setNextPassword('');
      setConfirmPassword('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Impossible de modifier le mot de passe.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Mot de passe" subtitle="Sécurisez votre accès utilisateur" />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={[styles.card, { backgroundColor: cardColor }]}> 
            <Text style={[styles.label, { color: mutedColor }]}>Mot de passe actuel</Text>
            <TextInput
              value={currentPassword}
              onChangeText={(value) => {
                setCurrentPassword(value);
                if (errorMessage) setErrorMessage('');
              }}
              secureTextEntry
              placeholder="Saisissez le mot de passe actuel"
              placeholderTextColor={mutedColor}
              style={[styles.input, { color: textColor, borderColor }]}
            />

            <Text style={[styles.label, { color: mutedColor }]}>Nouveau mot de passe</Text>
            <TextInput
              value={nextPassword}
              onChangeText={(value) => {
                setNextPassword(value);
                if (errorMessage) setErrorMessage('');
              }}
              secureTextEntry
              placeholder="Minimum 6 caractères"
              placeholderTextColor={mutedColor}
              style={[styles.input, { color: textColor, borderColor }]}
            />

            <Text style={[styles.label, { color: mutedColor }]}>Confirmer le nouveau mot de passe</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                if (errorMessage) setErrorMessage('');
              }}
              secureTextEntry
              placeholder="Répétez le mot de passe"
              placeholderTextColor={mutedColor}
              style={[styles.input, { color: textColor, borderColor }]}
            />

            {!!errorMessage && (
              <Text style={[styles.errorText, { color: COLORS.errorColor }]}>{errorMessage}</Text>
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={[
                styles.submitButton,
                { backgroundColor: tintColor, opacity: isSubmitting ? 0.7 : 1 },
              ]}
            >
              <Text style={styles.submitButtonText}>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

