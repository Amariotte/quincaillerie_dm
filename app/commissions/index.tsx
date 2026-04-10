import { AppHeader } from "@/components/app-header";
import { DateRangePicker } from "@/components/date-range-picker";
import { EmptyResultsCard } from "@/components/empty-results-card";
import { useAuthContext } from "@/hooks/auth-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useCachedResource } from "@/hooks/use-cached-resource";
import { getfetchCommissions } from "@/services/api-service";
import { COMMISSIONS_LIST_CACHE_KEY } from "@/services/cache-service";
import { sharedStyles } from "@/styles/shared";
import {
  buildSousCompteFilters,
  formatAmount,
  formatDate,
  MAIN_ACCOUNT_FILTER,
  matchesDateRange,
  matchesSousCompteFilter,
  toComparableDate,
} from "@/tools/tools";
import { listCommissions } from "@/types/commissions.type";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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

export default function CommissionsScreen() {
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
  const [startDateQuery, setStartDateQuery] = useState("");
  const [endDateQuery, setEndDateQuery] = useState("");
  const [activeClient, setActiveClient] = useState("Tous");

  const initialCommissions = useMemo<listCommissions>(
    () => ({
      meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 },
      data: [],
    }),
    [],
  );

  const { userToken } = useAuthContext();
  const {
    data: commissions,
    isLoading,
    isRefreshing,
    isError,
    refresh: handleRefresh,
  } = useCachedResource<listCommissions>({
    cacheKey: COMMISSIONS_LIST_CACHE_KEY,
    initialData: initialCommissions,
    enabled: Boolean(userToken),
    fetcher: async () => getfetchCommissions(userToken ?? ""),
    hasUsableCachedData: (cachedData) =>
      Boolean(
        cachedData &&
        Array.isArray(cachedData.data) &&
        cachedData.data.length > 0,
      ),
  });

  const sousCompteFilters = buildSousCompteFilters(
    commissions.data,
    (commission) => commission.nomSousCompte,
  );

  const filteredCommissions = commissions.data.filter((commission) => {
    const matchesQuery =
      commission.codeCom.toLowerCase().includes(query.toLowerCase()) ||
      commission.nomSousCompte?.toLowerCase().includes(query.toLowerCase());
    const issueComparable = toComparableDate(commission.dateCom);

    const matchesDate = matchesDateRange(
      issueComparable,
      startDateQuery,
      endDateQuery,
    );
    const matchesClient = matchesSousCompteFilter(
      activeClient,
      commission.nomSousCompte,
    );

    return matchesQuery && matchesDate && matchesClient;
  });

  const totalCount = filteredCommissions.length;
  const totalAmount = filteredCommissions.reduce(
    (sum, commission) => sum + commission.montCom,
    0,
  );
  const showInitialLoader = isLoading && commissions.data.length === 0;
  const showErrorState = isError && commissions.data.length === 0;

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader
          showBack
          title="Liste des commissions"
          subtitle="Suivi des commissions"
        />
      </View>
      <FlatList
        data={showInitialLoader || showErrorState ? [] : filteredCommissions}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item: commission }) => (
          <View
            style={[sharedStyles.invoiceCard, { backgroundColor: cardColor }]}
          >
            <View style={sharedStyles.invoiceTopRow}>
              <View style={sharedStyles.invoiceRefBlock}>
                <Text style={[sharedStyles.invoiceRef, { color: textColor }]}>
                  {commission.codeCom}
                </Text>
                <Text
                  style={[sharedStyles.invoiceClient, { color: textColor }]}
                >
                  Vente: {commission.codeVente ?? "—"}
                </Text>
                <Text
                  style={[sharedStyles.invoiceClient, { color: mutedColor }]}
                >
                  {commission.nomSousCompte?.trim()
                    ? commission.nomSousCompte
                    : MAIN_ACCOUNT_FILTER}
                </Text>
              </View>
            </View>

            <View style={sharedStyles.invoiceMetaRow}>
              <View>
                <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>
                  Date commission
                </Text>
                <Text style={[sharedStyles.metaValue, { color: textColor }]}>
                  {formatDate(commission.dateCom)}
                </Text>
              </View>
              <View>
                <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>
                  Code la vente
                </Text>
                <Text style={[sharedStyles.metaValue, { color: textColor }]}>
                  {commission.codeVente ?? "—"}
                </Text>
              </View>
              <View>
                <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>
                  Date de la vente
                </Text>
                <Text style={[sharedStyles.metaValue, { color: textColor }]}>
                  {formatDate(commission.dateVente)}
                </Text>
              </View>
            </View>

            <View style={sharedStyles.invoiceBottomRow}>
              <Text style={[sharedStyles.amountText, { color: textColor }]}>
                {formatAmount(commission.montCom)}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push(`/commissions/${commission.id}` as never)
                }
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
        )}
        contentContainerStyle={[
          sharedStyles.scrollContent,
          { paddingHorizontal: 18, paddingTop: 12 },
        ]}
        ListHeaderComponent={
          <View style={{ gap: 16 }}>
            <View style={sharedStyles.statsRow}>
              <View
                style={[sharedStyles.statCard, { backgroundColor: cardColor }]}
              >
                <Text style={[sharedStyles.statLabel, { color: mutedColor }]}>
                  Toutes les commissions
                </Text>
                <Text style={[sharedStyles.statCount, { color: textColor }]}>
                  {totalCount} commission{totalCount > 1 ? "s" : ""}
                </Text>
                <Text style={[sharedStyles.statValue, { color: textColor }]}>
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
                placeholder="Rechercher une commission ou un client"
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

            {sousCompteFilters.length > 2 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={sharedStyles.filterRow}
              >
                {sousCompteFilters.map((sousCompte) => {
                  const isActive = sousCompte === activeClient;

                  return (
                    <TouchableOpacity
                      key={sousCompte}
                      onPress={() => setActiveClient(sousCompte)}
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
                        {sousCompte}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : null}

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
                subtitle="Impossible de récupérer les commissions. Vérifiez votre connexion."
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
              title="Aucune commission trouvée"
              subtitle="Essayez une autre recherche ou filtre."
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
