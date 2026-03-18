import { AppHeader } from '@/components/app-header';
import COLORS from '@/constants/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style.js';

export default function ChangePasswordScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1f2937' }, 'background');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#374151' }, 'text');
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = () => {
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

    setErrorMessage('');
    Alert.alert('Mot de passe modifié', 'Le mot de passe a été mis à jour avec succès.');
    setCurrentPassword('');
    setNextPassword('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader showBack title="Mot de passe" subtitle="Sécurisez votre accès utilisateur" />

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

            <TouchableOpacity onPress={handleSubmit} style={[styles.submitButton, { backgroundColor: tintColor }]}>
              <Text style={styles.submitButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

