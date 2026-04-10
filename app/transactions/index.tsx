import { AppHeader } from "@/components/app-header";
import { DateRangePicker } from "@/components/date-range-picker";
import { useAuthContext } from "@/hooks/auth-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useCachedResource } from "@/hooks/use-cached-resource";
import { getfetchMouvements } from "@/services/api-service";
import { TRANSACTIONS_LIST_CACHE_KEY } from "@/services/cache-service";
import COLORS from "@/styles/colors";
import { sharedStyles } from "@/styles/shared";
import { formatAmount, formatDate } from "@/tools/tools";
import {
  listMouvements,
  typeMouvementColorMap,
  typeMouvementIconMap,
} from "@/types/mouvements.type";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./style";

const orderedMouvementTypes: listMouvements["data"][number]["libType"][] = [
  "Vente",
  "Réglement",
  "Commission",
  "Décaissement",
];

function getSignedAmountDisplay(tx: listMouvements["data"][number]) {
  const absoluteAmount = Math.abs(Number(tx.montant) || 0);

  if (tx.libType === "Réglement" || tx.libType === "Commission") {
    return {
      label: `+ ${formatAmount(absoluteAmount)}`,
      color: typeMouvementColorMap["Réglement"],
    };
  }

  if (tx.libType === "Vente" || tx.libType === "Décaissement") {
    return {
      label: `- ${formatAmount(absoluteAmount)}`,
      color: COLORS.errorColor,
    };
  }

  return {
    label: formatAmount(absoluteAmount),
    color: typeMouvementColorMap[tx.libType] || COLORS.errorColor,
  };
}

