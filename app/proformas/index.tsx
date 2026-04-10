import { AppHeader } from "@/components/app-header";
import { DateRangePicker } from "@/components/date-range-picker";
import { EmptyResultsCard } from "@/components/empty-results-card";
import { useAuthContext } from "@/hooks/auth-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useCachedResource } from "@/hooks/use-cached-resource";
import { DEVIS_LIST_CACHE_KEY, setCacheData } from "@/services/cache-service";
import {
  buildSousCompteFilters,
  formatAmount,
  formatDate,
  MAIN_ACCOUNT_FILTER,
  matchesDateRange,
  matchesSousCompteFilter,
  toComparableDate,
} from "@/tools/tools";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
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

import { deleteDevis, getfetchDevis } from "@/services/api-service";
import { sharedStyles } from "@/styles/shared";
import {
  devisStatus,
  listDevis,
  statusDevisColorMap,
} from "@/types/devis.type";
const statusFilters: ("Toutes" | devisStatus)[] = [
  "Toutes",
  "En saisie",
  "Validé",
  "Transformé",
];

export default function ProformasScreen() {
  const router = useRouter();
  const {
    backgroundColor,
    textColor,
    tintColor,
    cardColor,
    mutedColor,
    borderColor,
  } = useAppTheme();

  const initialProformas = useMemo<listDevis>(
    () => ({
      meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 },
      data: [],
    }),
    [],
  );

  const [query, setQuery] = useState("");
  const [startDateQuery, setStartDateQuery] = useState("");
  const [endDateQuery, setEndDateQuery] = useState("");
  const [activeClient, setActiveClient] = useState("Tous");
  const [activeStatus, setActiveStatus] = useState<"Toutes" | devisStatus>(
    "Toutes",
  );
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const { userToken } = useAuthContext();

  const hasUsableCachedData = useCallback(
    (cachedData: listDevis | null) =>
      Boolean(
        cachedData &&
        Array.isArray(cachedData.data) &&
        cachedData.data.length > 0,
      ),
    [],
  );

  const {
    data: proformas,
    setData: setProformas,
    isLoading,
    isRefreshing,
    isError,
    refresh: handleRefresh,
  } = useCachedResource<listDevis>({
    cacheKey: DEVIS_LIST_CACHE_KEY,
    initialData: initialProformas,
    enabled: Boolean(userToken),
    fetcher: async () => getfetchDevis(userToken ?? ""),
    hasUsableCachedData,
  });

  useFocusEffect(
    useCallback(() => {
      handleRefresh();
    }, [handleRefresh]),
  );

  const handleEditDevis = useCallback(
    (devisId: string) => {
      router.push({ pathname: "/devis/nouveau", params: { id: devisId } });
    },
    [router],
  );

  const handleCreateDevis = useCallback(() => {
    router.push("/devis/nouveau");
  }, [router]);

  const handleDeleteDevis = useCallback(
    (devisId: string, codeDevis: string) => {
      if (!userToken) {
        return;
      }

      Alert.alert(
        "Supprimer le devis",
        `Voulez-vous vraiment supprimer le devis ${codeDevis} ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: async () => {
              try {
                setDeletingIds((prev) =>
                  prev.includes(devisId) ? prev : [...prev, devisId],
                );
                await deleteDevis(userToken, devisId);

                let nextSnapshot: listDevis | null = null;

                setProformas((current) => {
                  const updatedData = current.data.filter(
                    (item) => item.id !== devisId,
                  );
                  const currentMeta = current.meta ?? {
                    page: 1,
                    next: 1,
                    totalPages: 1,
                    total: current.data.length,
                    size: current.data.length || 1,
                  };
                  const total = Math.max(
                    (currentMeta.total ?? current.data.length) - 1,
                    updatedData.length,
                  );
                  const size = Math.max(
                    currentMeta.size || updatedData.length || 1,
                    1,
                  );
                  const totalPages = Math.max(1, Math.ceil(total / size));
                  const page = Math.min(currentMeta.page, totalPages);
                  const next = page < totalPages ? page + 1 : page;

                  nextSnapshot = {
                    ...current,
                    meta: {
                      page,
                      next,
                      totalPages,
                      total,
                      size,
                    },
                    data: updatedData,
                  };

                  return nextSnapshot;
                });

                if (nextSnapshot) {
                  await setCacheData(DEVIS_LIST_CACHE_KEY, nextSnapshot);
                }
              } catch (error) {
                Alert.alert(
                  "Suppression impossible",
                  error instanceof Error
                    ? error.message
                    : "Le devis n'a pas pu être supprimé.",
                );
              } finally {
                setDeletingIds((prev) => prev.filter((id) => id !== devisId));
              }
            },
          },
        ],
      );
    },
    [setProformas, userToken],
  );

  const sousCompteFilters = buildSousCompteFilters(
    proformas.data,
    (proforma) => proforma.nomSousCompte,
  );

  const filteredInvoices = proformas.data.filter((proforma) => {
    const matchesQuery =
      proforma.codeDevis.toLowerCase().includes(query.toLowerCase()) ||
      proforma.nomSousCompte?.toLowerCase().includes(query.toLowerCase());
    const issueComparable = toComparableDate(proforma.dateDevis);
    const matchesDate = matchesDateRange(
      issueComparable,
      startDateQuery,
      endDateQuery,
    );
    const matchesClient = matchesSousCompteFilter(
      activeClient,
      proforma.nomSousCompte,
    );
    const matchesStatus =
      activeStatus === "Toutes" || proforma.status === activeStatus;

    return matchesQuery && matchesDate && matchesClient && matchesStatus;
  });

  const totalCount = filteredInvoices.length;
  const totalAmount = filteredInvoices.reduce(
    (sum, proforma) => sum + proforma.totalNetPayer,
    0,
  );
  const showInitialLoader = isLoading && proformas.data.length === 0;
  const showErrorState = isError && proformas.data.length === 0;

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader
          showBack
          title="Liste des devis"
          subtitle="Suivi des devis et proformas"
        />
      </View>
      <FlatList
        data={showInitialLoader || showErrorState ? [] : filteredInvoices}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item: proforma }) => {
          const statusColor = statusDevisColorMap[proforma.status];
          const isDraft = proforma.status === "En saisie";
          const isDeleting = deletingIds.includes(proforma.id);

          return (
            <View
              style={[sharedStyles.invoiceCard, { backgroundColor: cardColor }]}
            >
              <View style={sharedStyles.invoiceTopRow}>
                <View style={sharedStyles.invoiceRefBlock}>
                  <Text style={[sharedStyles.invoiceRef, { color: textColor }]}>
                    {proforma.codeDevis}
                  </Text>
                  <Text
                    style={[sharedStyles.invoiceClient, { color: mutedColor }]}
                  >
                    {proforma.nomSousCompte?.trim()
                      ? proforma.nomSousCompte
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
                    style={[sharedStyles.statusText, { color: statusColor }]}
                  >
                    {proforma.status}
                  </Text>
                </View>
              </View>

              <View style={sharedStyles.invoiceMetaRow}>
                <View>
                  <Text
                    style={[sharedStyles.metaCaption, { color: mutedColor }]}
                  >
                    Émise le
                  </Text>
                  <Text style={[sharedStyles.metaValue, { color: textColor }]}>
                    {formatDate(proforma.dateDevis)}
                  </Text>
                </View>
              </View>

              <View style={sharedStyles.invoiceBottomRow}>
                <Text style={[sharedStyles.amountText, { color: textColor }]}>
                  {formatAmount(proforma.totalNetPayer)}
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {isDraft ? (
                    <TouchableOpacity
                      onPress={() => handleEditDevis(proforma.id)}
                      disabled={isDeleting}
                      accessibilityLabel="Modifier le devis"
                      style={[
                        sharedStyles.actionButton,
                        {
                          backgroundColor: `${tintColor}18`,
                          opacity: isDeleting ? 0.6 : 1,
                        },
                      ]}
                    >
                      <MaterialIcons name="edit" size={18} color={tintColor} />
                    </TouchableOpacity>
                  ) : null}

                  {isDraft ? (
                    <TouchableOpacity
                      onPress={() =>
                        handleDeleteDevis(proforma.id, proforma.codeDevis)
                      }
                      disabled={isDeleting}
                      accessibilityLabel="Supprimer le devis"
                      style={[
                        sharedStyles.actionButton,
                        {
                          backgroundColor: "#fee2e2",
                          opacity: isDeleting ? 0.6 : 1,
                        },
                      ]}
                    >
                      {isDeleting ? (
                        <ActivityIndicator size="small" color="#b91c1c" />
                      ) : (
                        <MaterialIcons
                          name="delete-outline"
                          size={18}
                          color="#b91c1c"
                        />
                      )}
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    onPress={() =>
                      router.push(`/proformas/${proforma.id}` as never)
                    }
                    style={[
                      sharedStyles.actionButton,
                      { backgroundColor: `${tintColor}18` },
                    ]}
                  >
                    <Text
                      style={[sharedStyles.actionText, { color: tintColor }]}
                    >
                      Voir détail
                    </Text>
                  </TouchableOpacity>
                </View>
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
            <TouchableOpacity
              onPress={handleCreateDevis}
              style={[
                sharedStyles.actionButton,
                {
                  backgroundColor: tintColor,
                  alignSelf: "flex-end",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                },
              ]}
            >
              <MaterialIcons name="add" size={18} color="#ffffff" />
              <Text style={sharedStyles.buttonTextPrimary}>Nouveau devis</Text>
            </TouchableOpacity>

            <View style={sharedStyles.statsRow}>
              <View
                style={[sharedStyles.statCard, { backgroundColor: cardColor }]}
              >
                <Text style={[sharedStyles.statLabel, { color: mutedColor }]}>
                  Tous les devis
                </Text>
                <Text style={[sharedStyles.statCount, { color: textColor }]}>
                  {totalCount} devis
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
                placeholder="Rechercher un devis ou un sous-compte"
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

            {statusFilters.length > 2 ? (
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
                subtitle="Impossible de récupérer les devis. Vérifiez votre connexion."
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
              title="Aucun devis trouvé"
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
