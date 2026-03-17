import { AppHeader } from '@/components/app-header';
import { useAuthContext } from '@/hooks/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style.js';

const qrRows = [
  '111011101110',
  '100010001010',
  '101110111010',
  '101000101010',
  '101011101010',
  '100000001010',
  '111111101110',
  '001010100010',
  '111011111010',
  '100010001010',
  '101110101110',
  '111000100011',
];

export default function AccountQrScreen() {
  const { user } = useAuthContext();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1f2937' }, 'background');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader showBack title="Mon code QR" subtitle="Partage rapide du compte connecté" />

          <View style={[styles.heroCard, { backgroundColor: cardColor }]}> 
            <Text style={[styles.heroLabel, { color: mutedColor }]}>Titulaire</Text>
            <Text style={[styles.heroName, { color: textColor }]}>{user?.name ?? 'Utilisateur'}</Text>
            <Text style={[styles.heroEmail, { color: mutedColor }]}>{user?.email ?? 'Aucun email'}</Text>
          </View>

          <View style={[styles.qrCard, { backgroundColor: cardColor }]}> 
            <View style={styles.qrGrid}>
              {qrRows.map((row, rowIndex) =>
                row.split('').map((cell, cellIndex) => (
                  <View
                    key={`${rowIndex}-${cellIndex}`}
                    style={[
                      styles.qrCell,
                      { backgroundColor: cell === '1' ? tintColor : '#ffffff' },
                    ]}
                  />
                ))
              )}
            </View>
            <Text style={[styles.codeText, { color: textColor }]}>
              DM-{(user?.id ?? 'UTILISATEUR').toUpperCase()}
            </Text>
            <Text style={[styles.helpText, { color: mutedColor }]}>Présentez ce code pour identifier rapidement votre session.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

