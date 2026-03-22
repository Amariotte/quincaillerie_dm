import { AppHeader } from '@/components/app-header';
import { menuItems } from '@/data/menus';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { fetchSoldeCompte, getfetchRecentMouvements, getStats } from '@/services/api-service';
import { BALANCE_CACHE_KEY, getCacheData, RECENTS_MOUVEMENTS_CACHE_KEY, setCacheData, STAT_DATA_CACHE_KEY } from '@/services/cache-service';
import { formatAmount } from '@/tools/tools';
import { listMouvements } from '@/types/mouvements.type';
import { stat } from '@/types/other.type';
import { SoldeResponse } from '@/types/solde.type';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './styles.js';


export default function HomeScreen() {
  const router = useRouter();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor } = useAppTheme();
  const { userToken } = useAuthContext();

  const [accountBalance, setAccountBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [recentMouvements, setRecentMouvements] = useState<listMouvements>({ meta: { page: 1, next: 2, totalPages: 1, total: 0, size: 0 }, data: [] });
  const [isLoadingRecentMouvements, setIsLoadingRecentMouvements] = useState(true);
  const [statInfos, setStatInfos] = useState<stat | null>(null);

  const loadBalance = useCallback(async () => {
    let hasCachedBalance = false;
    try {
      setIsLoadingBalance(true);
      const parsedCache = await getCacheData<SoldeResponse>(BALANCE_CACHE_KEY);

      if (parsedCache) {
        const cachedBalance = Number(parsedCache.solde);

        if (!Number.isNaN(cachedBalance)) {
          setAccountBalance(cachedBalance);
          hasCachedBalance = true;
        }
      }

      if (!userToken) {
        throw new Error('Token utilisateur manquant');
      }

      const solde = await fetchSoldeCompte(userToken);

      setAccountBalance(Number(solde));
      setIsOfflineMode(false);

      await setCacheData(
        BALANCE_CACHE_KEY,
        { solde: solde },
      );
    } catch {
      setIsOfflineMode(true);

    } finally {
      setIsLoadingBalance(false);
    }
  }, [userToken]);

  const loadStatData = useCallback(async () => {
    try {
      const cached = await getCacheData<stat>(STAT_DATA_CACHE_KEY);
      if (cached) {
        setStatInfos(cached);
      }
      if (!userToken) {
        return;
      }
      const statInfos = await getStats( userToken ?? '');
      setStatInfos(statInfos);
      await setCacheData(STAT_DATA_CACHE_KEY, statInfos);
    } catch (ex) {
      setIsOfflineMode(true);
    }
  }, [userToken]);


   const loadRecentMouvements = useCallback(async () => {
    setIsLoadingRecentMouvements(true);
    try {
      const cached = await getCacheData<listMouvements>(RECENTS_MOUVEMENTS_CACHE_KEY);
      if (cached && cached.data.length > 0) {
        setRecentMouvements(cached);
      }
      if (!userToken) {
        return;
      }
      const data = await getfetchRecentMouvements(userToken ?? '');
      setRecentMouvements(data);
      await setCacheData(RECENTS_MOUVEMENTS_CACHE_KEY, data);
    } catch (ex) {
      setIsOfflineMode(true);
    } finally {
      setIsLoadingRecentMouvements(false);
    }
  }, [userToken]);

  useEffect(() => {
    loadBalance();
    loadRecentMouvements();
    loadStatData();
  }, [loadBalance, loadRecentMouvements, loadStatData]);

  const handleMenuPress = (itemId: string) => {
    if (itemId === 'factures') {
      router.push('/factures' as never);
      return;
    }

    if (itemId === 'proformas') {
      router.push('/proformas' as never);
      return;
    }

    if (itemId === 'bons') {
      router.push('/bons' as never);
      return;
    }

    if (itemId === 'reglements') {
      router.push('/reglements' as never);
      return;
    }

    if (itemId === 'produits') {
      router.push('/produits' as never);
      return;
    }

    if (itemId === 'achats') {
      router.push('/achats' as never);
      return;
    }

    if (itemId === 'transactions') {
      router.push('/transactions' as never);
      return;
    }

    if (itemId === 'promotions') {
      router.push('/promotions' as never);
      return;
    }

    if (itemId === 'operations') {
      router.push('/operations' as never);
      return;
    }

    if (itemId === 'commissions') {
      router.push('/commissions' as never);
      return;
    }

    if (itemId === 'cartes') {
      router.push('/cartes' as never);
      return;
    }

    if (itemId === 'devis') {
      router.push('/devis/nouveau');
      return;
    }

    Alert.alert('Bientot disponible', 'Ce module n\'est pas encore relie dans cette version.');
  };

  const renderMenuItem = ({ item }: { item: (typeof menuItems)[number] }) => (
    <TouchableOpacity
      onPress={() => handleMenuPress(item.id)}
      style={[
        styles.menuCard,
        { backgroundColor: cardColor },
        item.featured && { backgroundColor: item.tint, justifyContent: 'center' },
      ]}
    >
      <View
        style={[
          styles.menuIcon,
          { backgroundColor: item.featured ? 'rgba(255,255,255,0.18)' : `${item.tint}18` },
        ]}
      >
        <MaterialIcons
          name={item.icon as any}
          size={26}
          color={item.featured ? '#ffffff' : item.tint}
        />
      </View>
      <Text
        style={[
          styles.menuLabel,
          { color: item.featured ? '#ffffff' : textColor },
        ]}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderRecentMouvement = ({ item: mouvement }: { item: listMouvements['data'][number] }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/transactions/${mouvement.id}` as never)}
      style={[styles.transactionCard, { backgroundColor: cardColor }]}
    >
      <View style={[styles.transactionIcon, { backgroundColor: `${tintColor}15` }]}>
        <MaterialIcons name="sync-alt" size={20} color={tintColor} />
      </View>
      <View style={styles.transactionContent}>
        <Text style={[styles.transactionLabel, { color: textColor }]}>{mouvement.libType} {mouvement.codeOp}</Text>
        <Text style={[styles.transactionDate, { color: mutedColor }]}>{mouvement.dateOp}</Text>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[styles.transactionAmount, { color: textColor }]}>{formatAmount(mouvement.montant)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader title="Tableau de bord" subtitle="Vue globale de vos opérations" isOffline={isOfflineMode} />

          <View style={[styles.balanceCard, { backgroundColor: cardColor }]}> 
            <View style={styles.balanceRow}>
              <View>
                <Text style={[styles.balanceAmount, { color: tintColor }]}>
                  {isLoadingBalance
                    ? 'Chargement...'
                    : accountBalance !== null
                      ? formatAmount(accountBalance)
                      : 'Solde indisponible'}
                </Text>
                <Text style={[styles.balanceCaption, { color: '#f59e0b' }]}>Mon solde courant</Text>
              </View>
              <TouchableOpacity onPress={loadBalance} style={[styles.depositButton, { backgroundColor: tintColor }]}> 
                <MaterialIcons name="refresh" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricBlock}>
                <Text style={[styles.metricLabel, { color: mutedColor }]}>Factures non soldées</Text>
                <Text style={[styles.metricValue, { color: textColor }]}>{statInfos?.venteNonSoldee.nbre ?? 0}</Text>
              </View>
              <View style={styles.metricBlock}>
                <Text style={[styles.metricLabel, { color: mutedColor }]}>Factures échues</Text>
                <Text style={[styles.metricValue, { color: textColor }]}>{statInfos?.venteEchue.nbre ?? 0}</Text>
              </View>
              <View style={styles.metricBlock}>
                <Text style={[styles.metricLabel, { color: mutedColor }]}>Promotions actives</Text>
                <Text style={[styles.metricValue, { color: textColor }]}>{statInfos?.promotionActive ?? 0}</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: textColor }]}>Menu</Text>

          <FlatList
            data={menuItems}
            keyExtractor={(item) => item.id}
            renderItem={renderMenuItem}
            numColumns={4}
            scrollEnabled={false}
            columnWrapperStyle={styles.menuRow}
            contentContainerStyle={styles.menuGrid}
          />

          <View style={styles.transactionsHeader}>
            <Text style={[styles.sectionTitle, styles.transactionTitle, { color: textColor }]}>20 Dernières transactions</Text>
            <TouchableOpacity onPress={() => router.push('/transactions' as never)}>
              <Text style={[styles.seeAllText, { color: tintColor }]}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionList}>
            {isLoadingRecentMouvements && recentMouvements.data.length === 0 ? (
              <View style={[styles.transactionCard, { backgroundColor: cardColor, justifyContent: 'center' }]}>
                <Text style={[styles.transactionLabel, { color: mutedColor, textAlign: 'center' }]}>Chargement...</Text>
              </View>
            ) : recentMouvements.data.length === 0 ? (
              <View style={[styles.transactionCard, { backgroundColor: cardColor, justifyContent: 'center' }]}>
                <Text style={[styles.transactionLabel, { color: mutedColor, textAlign: 'center' }]}>Aucune transaction recente</Text>
              </View>
            ) : (
              <FlatList
                data={recentMouvements.data}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderRecentMouvement}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
