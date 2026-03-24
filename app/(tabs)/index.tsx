import { AppHeader } from '@/components/app-header';
import { menuItems } from '@/data/menus';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { fetchSoldeCompte, getfetchPromotions, getfetchRecentMouvements, getStats } from '@/services/api-service';
import { BALANCE_CACHE_KEY, getCacheData, PROMOTIONS_LIST_CACHE_KEY, RECENTS_MOUVEMENTS_CACHE_KEY, setCacheData, STAT_DATA_CACHE_KEY } from '@/services/cache-service';
import COLORS from '@/styles/colors';
import { sharedStyles } from '@/styles/shared.js';
import { formatAmount, formatDate } from '@/tools/tools';
import { listMouvements, typeMouvementColorMap } from '@/types/mouvements.type';
import { stat } from '@/types/other.type';
import { listPromotions, promotion, promotionStatus, statusPromotionColorMap } from '@/types/promotions.type';
import { SoldeResponse } from '@/types/solde.type';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './styles.js';

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

function getSignedAmountDisplay(mouvement: listMouvements['data'][number]) {
  const absoluteAmount = Math.abs(Number(mouvement.montant) || 0);

  if (mouvement.libType === 'Réglement' || mouvement.libType === 'Commission') {
    return {
      label: `+ ${formatAmount(absoluteAmount)}`,
      color: typeMouvementColorMap['Réglement'],
    };
  }

  if (mouvement.libType === 'Vente' || mouvement.libType === 'Décaissement') {
    return {
      label: `- ${formatAmount(absoluteAmount)}`,
      color: COLORS.errorColor,
    };
  }

  return {
    label: formatAmount(absoluteAmount),
    color: typeMouvementColorMap[mouvement.libType] || COLORS.errorColor,
  };
}

function parsePromotionDate(value?: Date): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getPromotionStatusFromDates(promotionItem: promotion): promotionStatus {
  const now = Date.now();
  const startDate = parsePromotionDate(promotionItem.dateDebut);
  const endDate = parsePromotionDate(promotionItem.dateFin);

  if (startDate && now < startDate.getTime()) {
    return 'A venir';
  }

  if (endDate && now > endDate.getTime()) {
    return 'A venir';
  }

  if (startDate || endDate) {
    return 'En cours';
  }

  return promotionItem.status ?? 'A venir';
}


