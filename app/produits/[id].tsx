import { AppHeader } from '@/components/app-header';
import { produitsFakeData } from '@/data/datas.fake';
import { useAppTheme } from '@/hooks/use-app-theme';
import { sharedStyles } from '@/styles/shared';
import { formatAmount } from '@/tools/tools';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const defaultProductImage = require('../../assets/images/partial-react-logo.png');

const getProductImage = (url : string | undefined
) => ( defaultProductImage);

export default function ProduitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor } = useAppTheme();

  const product = produitsFakeData.data.find((item) => item.id === id);

  if (!product) {
    return (
      <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
          <AppHeader showBack title="Détail produit" subtitle="Produit introuvable" />
        </View>
        <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
          <View style={sharedStyles.container}>
            <View style={[sharedStyles.emptyCard, { backgroundColor: cardColor }]}>
              <MaterialIcons name="error-outline" size={30} color="#dc2626" />
              <Text style={[sharedStyles.emptyTitle, { color: textColor }]}>Produit introuvable</Text>
              <Text style={[sharedStyles.emptyText, { color: mutedColor }]}>Ce produit n'existe pas ou a été supprimé.</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Détail produit" subtitle={product.reference} />
      </View>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={sharedStyles.container}>
          <View style={[styles.headerCard, { backgroundColor: cardColor }]}>
            <Image source={getProductImage(product.imageUrl)} style={styles.productImage} resizeMode="cover" />
            <View style={styles.productTextBlock}>
              <Text style={[styles.productName, { color: textColor }]}>{product.designation}</Text>
              <View style={[styles.categoryTag, { backgroundColor: `${tintColor}18` }]}>
                <Text style={[styles.categoryText, { color: tintColor }]}>{product.nomfamille}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.detailCard, { backgroundColor: cardColor }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: mutedColor }]}>Référence</Text>
              <Text style={[styles.detailValue, { color: textColor }]}>{product.reference}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: mutedColor }]}>Prix unitaire</Text>
              <Text style={[styles.detailValue, { color: textColor }]}>{formatAmount(product.prixVenteTTC)}</Text>
            </View>
          
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  productImage: {
    width: 84,
    height: 84,
    borderRadius: 16,
  },
  productTextBlock: {
    flex: 1,
    gap: 10,
  },
  productName: {
    fontSize: 20,
    fontWeight: '800',
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
  detailCard: {
    borderRadius: 20,
    padding: 16,
    gap: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
  },
});
