import { AppHeader } from '@/components/app-header';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  const handleSubmit = () => {
    if (!currentPassword || !nextPassword || !confirmPassword) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }

    if (nextPassword.length < 6) {
      Alert.alert('Mot de passe invalide', 'Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (nextPassword !== confirmPassword) {
      Alert.alert('Confirmation invalide', 'Les deux nouveaux mots de passe ne correspondent pas.');
      return;
    }

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
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="Saisissez le mot de passe actuel"
              placeholderTextColor={mutedColor}
              style={[styles.input, { color: textColor, borderColor }]}
            />

            <Text style={[styles.label, { color: mutedColor }]}>Nouveau mot de passe</Text>
            <TextInput
              value={nextPassword}
              onChangeText={setNextPassword}
              secureTextEntry
              placeholder="Minimum 6 caractères"
              placeholderTextColor={mutedColor}
              style={[styles.input, { color: textColor, borderColor }]}
            />

            <Text style={[styles.label, { color: mutedColor }]}>Confirmer le nouveau mot de passe</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Répétez le mot de passe"
              placeholderTextColor={mutedColor}
              style={[styles.input, { color: textColor, borderColor }]}
            />

            <TouchableOpacity onPress={handleSubmit} style={[styles.submitButton, { backgroundColor: tintColor }]}>
              <Text style={styles.submitButtonText}>Enregistrer</Text>
            </TouchableOpacity>
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
    paddingBottom: 32,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 18,
  },
  card: {
    borderRadius: 22,
    padding: 18,
  },
  label: {
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 6,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
