import { AppHeader } from '@/components/app-header';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getCacheData, setCacheData, TRANSACTIONS_LIST_CACHE_KEY } from '@/services/cache-service';
import { getfetchMouvements } from '@/services/transactions-service';
import { listMouvements, typeMouvementColorMap } from '@/types/mouvements.type';
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
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor, borderColor } = useAppTheme();
  const offlineBg = useThemeColor({ light: '#fff7ed', dark: '#431407' }, 'background');
  const offlineText = useThemeColor({ light: '#c2410c', dark: '#fb923c' }, 'text');
  const { userToken } = useAuthContext();

  const [mouvements, setMouvements] = useState<listMouvements>({ meta: { page: 1, next: 2, totalPages: 1, total: 0, size: 0 }, data: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [query, setQuery] = useState('');

  const loadMouvements = useCallback(async () => {
    setIsLoading(true);
    try {
      const cached = await getCacheData<listMouvements>(TRANSACTIONS_LIST_CACHE_KEY);
      if (cached && cached.data.length > 0) {
        setMouvements(cached);
      }

      const data = await getfetchMouvements(userToken ?? '');
      setMouvements(data);
      setIsOfflineMode(false);
      await setCacheData(TRANSACTIONS_LIST_CACHE_KEY, data);
    } catch {
      setIsOfflineMode(true);
     
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMouvements();
  }, [loadMouvements]);

  const filtered = mouvements.data.filter((t) =>
    t.libType.toLowerCase().includes(query.toLowerCase()) ||
    t.nomAgence.toLowerCase().includes(query.toLowerCase()) ||
    t.nomSousCompte.toLowerCase().includes(query.toLowerCase()) ||
    t.codeOp.toLowerCase().includes(query.toLowerCase())
  );


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

          {isLoading && mouvements.data.length === 0 ? (
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
                const sc = typeMouvementColorMap[tx.libType] || tintColor;
                return (
                  <TouchableOpacity
                    key={tx.id}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/transactions/${tx.id}` as never)}
                    style={[styles.txCard, { backgroundColor: cardColor }]}
                  >
                    <View style={styles.txTopRow}>
                      <Text style={[styles.txLabel, { color: textColor }]} numberOfLines={1}>{tx.libType} {tx.codeOp}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: `${sc}18` }]}>
                      </View>
                    </View>
                    <View style={styles.txBottomRow}>
                      <Text style={[styles.txDate, { color: mutedColor }]}>{tx.dateOp}</Text>
                      <Text style={[styles.txAmount, { color: sc }]}>{tx.montant}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
