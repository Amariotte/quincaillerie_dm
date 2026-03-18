import { AppHeader } from '@/components/app-header';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getCacheData, setCacheData, TRANSACTIONS_LIST_CACHE_KEY } from '@/services/cache-service';
import { fetchTransactions, getTransactionsFromFakeData } from '@/services/transactions-service';
import { Transaction } from '@/types/transactions.type';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style';

export default function TransactionsScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1f2937' }, 'background');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#374151' }, 'text');
  const offlineBg = useThemeColor({ light: '#fff7ed', dark: '#431407' }, 'background');
  const offlineText = useThemeColor({ light: '#c2410c', dark: '#fb923c' }, 'text');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [updatedAt, setUpdatedAt] = useState('');
  const [query, setQuery] = useState('');

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const cached = await getCacheData<Transaction[]>(TRANSACTIONS_LIST_CACHE_KEY);
      if (cached && cached.length > 0) {
        setTransactions(cached);
      }

      const data = await fetchTransactions();
      setTransactions(data);
      setIsOfflineMode(false);
      const now = new Date().toLocaleString('fr-FR');
      setUpdatedAt(now);
      await setCacheData(TRANSACTIONS_LIST_CACHE_KEY, data);
    } catch {
      setIsOfflineMode(true);
      if (transactions.length === 0) {
        setTransactions(getTransactionsFromFakeData());
        setUpdatedAt('Source locale (fakeData)');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filtered = transactions.filter((t) =>
    t.label.toLowerCase().includes(query.toLowerCase()) ||
    t.status.toLowerCase().includes(query.toLowerCase())
  );

  const statusColor = (status: string) => {
    if (status === 'Payée') return '#16a34a';
    if (status === 'En attente') return '#f59e0b';
    if (status === 'Livré') return '#3b82f6';
    return '#dc2626';
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader showBack title="Transactions" subtitle="50 derniers mouvements financiers" />

          {isOfflineMode && (
            <View style={[styles.offlineBanner, { backgroundColor: offlineBg }]}>
              <MaterialIcons name="cloud-off" size={16} color={offlineText} />
              <Text style={[styles.offlineText, { color: offlineText }]}>Mode déconnecté</Text>
            </View>
          )}

          <View style={[styles.searchBox, { backgroundColor: cardColor, borderColor }]}>
            <MaterialIcons name="search" size={20} color={mutedColor} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher une transaction"
              placeholderTextColor={mutedColor}
              style={[styles.searchInput, { color: textColor }]}
            />
          </View>

          {isLoading && transactions.length === 0 ? (
            <View style={styles.loaderBlock}>
              <ActivityIndicator size="large" color={tintColor} />
            </View>
          ) : filtered.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: cardColor }]}>
              <MaterialIcons name="inbox" size={40} color={mutedColor} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Aucune transaction</Text>
              <Text style={[styles.emptyText, { color: mutedColor }]}>Aucun résultat pour cette recherche.</Text>
            </View>
          ) : (
            <View style={styles.listBlock}>
              {filtered.map((tx) => {
                const sc = statusColor(tx.status);
                return (
                  <TouchableOpacity
                    key={tx.id}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/transactions/${tx.id}` as never)}
                    style={[styles.txCard, { backgroundColor: cardColor }]}
                  >
                    <View style={styles.txTopRow}>
                      <Text style={[styles.txLabel, { color: textColor }]} numberOfLines={1}>{tx.label}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: `${sc}18` }]}>
                        <Text style={[styles.statusText, { color: sc }]}>{tx.status}</Text>
                      </View>
                    </View>
                    <View style={styles.txBottomRow}>
                      <Text style={[styles.txDate, { color: mutedColor }]}>{tx.date}</Text>
                      <Text style={[styles.txAmount, { color: textColor }]}>{tx.amount}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {updatedAt.length > 0 && (
            <Text style={[styles.updatedAt, { color: mutedColor }]}>Mis à jour : {updatedAt}</Text>
          )}

          <TouchableOpacity
            onPress={loadTransactions}
            style={[styles.refreshButton, { backgroundColor: tintColor }]}
          >
            <MaterialIcons name="refresh" size={18} color="#ffffff" />
            <Text style={styles.refreshText}>Actualiser</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
