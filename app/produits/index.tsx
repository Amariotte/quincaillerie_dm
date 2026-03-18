import { AppHeader } from '@/components/app-header';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { products } from '@/data/fakeDatas/produits.fake';
import { useAppTheme } from '@/hooks/use-app-theme';
import { formatAmount } from '@/tools/tools';
import { ProductImageKey } from '@/types/produits.type';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const categories = ['Toutes', ...Array.from(new Set(products.map((product) => product.category)))];
const defaultProductImage = require('../../assets/images/partial-react-logo.png');

const getProductImage = (imageKey?: ProductImageKey) => (defaultProductImage);

export default function ProduitsScreen() {
  const router = useRouter();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor, borderColor } = useAppTheme();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Toutes');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery =
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.sku.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = activeCategory === 'Toutes' || product.category === activeCategory;

      return matchesQuery && matchesCategory;
    });
  }, [activeCategory, query]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader showBack title="Liste des produits" subtitle="Stock, prix et catégories" />

          <View style={[styles.searchBox, { backgroundColor: cardColor, borderColor }]}> 
            <MaterialIcons name="search" size={20} color={mutedColor} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher un produit ou une référence"
              placeholderTextColor={mutedColor}
              style={[styles.searchInput, { color: textColor }]}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {categories.map((category) => {
              const isActive = category === activeCategory;

              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => setActiveCategory(category)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? tintColor : cardColor,
                      borderColor: isActive ? tintColor : borderColor,
                    },
                  ]}
                >
                  <Text style={[styles.filterText, { color: isActive ? '#ffffff' : textColor }]}>{category}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.listBlock}>
            {filteredProducts.map((product) => {
              const stockColor = product.stock < 30 ? '#dc2626' : product.stock < 60 ? '#f59e0b' : '#16a34a';

              return (
                <TouchableOpacity
                  key={product.id}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/produits/${product.id}` as never)}
                  style={[styles.productCard, { backgroundColor: cardColor }]}
                >
                  <View style={styles.productTopRow}>
                    <Image source={getProductImage(product.image)} style={styles.productImage} resizeMode="cover" />
                    <View style={styles.productInfo}>
                      <Text style={[styles.productName, { color: textColor }]}>{product.name}</Text>
                      <Text style={[styles.productSku, { color: mutedColor }]}>Réf: {product.sku}</Text>
                    </View>
                    <View style={[styles.categoryTag, { backgroundColor: `${tintColor}18` }]}>
                      <Text style={[styles.categoryText, { color: tintColor }]}>{product.category}</Text>
                    </View>
                  </View>

                  <View style={styles.productBottomRow}>
                    <View>
                      <Text style={[styles.stockLabel, { color: mutedColor }]}>Stock</Text>
                      <Text style={[styles.stockValue, { color: stockColor }]}>{product.stock} {product.unit}</Text>
                    </View>
                    <View style={styles.priceBlock}>
                      <Text style={[styles.priceLabel, { color: mutedColor }]}>Prix unitaire</Text>
                      <Text style={[styles.priceValue, { color: textColor }]}>{formatAmount(product.price)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            {filteredProducts.length === 0 ? (
              <EmptyResultsCard
                iconName="inventory-2"
                title="Aucun produit trouvé"
                subtitle="Essayez une autre recherche ou catégorie."
                cardColor={cardColor}
                titleColor={textColor}
                subtitleColor={mutedColor}
              />
            ) : null}
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
  categoryTag: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '800',
  },
  productBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 10,
  },
  stockLabel: {
    fontSize: 12,
  },
  stockValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
});
