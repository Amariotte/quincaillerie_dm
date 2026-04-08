import { AppHeader } from "@/components/app-header";
import { SkeletonCard } from "@/components/skeleton-loader";
import { menuItems } from "@/data/menus";
import { useAuthContext } from "@/hooks/auth-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  fetchSoldeCompte,
  getfetchRecentMouvements,
  getfetchStatistiques,
  getStats,
} from "@/services/api-service";
import {
  BALANCE_CACHE_KEY,
  getCacheData,
  RECENTS_MOUVEMENTS_CACHE_KEY,
  setCacheData,
  STAT_DATA_CACHE_KEY,
  STATISTIQUES_LIST_CACHE_KEY
} from "@/services/cache-service";
import COLORS from "@/styles/colors";
import { sharedStyles } from "@/styles/shared.js";
import { formatAmount, formatDate } from "@/tools/tools";
import { listMouvements, typeMouvementColorMap } from "@/types/mouvements.type";
import { dataChart, stat } from "@/types/other.type";
import { SoldeResponse } from "@/types/solde.type";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./styles.js";

type PeriodSection = {
  key: string;
  title: string;
  data: listMouvements["data"];
};

type MonthlyChartItem = {
  key: string;
  label: string;
  ventes: number;
  reglements: number;
  decaissements: number;
  entrees: number;
  commissions: number;
  sorties: number;
};

const monthlyChartSeries = [
  { key: "ventes", label: "Ventes", color: typeMouvementColorMap.Vente },
  {
    key: "reglements",
    label: "Règlements",
    color: typeMouvementColorMap["Réglement"],
  },
  {
    key: "decaissements",
    label: "Décaissements",
    color: typeMouvementColorMap["Décaissement"],
  },
  { key: "entrees", label: "Entrées", color: COLORS.primaryColor },
  {
    key: "commissions",
    label: "Commissions",
    color: "#d97706",
  },
  { key: "sorties", label: "Sorties", color: COLORS.errorColor },
] as const;

type MonthlyChartSeriesKey = (typeof monthlyChartSeries)[number]["key"];
const CHART_BAR_MAX_HEIGHT = 240;

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

function getChartMonthDate(value: string): Date | null {
  const normalized = value.trim();
  const compactMonth = normalized.match(/^(\d{4})(\d{2})$/);

  if (compactMonth) {
    const year = Number(compactMonth[1]);
    const month = Number(compactMonth[2]);
    if (month >= 1 && month <= 12) {
      const parsed = new Date(year, month - 1, 1);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }

  const direct = new Date(normalized);
  if (!Number.isNaN(direct.getTime())) {
    return new Date(direct.getFullYear(), direct.getMonth(), 1);
  }

  return null;
}

function getChartMonthLabel(value: string): string {
  const monthDate = getChartMonthDate(value);
  if (!monthDate) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    year: "2-digit",
  }).format(monthDate);
}

function mapStatistiquesToMonthlyChartData(
  statistiques: dataChart[],
): MonthlyChartItem[] {
  return [...statistiques]
    .sort((first, second) => {
      const firstDate = getChartMonthDate(first.mois);
      const secondDate = getChartMonthDate(second.mois);

      if (firstDate && secondDate) {
        return firstDate.getTime() - secondDate.getTime();
      }

      return first.mois.localeCompare(second.mois);
    })
    .map((item, index) => ({
      key: `${item.mois}-${index}`,
      label: getChartMonthLabel(item.mois),
      ventes: Number(item.vente) || 0,
      reglements: Number(item.reglement) || 0,
      decaissements: Number(item.decaissement) || 0,
      entrees: Number(item.entree) || 0,
      commissions: Number(item.commission) || 0,
      sorties: Number(item.sortie) || 0,
    }));
}

