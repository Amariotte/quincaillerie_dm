import { AppHeader } from "@/components/app-header";
import { EmptyResultsCard } from "@/components/empty-results-card";
import { InfiniteListFooter } from "@/components/infinite-list-footer";
import { ProductImage } from "@/components/product-image";
import { useAuthContext } from "@/hooks/auth-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { usePaginatedCachedResource } from "@/hooks/use-paginated-cached-resource";
import { getfetchProduits } from "@/services/api-service";
import {
  PRODUITS_LIST_CACHE_KEY
} from "@/services/cache-service";
import { sharedStyles } from "@/styles/shared";
import { formatAmount } from "@/tools/tools";
import { listProduits } from "@/types/produits.type";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProduitsScreen() {
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

  const initialProduits = useMemo<listProduits>(
    () => ({    
  meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 },
    data: [],
  }), []);

  const [activeFamille, setActiveFamille] = useState("Toutes");
  const FAMILLE_NON_DEFINIE = "Non définie";

const { userToken } = useAuthContext();
  const {
    data: produits,
    isLoading,
    isRefreshing,
    isLoadingMore,
    isError,
    refresh: handleRefresh,
    loadMore,
    hasNextPage,
  } = usePaginatedCachedResource<listProduits["data"][number], listProduits>({

    cacheKey: PRODUITS_LIST_CACHE_KEY,
    initialData: initialProduits,
    enabled: Boolean(userToken),
    fetchPage: async (page, size) => getfetchProduits(userToken ?? "", { page, size }),
    getItemKey: (item) => item.id,
    hasUsableCachedData: (cachedData) =>
      Boolean(
        cachedData &&
        Array.isArray(cachedData.data) &&
        cachedData.data.length > 0,
      ),
  });


  const filteredProducts = useMemo(() => {
    return produits.data.filter((product) => {
      const matchesQuery =
        product.designation.toLowerCase().includes(query.toLowerCase()) ||
        product.reference.toLowerCase().includes(query.toLowerCase());

      const matchesFamille =
        activeFamille === "Toutes"
          ? true
          : product.nomfamille === activeFamille;

      return matchesQuery && matchesFamille;
    });
  }, [activeFamille, produits.data, query]);


  const familles = [
    "Toutes",
    FAMILLE_NON_DEFINIE,
    ...Array.from(
      new Set(
        produits.data
          .map((f) => f.nomfamille)
          .filter(
            (nomfamille): nomfamille is string =>
              typeof nomfamille === "string" && nomfamille.trim().length > 0,
          ),
      ),
    ),
  ];

  familles.sort((a, b) => {
    if (a === "Toutes") return -1;
    if (b === "Toutes") return 1;
    if (a === FAMILLE_NON_DEFINIE) return -1;
    if (b === FAMILLE_NON_DEFINIE) return 1;
    return a.localeCompare(b);
  });

  const showInitialLoader = isLoading && produits.data.length === 0;
  const showErrorState = isError && produits.data.length === 0;


  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader
          showBack
          title="Liste des produits"
          subtitle="Prix et familles"
        />
      </View>
      <FlatList
        data={showInitialLoader || showErrorState ? [] : filteredProducts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item: product }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: `/produits/${product.id}`,
                params: { produit: JSON.stringify(product) },
              } as never)
            }
            style={[styles.productCard, { backgroundColor: cardColor }]}
          >
            <View style={styles.productTopRow}>
              <ProductImage
                productId={product.id}
                userToken={userToken}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: textColor }]}>
                  {product.designation}
                </Text>
                <View style={styles.productMetaRow}>
                  <Text style={[styles.productSku, { color: mutedColor }]}>Réf: {product.reference}</Text>
                  <Text style={[styles.priceInlineValue, { color: textColor }]}>
                    {formatAmount(product.prixVenteTTC)}
                  </Text>
                </View>
                <Text style={[styles.familyValue, { color: tintColor }]}>
                  {product.nomfamille || FAMILLE_NON_DEFINIE}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={[sharedStyles.scrollContent, { paddingHorizontal: 18, paddingTop: 12 }]}
        ListHeaderComponent={
          <View style={{ gap: 16 }}>
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
                placeholder="Rechercher un produit ou une famille"
                placeholderTextColor={mutedColor}
                style={[sharedStyles.searchInput, { color: textColor }]}
              />
            </View>

            <FlatList
              data={familles}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              contentContainerStyle={sharedStyles.filterRow}
              renderItem={({ item: famille }) => {
                const isActive = famille === activeFamille;
                return (
                  <TouchableOpacity
                    onPress={() => setActiveFamille(famille)}
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
                      {famille}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            {showInitialLoader ? (
              <View style={styles.loaderBlock}>
                <ActivityIndicator size="large" color={tintColor} />
              </View>
            ) : null}

            {showErrorState ? (
              <EmptyResultsCard
                iconName="cloud-off"
                title="Erreur de chargement"
                subtitle="Impossible de récupérer les produits. Vérifiez votre connexion."
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
              title="Aucun produit trouvé"
              subtitle="Essayez une autre recherche ou catégorie."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListFooterComponent={
          filteredProducts.length > 0 ? (
            <InfiniteListFooter isLoadingMore={isLoadingMore} tintColor={tintColor} mutedColor={mutedColor} />
          ) : null
        }
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={10}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
          />
        }
        onEndReached={() => {
          if (hasNextPage) {
            void loadMore();
          }
        }}
        onEndReachedThreshold={0.35}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loaderBlock: {
    paddingVertical: 24,
    alignItems: "center",
  },
  productCard: {
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  productTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  productInfo: {
    flex: 1,
  },
  productImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "800",
  },
  productSku: {
    fontSize: 12,
    marginTop: 4,
  },
  productMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  stockLabel: {
    fontSize: 12,
  },
  stockValue: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },
  priceInlineValue: {
    fontSize: 14,
    fontWeight: "900",
    marginTop: 4,
  },
  familyValue: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },
});
