import { AppHeader } from '@/components/app-header';
import { useAuthContext } from '@/hooks/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { sharedStyles } from '@/styles/shared.js';
import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style.js';

function createQrRowsFromCode(code: string, size = 12): string[] {
  const normalized = code.trim().toUpperCase();
  let seed = 2166136261;

  for (let i = 0; i < normalized.length; i += 1) {
    seed ^= normalized.charCodeAt(i);
    seed = Math.imul(seed, 16777619) >>> 0;
  }

  if (seed === 0) {
    seed = 1;
  }

  const rows: string[] = [];
  for (let row = 0; row < size; row += 1) {
    let rowBits = '';

    for (let col = 0; col < size; col += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const bit = (seed >>> 31) & 1;
      rowBits += bit ? '1' : '0';
    }

    rows.push(rowBits);
  }

  return rows;
}

export default function AccountQrScreen() {
  const { user } = useAuthContext();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1f2937' }, 'background');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  const userCode = (user?.code || user?.id || 'UTILISATEUR').toUpperCase();
  const qrRows = useMemo(() => createQrRowsFromCode(userCode), [userCode]);

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Mon code QR" subtitle="Partage rapide du compte connecté" />
      </View>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={sharedStyles.container}>
          <View style={[styles.heroCard, { backgroundColor: cardColor }]}> 
            <Text style={[styles.heroLabel, { color: mutedColor }]}>Titulaire</Text>
            <Text style={[styles.heroName, { color: textColor }]}>{user?.nom ?? 'Utilisateur'}</Text>
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
              {userCode}
            </Text>
            <Text style={[styles.helpText, { color: mutedColor }]}>Présentez ce code pour identifier rapidement votre session.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

