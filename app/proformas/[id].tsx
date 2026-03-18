import { AppHeader } from '@/components/app-header';
import { proformaProductLines, proformasData } from '@/data/fakeDatas/modules.fake';
import { products } from '@/data/fakeDatas/produits.fake';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatAmount } from '@/tools/tools';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const computeLinePricing = ({
  quantity,
  freeQuantity,
  unitPrice,
  discountRate,
  discountAmount,
  vatRate,
}: {
  quantity: number;
  freeQuantity: number;
  unitPrice: number;
  discountRate: number;
  discountAmount: number;
  vatRate: number;
}) => {
  const billableQuantity = Math.max(0, quantity - freeQuantity);
  const gross = billableQuantity * unitPrice;
  const rateDiscount = Math.round((gross * discountRate) / 100);
  const totalDiscount = Math.min(gross, Math.max(0, discountAmount) + Math.max(0, rateDiscount));
  const net = Math.max(0, gross - totalDiscount);
  const vat = Math.round((net * vatRate) / 100);
  const total = net + vat;

  return { billableQuantity, totalDiscount, net, vat, total };
};

export default function ProformaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = proformasData.find((entry) => entry.id === id);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1f2937' }, 'background');
  const lines = item ? proformaProductLines[item.id] ?? [] : [];

  const detailedLines = lines
    .map((line) => {
      const product = products.find((entry) => entry.id === line.productId);
      if (!product) {
        return null;
      }

      return {
        product,
        quantity: line.quantity,
        freeQuantity: line.freeQuantity ?? 0,
        discountRate: line.discountRate ?? 0,
        discountAmount: line.discountAmount ?? 0,
        vatRate: line.vatRate ?? 16,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const subtotal = detailedLines.reduce((sum, line) => {
    const pricing = computeLinePricing({
      quantity: line.quantity,
      freeQuantity: line.freeQuantity,
      unitPrice: line.product.price,
      discountRate: line.discountRate,
      discountAmount: line.discountAmount,
      vatRate: line.vatRate,
    });

    return sum + pricing.net;
  }, 0);
  const tax = detailedLines.reduce((sum, line) => {
    const pricing = computeLinePricing({
      quantity: line.quantity,
      freeQuantity: line.freeQuantity,
      unitPrice: line.product.price,
      discountRate: line.discountRate,
      discountAmount: line.discountAmount,
      vatRate: line.vatRate,
    });

    return sum + pricing.vat;
  }, 0);
  const total = subtotal + tax;

  if (!item) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <AppHeader showBack title="Détail proforma" subtitle="Document introuvable" />
            <View style={[styles.emptyCard, { backgroundColor: cardColor }]}> 
              <MaterialIcons name="error-outline" size={28} color="#dc2626" />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Proforma introuvable</Text>
              <Text style={[styles.emptyText, { color: mutedColor }]}>Cette proforma n'existe pas ou n'est plus disponible.</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader showBack title="Détail proforma" subtitle={item.title} />

          <View style={[styles.headerCard, { backgroundColor: cardColor }]}> 
            <Text style={[styles.clientName, { color: textColor }]}>{item.subtitle}</Text>
            <Text style={[styles.metaText, { color: mutedColor }]}>Date : {item.date}</Text>
            <Text style={[styles.metaText, { color: mutedColor }]}>Statut : {item.status}</Text>
          </View>

          <View style={[styles.productsCard, { backgroundColor: cardColor }]}> 
            <Text style={[styles.sectionTitle, { color: textColor }]}>Produits de la proforma</Text>

            {detailedLines.map((line) => {
              const pricing = computeLinePricing({
                quantity: line.quantity,
                freeQuantity: line.freeQuantity,
                unitPrice: line.product.price,
                discountRate: line.discountRate,
                discountAmount: line.discountAmount,
                vatRate: line.vatRate,
              });

              return (
                <View key={line.product.id} style={styles.productRow}>
                  <View style={styles.productLeft}>
                    <Text style={[styles.productName, { color: textColor }]}>{line.product.name}</Text>
                    <Text style={[styles.productMeta, { color: mutedColor }]}>Qté: {line.quantity} · Gratuite: {line.freeQuantity} · Facturée: {pricing.billableQuantity}</Text>
                    <Text style={[styles.productMeta, { color: mutedColor }]}>PU: {formatAmount(line.product.price)} · Remise: {line.discountRate}% + {formatAmount(line.discountAmount)}</Text>
                    <Text style={[styles.productMeta, { color: mutedColor }]}>TVA: {line.vatRate}% ({formatAmount(pricing.vat)})</Text>
                  </View>
                  <Text style={[styles.productTotal, { color: textColor }]}>{formatAmount(pricing.total)}</Text>
                </View>
              );
            })}

            {detailedLines.length === 0 ? (
              <View style={styles.emptyProducts}>
                <MaterialIcons name="inventory-2" size={22} color={mutedColor} />
                <Text style={[styles.emptyProductsText, { color: mutedColor }]}>Aucun produit lié à cette proforma.</Text>
              </View>
            ) : null}
          </View>

          <View style={[styles.summaryCard, { backgroundColor: cardColor }]}> 
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: mutedColor }]}>Sous-total</Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>{formatAmount(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: mutedColor }]}>TVA (lignes)</Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>{formatAmount(tax)}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: textColor }]}>Total</Text>
              <Text style={[styles.totalValue, { color: tintColor }]}>{formatAmount(total)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  container: { paddingHorizontal: 18, paddingTop: 12, gap: 16 },
  headerCard: {
    borderRadius: 20,
    padding: 16,
    gap: 6,
  },
  clientName: { fontSize: 17, fontWeight: '800' },
  metaText: { fontSize: 13 },
  productsCard: {
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  productLeft: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '700' },
  productMeta: { fontSize: 12, marginTop: 4 },
  productTotal: { fontSize: 14, fontWeight: '800' },
  emptyProducts: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  emptyProductsText: { fontSize: 13, textAlign: 'center' },
  summaryCard: {
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 15, fontWeight: '700' },
  separator: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 4 },
  totalLabel: { fontSize: 16, fontWeight: '800' },
  totalValue: { fontSize: 18, fontWeight: '900' },
  emptyCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptyText: { fontSize: 13, textAlign: 'center' },
});
