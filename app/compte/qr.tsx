import { AppHeader } from '@/components/app-header';
import { useAuthContext } from '@/hooks/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  heroCard: {
    borderRadius: 22,
    padding: 18,
  },
  heroLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
  },
  heroEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  qrCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  qrGrid: {
    width: 216,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
  qrCell: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },
  codeText: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 22,
  },
  helpText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
