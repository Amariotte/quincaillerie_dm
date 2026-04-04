import { AppHeader } from '@/components/app-header';
import { FeedbackPopup } from '@/components/ui/feedback-popup';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getApiErrorPopupHandler, setApiErrorPopupHandler } from '@/services/api-client';
import { updatePasswordApi } from '@/services/user-service';
import { sharedStyles } from '@/styles/shared.js';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const [isSuccessPopupVisible, setIsSuccessPopupVisible] = useState(false);

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

    const prevHandler = getApiErrorPopupHandler();
    setApiErrorPopupHandler((payload) => {
      setErrorMessage(payload.message);
    });

    try {
      await updatePasswordApi(userToken, currentPassword, nextPassword);
      setCurrentPassword('');
      setNextPassword('');
      setConfirmPassword('');
      setIsSuccessPopupVisible(true);
    } catch {
      // error message already set by inline handler above
    } finally {
      setIsSubmitting(false);
      setApiErrorPopupHandler(prevHandler);
    }
  };

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Mot de passe" subtitle="Sécurisez votre accès utilisateur" />
      </View>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={sharedStyles.container}>
          
      

             {!!errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={sharedStyles.errorMessage}>{errorMessage}</Text>
            </View>
          )}          
          
        
          
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

      <FeedbackPopup
        visible={isSuccessPopupVisible}
        type="success"
        title="Mot de passe modifié"
        message="Le mot de passe a été mis à jour avec succès."
        buttonLabel="Continuer"
        onClose={() => setIsSuccessPopupVisible(false)}
      />
    </SafeAreaView>
  );
}

