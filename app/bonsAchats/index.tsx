import { AppHeader } from "@/components/app-header";
import { EmptyResultsCard } from "@/components/empty-results-card";
import { useAuthContext } from "@/hooks/auth-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useCachedResource } from "@/hooks/use-cached-resource";
import { getfetchBonAchats } from "@/services/api-service";
import { BONS_ACHATS_LIST_CACHE_KEY } from "@/services/cache-service";
import { sharedStyles } from "@/styles/shared";
import { formatAmount, formatDate } from "@/tools/tools";
import { bonAchat, listBonAchats } from "@/types/bon-achats.type";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type BonStatusFilter = "all" | "active" | "expired";

function normalizeBonAchatData(bon: bonAchat): bonAchat {
  return {
    ...bon,
    id: String(bon?.id ?? ""),
    numeroBa: typeof bon?.numeroBa === "string" ? bon.numeroBa : "",
    etatBa: Number(bon?.etatBa ?? 0),
    montantBa: Number(bon?.montantBa ?? 0),
    uniqueUse: Boolean(bon?.uniqueUse),
    autreClientUse: Boolean(bon?.autreClientUse),
    uniqueAgence: Boolean(bon?.uniqueAgence),
    nomAgence: typeof bon?.nomAgence === "string" ? bon.nomAgence : "",
    details: Array.isArray(bon?.details) ? bon.details : [],
  };
}

function isExpiredBon(bon: bonAchat): boolean {
  if (!bon.dateExpBa) {
    return false;
  }

  return new Date(bon.dateExpBa).getTime() < Date.now();
}

function getBonStatus(bon: bonAchat) {
  if (isExpiredBon(bon)) {
    return { label: "Expiré", color: "#dc2626" };
  }

  if (bon.etatBa === 1) {
    return { label: "Actif", color: "#16a34a" };
  }

  return { label: "Inactif", color: "#d97706" };
}

