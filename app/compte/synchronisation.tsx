import { AppHeader } from '@/components/app-header';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const syncSections = [
  { id: 'factures', label: 'Factures', detail: '12 éléments à vérifier' },
  { id: 'produits', label: 'Produits', detail: '48 références en cache' },
  { id: 'clients', label: 'Clients', detail: '9 comptes récemment modifiés' },
  { id: 'transactions', label: 'Transactions', detail: '50 opérations à consolider' },
];

export default function SyncScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1f2937' }, 'background');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('17/03/2026 13:32');

  const handleSync = async () => {
    setIsSyncing(true);
    await wait(900);
    setLastSync('17/03/2026 14:05');
    setIsSyncing(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader showBack title="Synchronisation" subtitle="Rafraîchissement global des données" />

          <View style={[styles.summaryCard, { backgroundColor: cardColor }]}> 
            <Text style={[styles.summaryLabel, { color: mutedColor }]}>Dernière synchronisation</Text>
            <Text style={[styles.summaryValue, { color: textColor }]}>{lastSync}</Text>
            <Text style={[styles.summaryHelp, { color: mutedColor }]}>Assurez-vous d’avoir une connexion stable avant de lancer la mise à jour complète.</Text>
          </View>

          <View style={styles.listBlock}>
            {syncSections.map((section) => (
              <View key={section.id} style={[styles.sectionCard, { backgroundColor: cardColor }]}> 
                <View style={[styles.iconWrap, { backgroundColor: `${tintColor}18` }]}> 
                  <MaterialIcons name="sync" size={18} color={tintColor} />
                </View>
                <View style={styles.sectionText}>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>{section.label}</Text>
                  <Text style={[styles.sectionDetail, { color: mutedColor }]}>{section.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleSync}
            disabled={isSyncing}
            style={[styles.syncButton, { backgroundColor: tintColor, opacity: isSyncing ? 0.7 : 1 }]}
          >
            <Text style={styles.syncButtonText}>{isSyncing ? 'Synchronisation en cours...' : 'Tout synchroniser'}</Text>
          </TouchableOpacity>
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
  summaryCard: {
    borderRadius: 22,
    padding: 18,
  },
  summaryLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
  },
  summaryHelp: {
    fontSize: 13,
    marginTop: 10,
    lineHeight: 20,
  },
  listBlock: {
    gap: 12,
  },
  sectionCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionDetail: {
    fontSize: 12,
    marginTop: 4,
  },
  syncButton: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
