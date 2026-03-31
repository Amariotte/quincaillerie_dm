import { AppHeader } from "@/components/app-header";
import { DateRangePicker } from "@/components/date-range-picker";
import { useAuthContext } from "@/hooks/auth-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useCachedResource } from "@/hooks/use-cached-resource";
import { getfetchReglements } from "@/services/api-service";
import { REGLEMENTS_LIST_CACHE_KEY } from "@/services/cache-service";
import { sharedStyles } from "@/styles/shared.js";
import {
  buildSousCompteFilters,
  formatAmount,
  formatDate,
  MAIN_ACCOUNT_FILTER,
  matchesDateRange,
  matchesSousCompteFilter,
  toComparableDate,
} from "@/tools/tools";
import {
  listReglements,
  statusEncaisse,
  statusEncaisseColorMap,
} from "@/types/reglements.type";
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

export default function ReglementsScreen() {
  const router = useRouter();
  const {
    backgroundColor,
    textColor,
    tintColor,
    cardColor,
    mutedColor,
    borderColor,
  } = useAppTheme();
  
  const initialReglements = useMemo<listReglements>(
    () => ({
      meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 },
      data: [],
    }),
    [],
  );

  const { userToken } = useAuthContext();
  const {
    data: reglements,
    isLoading,
    isRefreshing,
    isError,
    refresh: handleRefresh,
  } = useCachedResource<listReglements>({
    cacheKey: REGLEMENTS_LIST_CACHE_KEY,
    initialData: initialReglements,
    enabled: Boolean(userToken),
    fetcher: async () => getfetchReglements(userToken ?? ""),
    hasUsableCachedData: (cachedData) =>
      Boolean(
        cachedData &&
        Array.isArray(cachedData.data) &&
        cachedData.data.length > 0,
      ),
  });

  const [query, setQuery] = useState("");
  const [startDateQuery, setStartDateQuery] = useState("");
  const [endDateQuery, setEndDateQuery] = useState("");
  const [activeClient, setActiveClient] = useState("Tous");
  const [activeStatus, setActiveStatus] = useState<statusEncaisse | "Tous">(
    "Tous",
  );
  const [activePaymentMode, setActivePaymentMode] = useState("Tous modes");

  const statusFilters: (statusEncaisse | "Tous")[] = [
    "Tous",
    ...Array.from(
      new Set(
        reglements.data
          .map((reglement) => reglement.statusEncaisse)
          .filter(
            (status): status is statusEncaisse =>
              typeof status === "string" && status.trim().length > 0,
          ),
      ),
    ),
  ];

  const sousCompteFilters = buildSousCompteFilters(
    reglements.data,
    (reglement) => reglement.nomSousCompte,
  );

  const paymentModeFilters = [
    "Tous modes",
    ...Array.from(
      new Set(
        reglements.data
          .map((reglement) => reglement.nomModePaiement)
          .filter(
            (mode): mode is string =>
              typeof mode === "string" && mode.trim().length > 0,
          ),
      ),
    ),
  ];

  const filteredReglements = reglements.data.filter((reglement) => {
    const matchesQuery =
      reglement.codeReg.toLowerCase().includes(query.toLowerCase()) ||
      reglement.nomSousCompte?.toLowerCase().includes(query.toLowerCase());
    const issueComparable = toComparableDate(reglement.dateReg);
    const matchesDate = matchesDateRange(
      issueComparable,
      startDateQuery,
      endDateQuery,
    );
    const matchesStatus =
      activeStatus === "Tous" || reglement.statusEncaisse === activeStatus;
    const matchesPaymentMode =
      activePaymentMode === "Tous modes" ||
      reglement.nomModePaiement === activePaymentMode;
    const matchesClient = matchesSousCompteFilter(
      activeClient,
      reglement.nomSousCompte,
    );

    return (
      matchesQuery &&
      matchesDate &&
      matchesClient &&
      matchesStatus &&
      matchesPaymentMode
    );
  });

  const totalCount = filteredReglements.length;
  const totalAmount = filteredReglements.reduce(
    (sum, reglement) => sum + reglement.montantReg,
    0,
  );
  const unsettledReglements = filteredReglements.filter(
    (reglement) => reglement.statusEncaisse === "Non encaissé",
  );
  const unsettledCount = unsettledReglements.length;
  const unsettledAmount = unsettledReglements.reduce(
    (sum, reglement) => sum + reglement.montantReg,
    0,
  );

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader
          showBack
          title="Liste des règlements"
          subtitle="Suivi des paiements et soldes restants"
        />
      </View>
      <ScrollView
        contentContainerStyle={sharedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
          />
        }
      >
        <View style={sharedStyles.container}>
          <View style={sharedStyles.statsRow}>
            <View
              style={[sharedStyles.statCard, { backgroundColor: cardColor }]}
            >
              <Text style={[sharedStyles.statLabel, { color: mutedColor }]}>
                Tous les règlements
              </Text>
              <Text style={[sharedStyles.statCount, { color: textColor }]}>
                {totalCount} règlement{totalCount > 1 ? "s" : ""}
              </Text>
              <Text style={[sharedStyles.statValue, { color: textColor }]}>
                {formatAmount(totalAmount)}
              </Text>
            </View>

            <View
              style={[sharedStyles.statCard, { backgroundColor: cardColor }]}
            >
              <Text style={[sharedStyles.statLabel, { color: mutedColor }]}>
                Règlements non encaissés
              </Text>
              <Text style={[sharedStyles.statCount, { color: "#dc2626" }]}>
                {unsettledCount} règlement{unsettledCount > 1 ? "s" : ""}
              </Text>
              <Text style={[sharedStyles.statValue, { color: "#dc2626" }]}>
                {formatAmount(unsettledAmount)}
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
              placeholder="Rechercher un règlement ou un sous-compte"
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

          {sousCompteFilters.length > 2 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={sharedStyles.filterRow}
            >
              {sousCompteFilters.map((client) => {
                const isActive = client === activeClient;

                return (
                  <TouchableOpacity
                    key={client}
                    onPress={() => setActiveClient(client)}
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
                      {client}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {statusFilters.length > 2 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={sharedStyles.filterRow}
            >
              {statusFilters.map((status) => {
                const isActive = status === activeStatus;

                return (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setActiveStatus(status)}
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
                      {status}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {paymentModeFilters.length > 2 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={sharedStyles.filterRow}
            >
              {paymentModeFilters.map((mode) => {
                const isActive = mode === activePaymentMode;

                return (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setActivePaymentMode(mode)}
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
                      {mode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={tintColor}
              style={{ marginTop: 32 }}
            />
          ) : isError ? (
            <View
              style={[sharedStyles.emptyCard, { backgroundColor: cardColor }]}
            >
              <MaterialIcons name="cloud-off" size={28} color={mutedColor} />
              <Text style={[sharedStyles.emptyTitle, { color: textColor }]}>
                Erreur de chargement
              </Text>
              <Text style={[sharedStyles.emptyText, { color: mutedColor }]}>
                Impossible de récupérer les règlements.
              </Text>
            </View>
          ) : filteredReglements.length === 0 ? (
            <View
              style={[sharedStyles.emptyCard, { backgroundColor: cardColor }]}
            >
              <MaterialIcons name="receipt-long" size={28} color={mutedColor} />
              <Text style={[sharedStyles.emptyTitle, { color: textColor }]}>
                Aucun règlement trouvé
              </Text>
              <Text style={[sharedStyles.emptyText, { color: mutedColor }]}>
                Ajustez votre recherche ou le filtre de statut.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredReglements}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              contentContainerStyle={sharedStyles.listBlock}
              renderItem={({ item: reglement }) => {
                const statusLabel = reglement.statusEncaisse ?? "Non encaissé";
                const statusColor =
                  statusEncaisseColorMap[
                    reglement.statusEncaisse ?? "Non encaissé"
                  ] || tintColor;

                return (
                  <View
                    style={[
                      sharedStyles.invoiceCard,
                      { backgroundColor: cardColor },
                    ]}
                  >
                    <View style={sharedStyles.invoiceTopRow}>
                      <View style={sharedStyles.invoiceRefBlock}>
                        <Text
                          style={[
                            sharedStyles.invoiceRef,
                            { color: textColor },
                          ]}
                        >
                          {reglement.codeReg}
                        </Text>
                        <Text
                          style={[
                            sharedStyles.invoiceClient,
                            { color: mutedColor },
                          ]}
                        >
                          {reglement.nomSousCompte?.trim()
                            ? reglement.nomSousCompte
                            : MAIN_ACCOUNT_FILTER}
                        </Text>
                      </View>
                      <View
                        style={[
                          sharedStyles.statusBadge,
                          { backgroundColor: `${statusColor}18` },
                        ]}
                      >
                        <Text
                          style={[
                            sharedStyles.statusText,
                            { color: statusColor },
                          ]}
                        >
                          {statusLabel}
                        </Text>
                      </View>
                    </View>

                    <View style={sharedStyles.invoiceMetaRow}>
                      <View>
                        <Text
                          style={[
                            sharedStyles.metaCaption,
                            { color: mutedColor },
                          ]}
                        >
                          Date
                        </Text>
                        <Text
                          style={[sharedStyles.metaValue, { color: textColor }]}
                        >
                          {reglement.dateReg
                            ? formatDate(reglement.dateReg)
                            : "—"}
                        </Text>
                      </View>
                      <View>
                        <Text
                          style={[
                            sharedStyles.metaCaption,
                            { color: mutedColor },
                          ]}
                        >
                          Référence
                        </Text>
                        <Text
                          style={[sharedStyles.metaValue, { color: textColor }]}
                        >
                          {reglement.refReg || "-"}
                        </Text>
                      </View>
                    </View>

                    <View style={sharedStyles.metaModeRow}>
                      <Text
                        style={[
                          sharedStyles.metaCaption,
                          { color: mutedColor },
                        ]}
                      >
                        Mode de paiement
                      </Text>
                      <Text
                        style={[sharedStyles.metaValue, { color: textColor }]}
                      >
                        {reglement.nomModePaiement || "—"}
                      </Text>
                    </View>

                    <View style={sharedStyles.invoiceBottomRow}>
                        <Text
                          style={[
                            sharedStyles.amountText,
                            { color: textColor },
                          ]}
                        >
                          {formatAmount(reglement.montantReg)}
                        </Text>

                      <TouchableOpacity
                        onPress={() =>
                          router.push(`/reglements/${reglement.id}` as never)
                        }
                        style={[
                          sharedStyles.actionButton,
                          { backgroundColor: `${tintColor}18` },
                        ]}
                      >
                        <Text
                          style={[
                            sharedStyles.actionText,
                            { color: tintColor },
                          ]}
                        >
                          Voir détail
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