export default function HomeScreen() {
  const router = useRouter();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor } = useAppTheme();
  const { userToken } = useAuthContext();

  const [accountBalance, setAccountBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [recentMouvements, setRecentMouvements] = useState<listMouvements>({ meta: { page: 1, next: 2, totalPages: 1, total: 0, size: 0 }, data: [] });
  const [isLoadingRecentMouvements, setIsLoadingRecentMouvements] = useState(true);
  const [statInfos, setStatInfos] = useState<stat | null>(null);
  const [promotions, setPromotions] = useState<listPromotions>({ meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 }, data: [] });

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

  const loadPromotionsData = useCallback(async () => {
    try {
      const cached = await getCacheData<listPromotions>(PROMOTIONS_LIST_CACHE_KEY);
      if (cached && cached.data.length > 0) {
        setPromotions(cached);
      }

      if (!userToken) {
        return;
      }

      const data = await getfetchPromotions(userToken);
      setPromotions(data);
      await setCacheData(PROMOTIONS_LIST_CACHE_KEY, data);
    } catch {
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
    loadPromotionsData();
  }, [loadBalance, loadRecentMouvements, loadStatData, loadPromotionsData]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([loadBalance(), loadRecentMouvements(), loadStatData(), loadPromotionsData()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadBalance, loadRecentMouvements, loadStatData, loadPromotionsData]);

  const promotionsBanner = useMemo(() => {
    return promotions.data
      .map((promotionItem) => ({
        ...promotionItem,
        computedStatus: getPromotionStatusFromDates(promotionItem),
      }))
      .filter((promotionItem) => promotionItem.computedStatus === 'En cours' || promotionItem.computedStatus === 'A venir')
      .sort((first, second) => {
        if (first.computedStatus !== second.computedStatus) {
          return first.computedStatus === 'En cours' ? -1 : 1;
        }

        const firstDate = first.dateDebut ? new Date(first.dateDebut).getTime() : Number.MAX_SAFE_INTEGER;
        const secondDate = second.dateDebut ? new Date(second.dateDebut).getTime() : Number.MAX_SAFE_INTEGER;
        return firstDate - secondDate;
      });
  }, [promotions.data]);

  const handleMenuPress = (itemId: string) => {
    if (itemId === 'ventes') {
      router.push('/ventes' as never);
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

    if (itemId === 'bonsAchats') {
      router.push('/bonsAchats' as never);
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
    (() => {
      const signedAmount = getSignedAmountDisplay(mouvement);

      return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => handleRecentMouvementPress(mouvement)}
      style={[styles.transactionCard, { backgroundColor: cardColor }]}
    >
      <View style={[styles.transactionIcon, { backgroundColor: `${(typeMouvementColorMap[mouvement.libType] || tintColor)}15` }]}> 
        <MaterialIcons name="sync-alt" size={20} color={typeMouvementColorMap[mouvement.libType] || tintColor} />
      </View>
      <View style={styles.transactionContent}>
        <Text style={[styles.transactionLabel, { color: textColor }]}>{mouvement.libType} n° {mouvement.codeOp}</Text>
        <Text style={[styles.transactionDate, { color: mutedColor }]}>{formatDate(mouvement.dateOp)}</Text>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[styles.transactionAmount, { color: signedAmount.color }]}>{signedAmount.label}</Text>
      </View>
    </TouchableOpacity>
      );
    })()
  );

  const groupedRecentSections = useMemo<PeriodSection[]>(() => {
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

    for (const tx of recentMouvements.data) {
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
  }, [recentMouvements.data]);

  const handleRecentMouvementPress = (mouvement: listMouvements['data'][number]) => {
    if (mouvement.libType === 'Vente') {
      router.push(`/ventes/${mouvement.id}` as never);
      return;
    }

    if (mouvement.libType === 'Réglement') {
      router.push(`/reglements/${mouvement.id}` as never);
      return;
    }

    if (mouvement.libType === 'Commission') {
      router.push(`/commissions/${mouvement.id}` as never);
      return;
    }

    if (mouvement.libType === 'Décaissement') {
      router.push('/operations' as never);
      return;
    }

    Alert.alert('Détail indisponible', 'Aucun écran de détail n\'est associé à ce type pour le moment.');
  };

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <AppHeader title="Tableau de bord" subtitle="Vue globale de vos opérations" isOffline={isOfflineMode} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={tintColor} />}>
        <View style={styles.container}>
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
              <TouchableOpacity onPress={() => { loadBalance(); loadPromotionsData(); loadRecentMouvements(); loadStatData(); }} style={[styles.depositButton, { backgroundColor: tintColor }]}> 
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
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.menuGrid}
            style={styles.menuStrip}
            ItemSeparatorComponent={() => <View style={styles.menuSeparator} />}
          />

          {promotionsBanner.length > 0 && (
            <>
              <View style={styles.promotionsHeader}>
                <Text style={[styles.sectionTitle, styles.promoTitleSection, { color: textColor }]}>Promotions</Text>
                <TouchableOpacity onPress={() => router.push('/promotions' as never)}>
                  <Text style={[styles.seeAllText, { color: tintColor }]}>Voir tout</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={promotionsBanner}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.promoBannerList}
                ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                renderItem={({ item: promo }) => (
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => router.push(`/promotions/${promo.id}` as never)}
                    style={[
                      styles.promoCard,
                      styles.promoBannerCard,
                      { backgroundColor: `${COLORS.primaryColor}22`, borderColor: `${COLORS.primaryColor}55` },
                    ]}
                  >
                    <View style={styles.promoTopRow}>
                      <Text style={[styles.promoBadge, { color: statusPromotionColorMap[promo.computedStatus] || tintColor }]}>
                        {promo.computedStatus === 'En cours' ? 'Promotion active' : 'Promotion à venir'}
                      </Text>
                    </View>

                    <View style={styles.promoBodyRow}>
                      <View style={styles.promoTextWrap}>
                        <Text style={[styles.promoTitle, { color: textColor }]} numberOfLines={1}>
                          {promo.libelle || promo.nomProduit || 'Offre spéciale'}
                        </Text>
                        <Text style={[styles.promoDescription, { color: mutedColor }]} numberOfLines={2}>
                          {promo.description || promo.nomProduit || 'Une promotion est disponible. Touchez pour voir les détails.'}
                        </Text>
                      </View>

                      <View style={[styles.promoIconCard, { backgroundColor: `${tintColor}22` }]}>
                        <MaterialIcons
                          name="redeem"
                          size={34}
                          color={statusPromotionColorMap[promo.computedStatus] || tintColor}
                        />
                      </View>
                    </View>

                    <View style={styles.promoFooterRow}>
                      <Text style={[styles.promoDate, { color: mutedColor }]}>Du {promo.dateDebut ? formatDate(promo.dateDebut) : '—'}</Text>
                      <Text style={[styles.promoDate, { color: mutedColor }]}>au {promo.dateFin ? formatDate(promo.dateFin) : '—'}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </>
          )}

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
              groupedRecentSections.map((section) => (
                <View key={section.key} style={styles.transactionSectionBlock}>
                  <Text style={[styles.transactionSectionHeader, { color: textColor }]}>{section.title}</Text>
                  <FlatList
                    data={section.data}
                    keyExtractor={(item) => `${section.key}-${String(item.id)}`}
                    renderItem={renderRecentMouvement}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                  />
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
