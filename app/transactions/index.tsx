import { AppHeader } from '@/components/app-header';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getfetchMouvements } from '@/services/api-service';
import { getCacheData, setCacheData, TRANSACTIONS_LIST_CACHE_KEY } from '@/services/cache-service';
import { sharedStyles } from '@/styles/shared';
import { formatDate } from '@/tools/tools';
import { listMouvements, typeMouvementColorMap } from '@/types/mouvements.type';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style';

type PeriodSection = {
  key: string;
  title: string;
  data: listMouvements['data'];
};

function parseMouvementDate(value: string): Date | null {
  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }

  const normalized = value.trim();
  const slashMatch = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!slashMatch) {
    return null;
  }

  const day = Number(slashMatch[1]);
  const monthIndex = Number(slashMatch[2]) - 1;
  const year = Number(slashMatch[3]);
  const parsed = new Date(year, monthIndex, day);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function isSameDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

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
  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);

  const loadMouvements = useCallback(async () => {
    if (!userToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const cached = await getCacheData<listMouvements>(TRANSACTIONS_LIST_CACHE_KEY);
      if (cached && cached.data.length > 0) {
        setMouvements(cached);
      }

      const data = await getfetchMouvements(userToken);
      setMouvements(data);
      setIsOfflineMode(false);
      await setCacheData(TRANSACTIONS_LIST_CACHE_KEY, data);
    } catch {
      setIsOfflineMode(true);
     
    } finally {
      setIsLoading(false);
    }
  }, [userToken]);

  useEffect(() => {
    loadMouvements();
  }, [loadMouvements]);

  const filtered = useMemo(() => {
    if (!normalizedQuery) {
      return mouvements.data;
    }

    return mouvements.data.filter((t) =>
      t.libType.toLowerCase().includes(normalizedQuery) ||
      t.nomAgence.toLowerCase().includes(normalizedQuery) ||
      t.nomSousCompte.toLowerCase().includes(normalizedQuery) ||
      t.codeOp.toLowerCase().includes(normalizedQuery)
    );
  }, [mouvements.data, normalizedQuery]);

  const groupedSections = useMemo<PeriodSection[]>(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const beforeYesterday = new Date(today);
    beforeYesterday.setDate(today.getDate() - 2);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const buckets: Record<string, listMouvements['data']> = {
      today: [],
      yesterday: [],
      beforeYesterday: [],
      thisMonth: [],
      older: [],
    };

    for (const tx of filtered) {
      const txDate = parseMouvementDate(tx.dateOp);

      if (!txDate) {
        buckets.older.push(tx);
        continue;
      }

      if (isSameDay(txDate, today)) {
        buckets.today.push(tx);
        continue;
      }

      if (isSameDay(txDate, yesterday)) {
        buckets.yesterday.push(tx);
        continue;
      }

      if (isSameDay(txDate, beforeYesterday)) {
        buckets.beforeYesterday.push(tx);
        continue;
      }

      if (txDate >= monthStart && txDate <= now) {
        buckets.thisMonth.push(tx);
        continue;
      }

      buckets.older.push(tx);
    }

    return [
      { key: 'today', title: "Aujourd'hui", data: buckets.today },
      { key: 'yesterday', title: 'Hier', data: buckets.yesterday },
      { key: 'beforeYesterday', title: 'Avant-hier', data: buckets.beforeYesterday },
      { key: 'thisMonth', title: 'Ce mois', data: buckets.thisMonth },
      { key: 'older', title: 'Plus anciens', data: buckets.older },
    ].filter((section) => section.data.length > 0);
  }, [filtered]);

  const handleTransactionPress = (tx: listMouvements['data'][number]) => {
    if (tx.libType === 'Vente') {
      router.push(`/ventes/${tx.id}` as never);
      return;
    }

    if (tx.libType === 'Réglement') {
      router.push(`/reglements/${tx.id}` as never);
      return;
    }

    if (tx.libType === 'Commission') {
      router.push(`/commissions/${tx.id}` as never);
      return;
    }

    if (tx.libType === 'Décaissement') {
      router.push('/operations' as never);
      return;
    }

    Alert.alert('Détail indisponible', 'Aucun écran de détail n\'est associé à ce type pour le moment.');
  };


  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Transactions" subtitle="50 derniers mouvements financiers" />
      </View>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={sharedStyles.container}>
          {isOfflineMode && (
            <View style={[styles.offlineBanner, { backgroundColor: offlineBg }]}>
              <MaterialIcons name="cloud-off" size={16} color={offlineText} />
              <Text style={[styles.offlineText, { color: offlineText }]}>Mode déconnecté</Text>
            </View>
          )}

          <View style={[sharedStyles.searchBox, { backgroundColor: cardColor, borderColor }]}>
            <MaterialIcons name="search" size={20} color={mutedColor} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher une transaction"
              placeholderTextColor={mutedColor}
              style={[sharedStyles.searchInput, { color: textColor }]}
            />
          </View>

          {isLoading && mouvements.data.length === 0 ? (
            <View style={styles.loaderBlock}>
              <ActivityIndicator size="large" color={tintColor} />
            </View>
          ) : filtered.length === 0 ? (
            <View style={[sharedStyles.emptyCard, { backgroundColor: cardColor }]}>
              <MaterialIcons name="inbox" size={40} color={mutedColor} />
              <Text style={[sharedStyles.emptyTitle, { color: textColor }]}>Aucune transaction</Text>
              <Text style={[sharedStyles.emptyText, { color: mutedColor }]}>Aucun résultat pour cette recherche.</Text>
            </View>
          ) : (
            <View style={sharedStyles.listBlock}>
              {groupedSections.map((section) => (
                <View key={section.key} style={styles.sectionBlock}>
                  <Text style={[styles.sectionHeader, { color: textColor }]}>{section.title}</Text>
                  <View style={styles.sectionRows}>
                    {section.data.map((tx) => {
                      const sc = typeMouvementColorMap[tx.libType] || tintColor;
                      return (
                        <TouchableOpacity
                          key={String(tx.id)}
                          activeOpacity={0.85}
                          onPress={() => handleTransactionPress(tx)}
                          style={[styles.txCard, { backgroundColor: cardColor }]}
                        >
                          <View style={styles.txTopRow}>
                            <Text style={[styles.txLabel, { color: textColor }]} numberOfLines={1}>{tx.libType} {tx.codeOp}</Text>
                            <View style={[sharedStyles.statusBadge, { backgroundColor: `${sc}18` }]}>
                            </View>
                          </View>
                          <View style={styles.txBottomRow}>
                            <Text style={[styles.txDate, { color: mutedColor }]}>{formatDate(tx.dateOp)}</Text>
                            <Text style={[styles.txAmount, { color: sc }]}>{tx.montant}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
