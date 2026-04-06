import { AppHeader } from "@/components/app-header";
import { EmptyResultsCard } from "@/components/empty-results-card";
import { useAuthContext } from "@/hooks/auth-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useCachedResource } from "@/hooks/use-cached-resource";
import { sharedStyles } from "@/styles/shared.js";

import { getfetchSousComptes } from "@/services/api-service";
import { SOUS_COMPTES_LIST_CACHE_KEY } from "@/services/cache-service";
import { listSousComptes } from "@/types/sousCompte.type.js";
import { MaterialIcons } from "@expo/vector-icons";
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

export default function SousComptesScreen() {
  const initialSousComptes = useMemo<listSousComptes>(
    () => ({
      meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 },
      data: [],
    }),
    [],
  );
  const {
    backgroundColor,
    textColor,
    tintColor,
    cardColor,
    mutedColor,
    borderColor,
  } = useAppTheme();
  const { userToken } = useAuthContext();
  const [query, setQuery] = useState("");
  const {
    data: sousComptes,
    isLoading,
    isRefreshing,
    isError,
    refresh: handleRefresh,
  } = useCachedResource<listSousComptes>({
    cacheKey: SOUS_COMPTES_LIST_CACHE_KEY,
    initialData: initialSousComptes,
    enabled: Boolean(userToken),
    fetcher: async () => getfetchSousComptes(userToken ?? ""),
    hasUsableCachedData: (cachedData) =>
      Boolean(
        cachedData &&
        Array.isArray(cachedData.data) &&
        cachedData.data.length > 0,
      ),
  });

  const filteredSousComptes = sousComptes.data.filter((sousCompte) => {
    const matchesQuery = sousCompte.nom
      .toLowerCase()
      .includes(query.toLowerCase());

    return matchesQuery;
  });

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
            <View style={[sharedStyles.statCard, { backgroundColor: cardColor }]}>
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
                return (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[sharedStyles.invoiceCard, { backgroundColor: cardColor }]}
                  >
                    <View style={sharedStyles.invoiceTopRow}>
                      <View style={sharedStyles.invoiceRefBlock}>
                        <Text style={[sharedStyles.invoiceRef, { color: textColor }]}>
                          {sousCompte.nom}
                        </Text>
                        <Text
                          style={[sharedStyles.invoiceClient, { color: mutedColor }]}
                        >
                          {sousCompte.description?.trim() ||
                            "Aucune description"}
                        </Text>
                      </View>
                    </View>

                    <View style={sharedStyles.invoiceMetaRow}>
                      <Text
                        style={[
                          sharedStyles.metaCaption,
                          { color: mutedColor },
                        ]}
                      >
                        Téléphone
                      </Text>
                      <Text style={[sharedStyles.metaValue, { color: textColor }]}>
                        {sousCompte.mobile || "Aucun numéro"}
                      </Text>
                    </View>

                    <View style={sharedStyles.invoiceMetaRow}>
                      <Text
                        style={[
                          sharedStyles.metaCaption,
                          { color: mutedColor },
                        ]}
                      >
                        Email
                      </Text>
                      <Text style={[sharedStyles.metaValue, { color: textColor }]}>
                        {sousCompte.email || "Aucun email"}
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