export default function BonsAchatsScreen() {
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
  const [statusFilter, setStatusFilter] = useState<BonStatusFilter>("all");

  const initialBonAchats = useMemo<listBonAchats>(
    () => ({
      meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 },
      data: [],
    }),
    [],
  );

  const { userToken } = useAuthContext();
  const fetchBonAchats = useCallback(
    () => getfetchBonAchats(userToken ?? ""),
    [userToken],
  );

  const {
    data: bonAchats,
    isLoading,
    isRefreshing,
    isError,
    isOfflineMode,
    refresh: handleRefresh,
  } = useCachedResource<listBonAchats>({
    cacheKey: BONS_ACHATS_LIST_CACHE_KEY,
    initialData: initialBonAchats,
    enabled: Boolean(userToken),
    fetcher: fetchBonAchats,
    hasUsableCachedData: (cachedData) =>
      Boolean(
        cachedData &&
          Array.isArray(cachedData.data) &&
          cachedData.data.length > 0,
      ),
  });

  const bonAchatsData = useMemo(
    () =>
      Array.isArray(bonAchats.data)
        ? bonAchats.data.map(normalizeBonAchatData)
        : [],
    [bonAchats.data],
  );

  const filteredBons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return bonAchatsData.filter((bon) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        bon.numeroBa.toLowerCase().includes(normalizedQuery) ||
        bon.nomAgence.toLowerCase().includes(normalizedQuery);

      const expired = isExpiredBon(bon);
      const isActive = !expired && bon.etatBa === 1;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "expired" && expired);

      return matchesQuery && matchesStatus;
    });
  }, [bonAchatsData, query, statusFilter]);

  const statusCounts = useMemo(() => {
    const initial = { all: bonAchatsData.length, active: 0, expired: 0 };

    for (const bon of bonAchatsData) {
      if (isExpiredBon(bon)) {
        initial.expired += 1;
      } else if (bon.etatBa === 1) {
        initial.active += 1;
      }
    }

    return initial;
  }, [bonAchatsData]);

  const totalCount = filteredBons.length;
  const totalAmount = filteredBons.reduce(
    (sum, bon) => sum + Number(bon.montantBa || 0),
    0,
  );
  const hasBonAchats = bonAchatsData.length > 0;
  const hasActiveFilters = query.trim().length > 0 || statusFilter !== "all";
  const showInitialLoader = isLoading && bonAchatsData.length === 0;
  const showErrorState = isError && bonAchatsData.length === 0;

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader
          showBack
          title="Bons d'achat"
          subtitle="Suivi des bons d'achat"
        />
      </View>
      <FlatList
        data={showInitialLoader || showErrorState ? [] : filteredBons}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item: bon }) => {
          const status = getBonStatus(bon);

          return (
            <View
              style={[sharedStyles.invoiceCard, { backgroundColor: cardColor }]}
            >
              <View style={sharedStyles.invoiceTopRow}>
                <View style={sharedStyles.invoiceRefBlock}>
                  <Text style={[sharedStyles.invoiceRef, { color: textColor }]}> 
                    {bon.numeroBa || "Bon sans numero"}
                  </Text>
                  <Text
                    style={[sharedStyles.invoiceClient, { color: mutedColor }]}
                  >
                    {bon.nomAgence?.trim()
                      ? bon.nomAgence
                      : "Agence non renseignée"}
                  </Text>
                </View>
                <View
                  style={[
                    sharedStyles.statusBadge,
                    { backgroundColor: `${status.color}18` },
                  ]}
                >
                  <Text
                    style={[sharedStyles.statusText, { color: status.color }]}
                  >
                    {status.label}
                  </Text>
                </View>
              </View>

              <View style={sharedStyles.invoiceMetaRow}>
                <View>
                  <Text
                    style={[sharedStyles.metaCaption, { color: mutedColor }]}
                  >
                    Créé le
                  </Text>
                  <Text style={[sharedStyles.metaValue, { color: textColor }]}> 
                    {bon.dateBa ? formatDate(bon.dateBa) : "—"}
                  </Text>
                </View>
                <View>
                  <Text
                    style={[sharedStyles.metaCaption, { color: mutedColor }]}
                  >
                    Validité
                  </Text>
                  <Text style={[sharedStyles.metaValue, { color: textColor }]}> 
                    {bon.dateExpBa ? formatDate(bon.dateExpBa) : "—"}
                  </Text>
                </View>
              </View>

              <View style={sharedStyles.invoiceMetaRow}>
                <View>
                  <Text
                    style={[sharedStyles.metaCaption, { color: mutedColor }]}
                  >
                    Utilisation
                  </Text>
                  <Text style={[sharedStyles.metaValue, { color: textColor }]}> 
                    {bon.uniqueUse ? "Usage unique" : "Multi-usage"}
                  </Text>
                </View>
                <View>
                  <Text
                    style={[sharedStyles.metaCaption, { color: mutedColor }]}
                  >
                    Partage
                  </Text>
                  <Text style={[sharedStyles.metaValue, { color: textColor }]}> 
                    {bon.autreClientUse ? "Partageable" : "Personnel"}
                  </Text>
                </View>
              </View>

              <View style={sharedStyles.invoiceBottomRow}>
                <Text style={[sharedStyles.amountText, { color: textColor }]}> 
                  {formatAmount(bon.montantBa)}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push(`/bonsAchats/${bon.id}` as never)}
                  style={[
                    sharedStyles.actionButton,
                    { backgroundColor: `${tintColor}18` },
                  ]}
                >
                  <Text style={[sharedStyles.actionText, { color: tintColor }]}> 
                    Voir détail
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        contentContainerStyle={[
          sharedStyles.scrollContent,
          { paddingHorizontal: 18, paddingTop: 12 },
        ]}
        ListHeaderComponent={
          <View style={{ gap: 16 }}>
            {isOfflineMode && !isLoading ? (
              <View
                style={[
                  sharedStyles.emptyCard,
                  {
                    backgroundColor: `${tintColor}14`,
                    borderColor: `${tintColor}35`,
                    borderWidth: 1,
                  },
                ]}
              >
                <MaterialIcons name="wifi-off" size={18} color={tintColor} />
                <Text style={[sharedStyles.emptyText, { color: tintColor }]}> 
                  Mode hors ligne: affichage des données disponibles.
                </Text>
              </View>
            ) : null}

            <View style={sharedStyles.statsRow}>
              <View
                style={[sharedStyles.statCard, { backgroundColor: cardColor }]}
              >
                <Text style={[sharedStyles.statLabel, { color: mutedColor }]}> 
                  Tous les bons
                </Text>
                <Text style={[sharedStyles.statCount, { color: textColor }]}> 
                  {totalCount} bon{totalCount > 1 ? "s" : ""}
                </Text>
              </View>
              <View
                style={[sharedStyles.statCard, { backgroundColor: cardColor }]}
              >
                <Text style={[sharedStyles.statLabel, { color: mutedColor }]}> 
                  Montant total
                </Text>
                <Text style={[sharedStyles.statCount, { color: textColor }]}> 
                  {formatAmount(totalAmount)}
                </Text>
              </View>
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
                placeholder="Rechercher un bon ou une agence"
                placeholderTextColor={mutedColor}
                style={[sharedStyles.searchInput, { color: textColor }]}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={sharedStyles.filterRow}
            >
              <TouchableOpacity
                onPress={() => setStatusFilter("all")}
                style={[
                  sharedStyles.filterChip,
                  {
                    backgroundColor:
                      statusFilter === "all" ? tintColor : cardColor,
                    borderColor:
                      statusFilter === "all" ? tintColor : borderColor,
                  },
                ]}
              >
                <Text
                  style={[
                    sharedStyles.filterLabel,
                    { color: statusFilter === "all" ? "#ffffff" : textColor },
                  ]}
                >
                  Tous ({statusCounts.all})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setStatusFilter("active")}
                style={[
                  sharedStyles.filterChip,
                  {
                    backgroundColor:
                      statusFilter === "active" ? tintColor : cardColor,
                    borderColor:
                      statusFilter === "active" ? tintColor : borderColor,
                  },
                ]}
              >
                <Text
                  style={[
                    sharedStyles.filterLabel,
                    {
                      color: statusFilter === "active" ? "#ffffff" : textColor,
                    },
                  ]}
                >
                  Actifs ({statusCounts.active})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setStatusFilter("expired")}
                style={[
                  sharedStyles.filterChip,
                  {
                    backgroundColor:
                      statusFilter === "expired" ? tintColor : cardColor,
                    borderColor:
                      statusFilter === "expired" ? tintColor : borderColor,
                  },
                ]}
              >
                <Text
                  style={[
                    sharedStyles.filterLabel,
                    {
                      color:
                        statusFilter === "expired" ? "#ffffff" : textColor,
                    },
                  ]}
                >
                  Expirés ({statusCounts.expired})
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {showInitialLoader ? (
              <ActivityIndicator
                size="large"
                color={tintColor}
                style={{ marginTop: 32 }}
              />
            ) : null}

            {showErrorState ? (
              <EmptyResultsCard
                iconName="cloud-off"
                title="Erreur de chargement"
                subtitle="Impossible de récupérer les bons d'achat. Vérifiez votre connexion."
                cardColor={cardColor}
                titleColor={textColor}
                subtitleColor={mutedColor}
              />
            ) : null}
          </View>
        }
        ListHeaderComponentStyle={{ marginBottom: 16 }}
        ListEmptyComponent={
          !showInitialLoader && !showErrorState ? (
            <EmptyResultsCard
              iconName="inventory-2"
              title={hasBonAchats ? "Aucun bon trouvé" : "Aucun bon d'achat"}
              subtitle={
                hasBonAchats || hasActiveFilters
                  ? "Essayez une autre recherche ou filtre."
                  : "Aucun bon d'achat n'est disponible pour le moment."
              }
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
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
