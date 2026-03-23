import { AppHeader } from '@/components/app-header';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchProduits } from '@/services/api-service';
import { getCacheData, PRODUITS_LIST_CACHE_KEY, setCacheData } from '@/services/cache-service';
import { formatAmount } from '@/tools/tools';
import { listProduits } from '@/types/produits.type';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const defaultProductImage = require('../../assets/images/partial-react-logo.png');

const getProductImage = (imageName: string | undefined) => {
  return defaultProductImage;
};

export default function ProduitsScreen() {
  const router = useRouter();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor, borderColor } = useAppTheme();
  const [query, setQuery] = useState('');
  const [produits, setProduits] = useState<listProduits>({ meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 }, data: [] });
  const [activeFamille, setActiveFamille] = useState('Toutes');
   const [isLoading, setIsLoading] = useState(true);
   const [isError, setIsError] = useState(false);
   const [isOfflineMode, setIsOfflineMode] = useState(false);
    const { userToken } = useAuthContext();
  const MAIN_ACCOUNT_FILTER = 'Non définie';

   const filteredProducts = useMemo(() => {
    return produits.data.filter((product) => {
      const matchesQuery =
        product.designation.toLowerCase().includes(query.toLowerCase()) ||
        product.reference.toLowerCase().includes(query.toLowerCase());
      
  
        const matchesFamille = activeFamille === 'Toutes' ? true : product.nomfamille === activeFamille;

      return matchesQuery && matchesFamille;
    });
  }, [activeFamille, query]);


  const loadProduits = useCallback(async () => {
    if (!userToken) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setIsError(false);
      
      // Try to load from cache first
      const cachedData = await getCacheData<listProduits>(PRODUITS_LIST_CACHE_KEY);
      if (cachedData && Array.isArray(cachedData.data) && cachedData.data.length > 0) {
        setProduits(cachedData);
      }

      // Fetch from API to update
      const data = await getfetchProduits(userToken);
      setProduits(data);
      setIsOfflineMode(false);
      await setCacheData(PRODUITS_LIST_CACHE_KEY, data);
    } catch {
      setProduits({ meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 }, data: [] });
      setIsError(true);
      setIsOfflineMode(true);
    } finally {
      setIsLoading(false);
    }
  }, [userToken]);


 const familles = [
    'Toutes',
    MAIN_ACCOUNT_FILTER,
    ...Array.from(
      new Set(
        produits.data
          .map((f) => f.nomfamille)
          .filter((nomfamille): nomfamille is string => typeof nomfamille === 'string' && nomfamille.trim().length > 0)
      )
    ),
  ];

  familles.sort((a, b) => {
    if (a === 'Toutes') return -1;
    if (b === 'Toutes') return 1;
    if (a === MAIN_ACCOUNT_FILTER) return -1;
    if (b === MAIN_ACCOUNT_FILTER) return 1;
    return a.localeCompare(b);
  });


useEffect(() => {
    loadProduits();
  }, [loadProduits]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Liste des produits" subtitle="Prix et familles" />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={[styles.searchBox, { backgroundColor: cardColor, borderColor }]}> 
            <MaterialIcons name="search" size={20} color={mutedColor} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher un produit ou une famille"
              placeholderTextColor={mutedColor}
              style={[styles.searchInput, { color: textColor }]}
            />
          </View>

          <FlatList
            data={familles}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filterRow}
            renderItem={({ item: famille }) => {
              const isActive = famille === activeFamille;
              return (
                <TouchableOpacity
                  onPress={() => setActiveFamille(famille)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? tintColor : cardColor,
                      borderColor: isActive ? tintColor : borderColor,
                    },
                  ]}
                >
                  <Text style={[styles.filterText, { color: isActive ? '#ffffff' : textColor }]}>{famille}</Text>
                </TouchableOpacity>
              );
            }}
          />

          <View style={styles.listBlock}>
            {isLoading ? (
              <View style={styles.loaderBlock}>
                <ActivityIndicator size="large" color={tintColor} />
              </View>
            ) : filteredProducts.length === 0 ? (
              <EmptyResultsCard
                iconName="inventory-2"
                title="Aucun produit trouvé"
                subtitle="Essayez une autre recherche ou catégorie."
                cardColor={cardColor}
                titleColor={textColor}
                subtitleColor={mutedColor}
              />
            ) : (
              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => String(item.id)}
                scrollEnabled={false}
                contentContainerStyle={styles.listBlock}
                initialNumToRender={20}
                maxToRenderPerBatch={20}
                windowSize={10}
                renderItem={({ item: product }) => (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push(`/produits/${product.id}` as never)}
                    style={[styles.productCard, { backgroundColor: cardColor }]}
                  >
                    <View style={styles.productTopRow}>
                      <Image source={getProductImage(product.imageUrl)} style={styles.productImage} resizeMode="cover" />
                      <View style={styles.productInfo}>
                        <Text style={[styles.productName, { color: textColor }]}>{product.designation}</Text>
                        <View style={styles.productMetaRow}>
                          <Text style={[styles.productSku, { color: mutedColor }]}>Réf: {product.reference}</Text>
                          <Text style={[styles.priceInlineValue, { color: textColor }]}>{formatAmount(product.prixVenteTTC)}</Text>
                        </View>
                        <Text style={[styles.familyValue, { color: tintColor }]}>{product.nomfamille || MAIN_ACCOUNT_FILTER}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 16,
  },
  searchBox: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterRow: {
    gap: 10,
    paddingRight: 10,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listBlock: {
    gap: 12,
  },
  loaderBlock: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  productCard: {
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  productTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontWeight: '800',
  },
  productSku: {
    fontSize: 12,
    marginTop: 4,
  },
  productMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  stockLabel: {
    fontSize: 12,
  },
  stockValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  priceInlineValue: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  familyValue: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
});