export default function TransactionsScreen() {
  const router = useRouter();
  const {
    backgroundColor,
    textColor,
    tintColor,
    cardColor,
    mutedColor,
    borderColor,
  } = useAppTheme();

  const [query, setQuery] = useState("");
  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);
  const [activeType, setActiveType] = useState<
    "Tous" | listMouvements["data"][number]["libType"]
  >("Tous");

  const [startDateQuery, setStartDateQuery] = useState("");
  const [endDateQuery, setEndDateQuery] = useState("");
  const initialMouvements = useMemo<listMouvements>(
    () => ({
      meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 },
      data: [],
    }),
    [],
  );

  const { userToken } = useAuthContext();
  const {
    data: mouvements,
    isLoading,
    isRefreshing,
    isError,
    refresh: handleRefresh,
  } = useCachedResource<listMouvements>({
    cacheKey: TRANSACTIONS_LIST_CACHE_KEY,
    initialData: initialMouvements,
    enabled: Boolean(userToken),
    fetcher: async () => getfetchMouvements(userToken ?? ""),
    hasUsableCachedData: (cachedData) =>
      Boolean(
        cachedData &&
        Array.isArray(cachedData.data) &&
        cachedData.data.length > 0,
      ),
  });

  const typeFilters: ("Tous" | listMouvements["data"][number]["libType"])[] =
    useMemo(
      () => [
        "Tous",
        ...Array.from(
          new Set(
            mouvements.data
              .map((mouvement) => mouvement.libType)
              .filter(
                (type): type is listMouvements["data"][number]["libType"] =>
                  typeof type === "string" && type.trim().length > 0,
              ),
          ),
        ),
      ],
      [mouvements.data],
    );

  const filtered = useMemo(() => {
    return mouvements.data.filter((t) => {
      const matchesType = activeType === "Tous" || t.libType === activeType;
      const matchesQuery =
        !normalizedQuery ||
        t.libType.toLowerCase().includes(normalizedQuery) ||
        t.nomAgence.toLowerCase().includes(normalizedQuery) ||
        t.nomSousCompte.toLowerCase().includes(normalizedQuery) ||
        t.codeOp.toLowerCase().includes(normalizedQuery);

      return matchesType && matchesQuery;
    });
  }, [activeType, mouvements.data, normalizedQuery]);

  const totalsByType = useMemo(() => {
    const initialTotals: Record<
      listMouvements["data"][number]["libType"],
      number
    > = {
      Vente: 0,
      Réglement: 0,
      Commission: 0,
      Décaissement: 0,
    };

    return filtered.reduce((accumulator, mouvement) => {
      accumulator[mouvement.libType] += Number(mouvement.montant) || 0;
      return accumulator;
    }, initialTotals);
  }, [filtered]);

  const getTypeTotalDisplay = (
    type: listMouvements["data"][number]["libType"],
  ) => {
    const absoluteAmount = Math.abs(totalsByType[type]);
    const isIncoming = type === "Réglement" || type === "Commission";

    return {
      label: `${isIncoming ? "+" : "-"} ${formatAmount(absoluteAmount)}`,
      color: isIncoming
        ? typeMouvementColorMap["Réglement"]
        : COLORS.errorColor,
    };
  };

  const totalGeneral = useMemo(() => {
    return filtered.reduce((accumulator, mouvement) => {
      const amount = Math.abs(Number(mouvement.montant) || 0);
      const isIncoming =
        mouvement.libType === "Réglement" || mouvement.libType === "Commission";
      return accumulator + (isIncoming ? amount : -amount);
    }, 0);
  }, [filtered]);

  const totalGeneralDisplay = {
    label: `${totalGeneral >= 0 ? "+" : "-"} ${formatAmount(Math.abs(totalGeneral))}`,
    color:
      totalGeneral >= 0
        ? typeMouvementColorMap["Réglement"]
        : COLORS.errorColor,
  };
  const showInitialLoader = isLoading && mouvements.data.length === 0;
  const showErrorState = isError && mouvements.data.length === 0;

  const handleTransactionPress = (tx: listMouvements["data"][number]) => {
    if (tx.libType === "Vente") {
      router.push(`/ventes/${tx.id}` as never);
      return;
    }

    if (tx.libType === "Réglement") {
      router.push(`/reglements/${tx.id}` as never);
      return;
    }

    if (tx.libType === "Commission") {
      router.push(`/commissions/${tx.id}` as never);
      return;
    }

    if (tx.libType === "Décaissement") {
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
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Transactions" subtitle="" />
      </View>
      <FlatList
        data={showInitialLoader || showErrorState ? [] : filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item: tx }) => {
          const signedAmount = getSignedAmountDisplay(tx);
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleTransactionPress(tx)}
              style={[styles.txCard, { backgroundColor: cardColor }]}
            >
              <View
                style={[
                  styles.txIcon,
                  {
                    backgroundColor: `${typeMouvementColorMap[tx.libType] || tintColor}15`,
                  },
                ]}
              >
                <MaterialIcons
                  name={(typeMouvementIconMap[tx.libType] || "sync-alt") as any}
                  size={20}
                  color={typeMouvementColorMap[tx.libType] || tintColor}
                />
              </View>
              <View style={styles.txContent}>
                <Text
                  style={[styles.txLabel, { color: textColor }]}
                  numberOfLines={1}
                >
                  {tx.libType} n° {tx.codeOp}
                </Text>
                <Text style={[styles.txDate, { color: mutedColor }]}>
                  {formatDate(tx.dateOp)}
                </Text>
              </View>
              <View style={styles.txBottomRow}>
                <Text style={[styles.txAmount, { color: signedAmount.color }]}>
                  {signedAmount.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={[
          sharedStyles.scrollContent,
          { paddingHorizontal: 18, paddingTop: 12 },
        ]}
        ListHeaderComponent={
          <View style={{ gap: 16 }}>
            <View style={sharedStyles.statsRow}>
              {orderedMouvementTypes.slice(0, 2).map((type) => {
                const totalDisplay = getTypeTotalDisplay(type);

                return (
                  <View
                    key={type}
                    style={[
                      sharedStyles.statCard,
                      { backgroundColor: cardColor },
                    ]}
                  >
                    <Text
                      style={[sharedStyles.statLabel, { color: mutedColor }]}
                    >
                      {type}
                    </Text>
                    <Text
                      style={[
                        sharedStyles.statCount,
                        { color: totalDisplay.color },
                      ]}
                    >
                      {totalDisplay.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={sharedStyles.statsRow}>
              {orderedMouvementTypes.slice(2, 4).map((type) => {
                const totalDisplay = getTypeTotalDisplay(type);

                return (
                  <View
                    key={type}
                    style={[
                      sharedStyles.statCard,
                      { backgroundColor: cardColor },
                    ]}
                  >
                    <Text
                      style={[sharedStyles.statLabel, { color: mutedColor }]}
                    >
                      {type}
                    </Text>
                    <Text
                      style={[
                        sharedStyles.statCount,
                        { color: totalDisplay.color },
                      ]}
                    >
                      {totalDisplay.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View
              style={[sharedStyles.statCard, { backgroundColor: cardColor }]}
            >
              <Text style={[sharedStyles.statLabel, { color: mutedColor }]}>
                Total général
              </Text>
              <Text
                style={[
                  sharedStyles.statValue,
                  { color: totalGeneralDisplay.color },
                ]}
              >
                {totalGeneralDisplay.label}
              </Text>
            </View>

            <View
              style={[
                sharedStyles.searchBox,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <MaterialIcons name="search" size={20} color={mutedColor} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Rechercher une transaction"
                placeholderTextColor={mutedColor}
                style={[sharedStyles.searchInput, { color: textColor }]}
              />
            </View>

            <DateRangePicker
              startDateValue={startDateQuery}
              endDateValue={endDateQuery}
              onChangeStartDate={setStartDateQuery}
              onChangeEndDate={setEndDateQuery}
              cardColor={cardColor}
              borderColor={borderColor}
              textColor={textColor}
              mutedColor={mutedColor}
              tintColor={tintColor}
            />

            {typeFilters.length > 2 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={sharedStyles.filterRow}
              >
                {typeFilters.map((type) => {
                  const isActive = type === activeType;

                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setActiveType(type)}
                      style={[
                        sharedStyles.filterChip,
                        {
                          backgroundColor: isActive ? tintColor : cardColor,
                          borderColor: isActive ? tintColor : borderColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          sharedStyles.filterLabel,
                          { color: isActive ? "#ffffff" : textColor },
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : null}

            {showInitialLoader ? (
              <View style={styles.loaderBlock}>
                <ActivityIndicator size="large" color={tintColor} />
              </View>
            ) : null}

            {showErrorState ? (
              <View
                style={[sharedStyles.emptyCard, { backgroundColor: cardColor }]}
              >
                <MaterialIcons name="cloud-off" size={40} color={mutedColor} />
                <Text style={[sharedStyles.emptyTitle, { color: textColor }]}>
                  Erreur de chargement
                </Text>
                <Text style={[sharedStyles.emptyText, { color: mutedColor }]}>
                  Impossible de récupérer les transactions.
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListHeaderComponentStyle={{ marginBottom: 16 }}
        ListEmptyComponent={
          !showInitialLoader && !showErrorState ? (
            <View
              style={[sharedStyles.emptyCard, { backgroundColor: cardColor }]}
            >
              <MaterialIcons name="inbox" size={40} color={mutedColor} />
              <Text style={[sharedStyles.emptyTitle, { color: textColor }]}>
                Aucune transaction
              </Text>
              <Text style={[sharedStyles.emptyText, { color: mutedColor }]}>
                Aucun résultat pour cette recherche.
              </Text>
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
