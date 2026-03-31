import { AppHeader } from "@/components/app-header";
import { EmptyResultsCard } from "@/components/empty-results-card";
import { useAuthContext } from "@/hooks/auth-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { getfetchSousComptes } from "@/services/api-service";
import {
  SOUS_COMPTES_LIST_CACHE_KEY,
  getCacheData,
  setCacheData,
} from "@/services/cache-service";
import { sharedStyles } from "@/styles/shared.js";
import { formatAmount } from "@/tools/tools";

import { listSousComptes } from "@/types/sousCompte.type.js";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
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
import styles from "./style.js";

export default function SousComptesScreen() {
  const {
    backgroundColor,
    textColor,
    tintColor,
    cardColor,
    mutedColor,
    borderColor,
  } = useAppTheme();
  const { userToken } = useAuthContext();

  const [sousComptes, setSousComptes] = useState<listSousComptes>({
    meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 },
    data: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);

  const [query, setQuery] = useState("");

  const loadSousComptes = useCallback(async () => {
    if (!userToken) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setIsError(false);
      // Try to load from cache first
      const cachedData = await getCacheData<listSousComptes>(
        SOUS_COMPTES_LIST_CACHE_KEY,
      );
      if (
        cachedData &&
        Array.isArray(cachedData.data) &&
        cachedData.data.length > 0
      ) {
        setSousComptes(cachedData);
      }

      // Fetch from API to update
      const data = await getfetchSousComptes(userToken);
      setSousComptes(data);
      await setCacheData(SOUS_COMPTES_LIST_CACHE_KEY, data);
    } catch {
      setSousComptes({
        meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 },
        data: [],
      });
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [userToken]);

  useEffect(() => {
    loadSousComptes();
  }, [loadSousComptes]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (!userToken) {
        setIsRefreshing(false);
        return;
      }
      const data = await getfetchSousComptes(userToken);
      setSousComptes(data);
      await setCacheData(SOUS_COMPTES_LIST_CACHE_KEY, data);
      setIsError(false);
    } catch {
      setIsError(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [userToken]);

  const filteredSousComptes = sousComptes.data.filter((sousCompte) => {
    const matchesQuery = sousCompte.nom
      .toLowerCase()
      .includes(query.toLowerCase());

    return matchesQuery;
  });

  const getSousCompteBalance = (value: number | string | null | undefined) => {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value === "string") {
      const normalized = Number(value.replace(/\s/g, "").replace(",", "."));
      return Number.isFinite(normalized) ? normalized : null;
    }

    return null;
  };

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader
          showBack
          title="Liste des sous comptes"
          subtitle="Suivi des sous comptes"
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
            <View style={[styles.statCard, { backgroundColor: cardColor }]}>
              <Text style={[sharedStyles.statLabel, { color: mutedColor }]}>
                Toutes les sous comptes
              </Text>
              <Text style={[sharedStyles.statCount, { color: textColor }]}>
                {filteredSousComptes.length} sous compte
                {filteredSousComptes.length > 1 ? "s" : ""}
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
              placeholder="Rechercher un sous-compte"
              placeholderTextColor={mutedColor}
              style={[sharedStyles.searchInput, { color: textColor }]}
            />
          </View>

          {isLoading && (
            <ActivityIndicator
              size="large"
              color={tintColor}
              style={{ marginTop: 32 }}
            />
          )}

          {isError && !isLoading && (
            <EmptyResultsCard
              iconName="cloud-off"
              title="Erreur de chargement"
              subtitle="Impossible de récupérer les sous comptes. Vérifiez votre connexion."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          )}

          {!isLoading && !isError && filteredSousComptes.length === 0 && (
            <EmptyResultsCard
              iconName="inventory-2"
              title="Aucun sous compte trouvé"
              subtitle="Essayez une autre recherche ou filtre."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          )}

          {!isLoading && !isError && filteredSousComptes.length > 0 && (
            <FlatList
              data={filteredSousComptes}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              contentContainerStyle={sharedStyles.listBlock}
              renderItem={({ item: sousCompte }) => {
                const balance = getSousCompteBalance(sousCompte.solde);
                const balanceColor =
                  balance === null
                    ? textColor
                    : balance < 0
                      ? "#dc2626"
                      : balance > 0
                        ? "#16a34a"
                        : textColor;

                return (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[styles.invoiceCard, { backgroundColor: cardColor }]}
                  >
                    <View style={styles.invoiceTopRow}>
                      <View style={styles.invoiceRefBlock}>
                        <Text style={[styles.invoiceRef, { color: textColor }]}>
                          {sousCompte.nom}
                        </Text>
                        <Text
                          style={[styles.invoiceClient, { color: mutedColor }]}
                        >
                          {sousCompte.description?.trim() ||
                            "Aucune description"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.invoiceMetaRow}>
                      <Text
                        style={[
                          sharedStyles.metaCaption,
                          { color: mutedColor },
                        ]}
                      >
                        Téléphone
                      </Text>
                      <Text style={[styles.metaValue, { color: textColor }]}>
                        {sousCompte.mobile || "Aucun numéro"}
                      </Text>
                    </View>

                    <View style={styles.invoiceMetaRow}>
                      <Text
                        style={[
                          sharedStyles.metaCaption,
                          { color: mutedColor },
                        ]}
                      >
                        Email
                      </Text>
                      <Text style={[styles.metaValue, { color: textColor }]}>
                        {sousCompte.email || "Aucun email"}
                      </Text>
                    </View>

                    <View style={styles.invoiceMetaRow}>
                      <Text
                        style={[
                          sharedStyles.metaCaption,
                          { color: mutedColor },
                        ]}
                      >
                        Solde
                      </Text>
                      <Text style={[styles.metaValue, { color: balanceColor }]}>
                        {balance === null
                          ? "Solde indisponible"
                          : formatAmount(balance)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