function getSignedAmountDisplay(mouvement: listMouvements["data"][number]) {
  const absoluteAmount = Math.abs(Number(mouvement.montant) || 0);

  if (mouvement.libType === "Réglement" || mouvement.libType === "Commission") {
    return {
      label: `+ ${formatAmount(absoluteAmount)}`,
      color: typeMouvementColorMap["Réglement"],
    };
  }

  if (mouvement.libType === "Vente" || mouvement.libType === "Décaissement") {
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

export default function HomeScreen() {
  const router = useRouter();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor } =
    useAppTheme();
  const { userToken, refreshProfilePhoto } = useAuthContext();
  const refreshedProfilePhotoTokenRef = useRef<string | null>(null);

  const [accountBalance, setAccountBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [recentMouvements, setRecentMouvements] = useState<listMouvements>({
    meta: { page: 1, next: 2, totalPages: 1, total: 0, size: 0 },
    data: [],
  });
  const [isLoadingRecentMouvements, setIsLoadingRecentMouvements] =
    useState(true);
  const [statInfos, setStatInfos] = useState<stat | null>(null);
  const [chartStatistiques, setChartStatistiques] = useState<dataChart[]>([]);
  const [isLoadingMonthlyChart, setIsLoadingMonthlyChart] = useState(true);
  const [selectedChartSeries, setSelectedChartSeries] = useState<
    MonthlyChartSeriesKey[]
  >(monthlyChartSeries.map((series) => series.key));
  const [activeChartMonthKey, setActiveChartMonthKey] = useState<string | null>(
    null,
  );

  const loadBalance = useCallback(async () => {
    try {
      setIsLoadingBalance(true);
      const parsedCache = await getCacheData<SoldeResponse>(BALANCE_CACHE_KEY);

      if (parsedCache) {
        const cachedBalance = Number(parsedCache.solde);

        if (!Number.isNaN(cachedBalance)) {
          setAccountBalance(cachedBalance);
        }
      }

      if (!userToken) {
        throw new Error("Token utilisateur manquant");
      }

      const solde = await fetchSoldeCompte(userToken);

      setAccountBalance(Number(solde));
      setIsOfflineMode(false);

      await setCacheData(BALANCE_CACHE_KEY, { solde: solde });
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
      const statInfos = await getStats(userToken ?? "");
      setStatInfos(statInfos);
      await setCacheData(STAT_DATA_CACHE_KEY, statInfos);
    } catch {
      setIsOfflineMode(true);
    }
  }, [userToken]);

  const loadRecentMouvements = useCallback(async () => {
    setIsLoadingRecentMouvements(true);
    try {
      const cached = await getCacheData<listMouvements>(
        RECENTS_MOUVEMENTS_CACHE_KEY,
      );
      if (cached && cached.data.length > 0) {
        setRecentMouvements(cached);
      }
      if (!userToken) {
        return;
      }
      const data = await getfetchRecentMouvements(userToken ?? "");
      setRecentMouvements(data);
      await setCacheData(RECENTS_MOUVEMENTS_CACHE_KEY, data);
    } catch {
      setIsOfflineMode(true);
    } finally {
      setIsLoadingRecentMouvements(false);
    }
  }, [userToken]);

  const loadMonthlyChartData = useCallback(async () => {
    setIsLoadingMonthlyChart(true);
    try {
      const cached = await getCacheData<dataChart[]>(
        STATISTIQUES_LIST_CACHE_KEY,
      );
      if (cached?.length) {
        setChartStatistiques(cached);
      }

      if (!userToken) {
        return;
      }

      const data = await getfetchStatistiques(userToken);
      setChartStatistiques(data);
      await setCacheData(STATISTIQUES_LIST_CACHE_KEY, data);
      setIsOfflineMode(false);
    } catch {
      setIsOfflineMode(true);
    } finally {
      setIsLoadingMonthlyChart(false);
    }
  }, [userToken]);

  useEffect(() => {
    loadBalance();
    loadRecentMouvements();
    loadStatData();
    loadMonthlyChartData();
  }, [loadBalance, loadMonthlyChartData, loadRecentMouvements, loadStatData]);

  useEffect(() => {
    if (!userToken) {
      refreshedProfilePhotoTokenRef.current = null;
      return;
    }

    if (refreshedProfilePhotoTokenRef.current === userToken) {
      return;
    }

    refreshedProfilePhotoTokenRef.current = userToken;
    refreshProfilePhoto();
  }, [refreshProfilePhoto, userToken]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadBalance(),
        loadRecentMouvements(),
        loadStatData(),
        loadMonthlyChartData(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadBalance, loadMonthlyChartData, loadRecentMouvements, loadStatData]);

  const monthlyChartData = useMemo(
    () => mapStatistiquesToMonthlyChartData(chartStatistiques),
    [chartStatistiques],
  );

  const visibleChartSeries = useMemo(
    () =>
      monthlyChartSeries.filter((series) =>
        selectedChartSeries.includes(series.key),
      ),
    [selectedChartSeries],
  );

  const monthlyChartMax = useMemo(() => {
    const maxValue = monthlyChartData.reduce((currentMax, item) => {
      const itemMax = visibleChartSeries.reduce((seriesMax, series) => {
        return Math.max(seriesMax, item[series.key]);
      }, 0);

      return Math.max(currentMax, itemMax);
    }, 0);

    return maxValue > 0 ? maxValue : 1;
  }, [monthlyChartData, visibleChartSeries]);

  const hasChartData = useMemo(
    () =>
      monthlyChartData.some((item) =>
        visibleChartSeries.some((series) => item[series.key] > 0),
      ),
    [monthlyChartData, visibleChartSeries],
  );

  const activeChartMonth = useMemo(
    () =>
      monthlyChartData.find((item) => item.key === activeChartMonthKey) ?? null,
    [activeChartMonthKey, monthlyChartData],
  );

  const isAllChartSeriesSelected =
    selectedChartSeries.length === monthlyChartSeries.length;

  const toggleChartSeries = (seriesKey: MonthlyChartSeriesKey) => {
    setSelectedChartSeries((currentSelection) => {
      if (currentSelection.includes(seriesKey)) {
        if (currentSelection.length === 1) {
          return currentSelection;
        }

        return currentSelection.filter((key) => key !== seriesKey);
      }

      return [...currentSelection, seriesKey];
    });
  };

  const selectAllChartSeries = () => {
    setSelectedChartSeries(monthlyChartSeries.map((series) => series.key));
  };

  const handleChartMonthPress = (monthKey: string) => {
    setActiveChartMonthKey((currentKey) =>
      currentKey === monthKey ? null : monthKey,
    );
  };

  const handleMenuPress = (itemId: string) => {
    if (itemId === "ventes") {
      router.push("/ventes" as never);
      return;
    }

    if (itemId === "proformas") {
      router.push("/proformas" as never);
      return;
    }

    if (itemId === "bons") {
      router.push("/bons" as never);
      return;
    }

    if (itemId === "reglements") {
      router.push("/reglements" as never);
      return;
    }

    if (itemId === "produits") {
      router.push("/produits" as never);
      return;
    }

    if (itemId === "bonsAchats") {
      router.push("/bonsAchats" as never);
      return;
    }

    if (itemId === "transactions") {
      router.push("/transactions" as never);
      return;
    }

    if (itemId === "promotions") {
      router.push("/promotions" as never);
      return;
    }

    if (itemId === "operations") {
      router.push("/operations" as never);
      return;
    }

    if (itemId === "commissions") {
      router.push("/commissions" as never);
      return;
    }

    if (itemId === "cartes") {
      router.push("/cartes" as never);
      return;
    }

    if (itemId === "devis") {
      router.push("/devis/nouveau");
      return;
    }

    if (itemId === "sous-comptes") {
      router.push("/sous-comptes" as never);
      return;
    }

    Alert.alert(
      "Bientot disponible",
      "Ce module n'est pas encore relie dans cette version.",
    );
  };

  const renderMenuItem = ({ item }: { item: (typeof menuItems)[number] }) => (
    <TouchableOpacity
      onPress={() => handleMenuPress(item.id)}
      style={[
        styles.menuCard,
        { backgroundColor: cardColor },
        item.featured && {
          backgroundColor: item.tint,
          justifyContent: "center",
        },
      ]}
    >
      <View
        style={[
          styles.menuIcon,
          {
            backgroundColor: item.featured
              ? "rgba(255,255,255,0.18)"
              : `${item.tint}18`,
          },
        ]}
      >
        <MaterialIcons
          name={item.icon as any}
          size={26}
          color={item.featured ? "#ffffff" : item.tint}
        />
      </View>
      <Text
        style={[
          styles.menuLabel,
          { color: item.featured ? "#ffffff" : textColor },
        ]}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderRecentMouvement = ({
    item: mouvement,
  }: {
    item: listMouvements["data"][number];
  }) =>
    (() => {
      const signedAmount = getSignedAmountDisplay(mouvement);

      return (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleRecentMouvementPress(mouvement)}
          style={[styles.transactionCard, { backgroundColor: cardColor }]}
        >
          <View
            style={[
              styles.transactionIcon,
              {
                backgroundColor: `${typeMouvementColorMap[mouvement.libType] || tintColor}15`,
              },
            ]}
          >
            <MaterialIcons
              name="sync-alt"
              size={20}
              color={typeMouvementColorMap[mouvement.libType] || tintColor}
            />
          </View>
          <View style={styles.transactionContent}>
            <Text style={[styles.transactionLabel, { color: textColor }]}>
              {mouvement.libType} n° {mouvement.codeOp}
            </Text>
            <Text style={[styles.transactionDate, { color: mutedColor }]}>
              {formatDate(mouvement.dateOp)}
            </Text>
          </View>
          <View style={styles.transactionRight}>
            <Text
              style={[styles.transactionAmount, { color: signedAmount.color }]}
            >
              {signedAmount.label}
            </Text>
          </View>
        </TouchableOpacity>
      );
    })();

  const groupedRecentSections = useMemo<PeriodSection[]>(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const beforeYesterday = new Date(today);
    beforeYesterday.setDate(today.getDate() - 2);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const buckets: Record<string, listMouvements["data"]> = {
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
      { key: "today", title: "Aujourd'hui", data: buckets.today },
      { key: "yesterday", title: "Hier", data: buckets.yesterday },
      {
        key: "beforeYesterday",
        title: "Avant-hier",
        data: buckets.beforeYesterday,
      },
      { key: "thisMonth", title: "Ce mois", data: buckets.thisMonth },
      { key: "older", title: "Plus anciens", data: buckets.older },
    ].filter((section) => section.data.length > 0);
  }, [recentMouvements.data]);

  const handleRecentMouvementPress = (
    mouvement: listMouvements["data"][number],
  ) => {
    if (mouvement.libType === "Vente") {
      router.push(`/ventes/${mouvement.id}` as never);
      return;
    }

    if (mouvement.libType === "Réglement") {
      router.push(`/reglements/${mouvement.id}` as never);
      return;
    }

    if (mouvement.libType === "Commission") {
      router.push(`/commissions/${mouvement.id}` as never);
      return;
    }

    if (mouvement.libType === "Décaissement") {
      router.push("/operations" as never);
      return;
    }

    Alert.alert(
      "Détail indisponible",
      "Aucun écran de détail n'est associé à ce type pour le moment.",
    );
  };

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <AppHeader
          title="Tableau de bord"
          subtitle="Vue globale de vos opérations"
          isOffline={isOfflineMode}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
          />
        }
      >
        <View style={styles.container}>
          <View style={[styles.balanceCard, { backgroundColor: cardColor }]}>
            <View style={styles.balanceRow}>
              <View>
                <Text style={[styles.balanceAmount, { color: tintColor }]}>
                  {isLoadingBalance
                    ? "Chargement..."
                    : accountBalance !== null
                      ? formatAmount(accountBalance)
                      : "Solde indisponible"}
                </Text>
                <Text style={[styles.balanceCaption, { color: "#f59e0b" }]}>
                  Mon solde courant
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  loadBalance();
                  loadRecentMouvements();
                  loadStatData();
                  loadMonthlyChartData();
                }}
                style={[styles.depositButton, { backgroundColor: tintColor }]}
              >
                <MaterialIcons name="refresh" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricBlock}>
                <Text style={[styles.metricLabel, { color: mutedColor }]}>
                  Factures non soldées
                </Text>
                <Text style={[styles.metricValue, { color: textColor }]}>
                  {statInfos?.venteNonSoldee.nbre ?? 0}
                </Text>
              </View>
              <View style={styles.metricBlock}>
                <Text style={[styles.metricLabel, { color: mutedColor }]}>
                  Factures échues
                </Text>
                <Text style={[styles.metricValue, { color: textColor }]}>
                  {statInfos?.venteEchue.nbre ?? 0}
                </Text>
              </View>
              
               {(statInfos?.promotionActive ?? 0) > 0 && (
              <View style={styles.metricBlock}>
                <Text style={[styles.metricLabel, { color: mutedColor }]}>
                  Promotions actives
                </Text>
                <Text style={[styles.metricValue, { color: textColor }]}>
                  {statInfos?.promotionActive ?? 0}
                </Text>
              </View>
              )}
                
                {(statInfos?.sousCompte ?? 0) > 0 && (
                <View style={styles.metricBlock}>
                <Text style={[styles.metricLabel, { color: mutedColor }]}>
                  Sous-comptes
                </Text>
                <Text style={[styles.metricValue, { color: textColor }]}>
                  {statInfos?.sousCompte ?? 0}
                </Text>
              </View>
              )}
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

          <View style={styles.transactionsHeader}>
            <Text
              style={[
                styles.sectionTitle,
                styles.transactionTitle,
                { color: textColor },
              ]}
            >
              Activité sur 12 mois
            </Text>
          </View>

          <View style={[styles.chartCard, { backgroundColor: cardColor }]}>
            <View style={styles.chartFilterRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={selectAllChartSeries}
                style={[
                  styles.chartFilterChip,
                  styles.chartFilterAllChip,
                  {
                    backgroundColor: isAllChartSeriesSelected
                      ? tintColor
                      : `${tintColor}12`,
                    borderColor: `${tintColor}35`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chartFilterText,
                    {
                      color: isAllChartSeriesSelected ? "#ffffff" : tintColor,
                    },
                  ]}
                >
                  Tous
                </Text>
              </TouchableOpacity>

              {monthlyChartSeries.map((series) => (
                <TouchableOpacity
                  key={series.key}
                  activeOpacity={0.85}
                  onPress={() => toggleChartSeries(series.key)}
                  style={[
                    styles.chartFilterChip,
                    {
                      backgroundColor: selectedChartSeries.includes(series.key)
                        ? `${series.color}18`
                        : "transparent",
                      borderColor: selectedChartSeries.includes(series.key)
                        ? series.color
                        : `${mutedColor}30`,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.chartLegendDot,
                      { backgroundColor: series.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.chartFilterText,
                      {
                        color: selectedChartSeries.includes(series.key)
                          ? textColor
                          : mutedColor,
                      },
                    ]}
                  >
                    {series.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {isLoadingMonthlyChart && chartStatistiques.length === 0 ? (
              <SkeletonCard lines={4} />
            ) : !hasChartData ? (
              <View style={styles.chartEmptyState}>
                <Text style={[styles.chartEmptyText, { color: mutedColor }]}>
                  Aucune donnée exploitable pour la sélection actuelle.
                </Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chartScrollContent}
              >
                <View style={styles.chartInner}>
                  {monthlyChartData.map((item) => (
                    <Pressable
                      key={item.key}
                      onPress={() => handleChartMonthPress(item.key)}
                      onHoverIn={() => setActiveChartMonthKey(item.key)}
                      onHoverOut={() =>
                        setActiveChartMonthKey((currentKey) =>
                          currentKey === item.key ? null : currentKey,
                        )
                      }
                      style={styles.chartMonthBlock}
                    >
                      {activeChartMonth?.key === item.key ? (
                        <View
                          style={[
                            styles.chartTooltip,
                            { backgroundColor: textColor },
                          ]}
                        >
                          <Text style={styles.chartTooltipTitle}>
                            {item.label}
                          </Text>
                          {visibleChartSeries.map((series) => (
                            <View
                              key={series.key}
                              style={styles.chartTooltipRow}
                            >
                              <View
                                style={[
                                  styles.chartTooltipDot,
                                  { backgroundColor: series.color },
                                ]}
                              />
                              <Text style={styles.chartTooltipLabel}>
                                {series.label}
                              </Text>
                              <Text style={styles.chartTooltipValue}>
                                {formatAmount(item[series.key])}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                      <View style={styles.chartBarsWrap}>
                        {visibleChartSeries.map((series) => {
                          const value = item[series.key];
                          const height = Math.max(
                            6,
                            (value / monthlyChartMax) * CHART_BAR_MAX_HEIGHT,
                          );

                          return (
                            <View key={series.key} style={styles.chartBarTrack}>
                              <View
                                style={[
                                  styles.chartBar,
                                  {
                                    height,
                                    backgroundColor: series.color,
                                  },
                                ]}
                              />
                            </View>
                          );
                        })}
                      </View>
                      <Text
                        style={[styles.chartMonthLabel, { color: textColor }]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>

          <View style={styles.transactionsHeader}>
            <Text
              style={[
                styles.sectionTitle,
                styles.transactionTitle,
                { color: textColor },
              ]}
            >
              20 Dernières transactions
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/transactions" as never)}
            >
              <Text style={[styles.seeAllText, { color: tintColor }]}>
                Voir tout
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionList}>
            {isLoadingRecentMouvements && recentMouvements.data.length === 0 ? (
              <>
                <SkeletonCard lines={2} />
                <SkeletonCard lines={2} />
                <SkeletonCard lines={2} />
              </>
            ) : recentMouvements.data.length === 0 ? (
              <View
                style={[
                  styles.transactionCard,
                  { backgroundColor: cardColor, justifyContent: "center" },
                ]}
              >
                <Text
                  style={[
                    styles.transactionLabel,
                    { color: mutedColor, textAlign: "center" },
                  ]}
                >
                  Aucune transaction recente
                </Text>
              </View>
            ) : (
              groupedRecentSections.map((section) => (
                <View key={section.key} style={styles.transactionSectionBlock}>
                  <Text
                    style={[
                      styles.transactionSectionHeader,
                      { color: textColor },
                    ]}
                  >
                    {section.title}
                  </Text>
                  <FlatList
                    data={section.data}
                    keyExtractor={(item) => `${section.key}-${String(item.id)}`}
                    renderItem={renderRecentMouvement}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => (
                      <View style={{ height: 10 }} />
                    )}
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
