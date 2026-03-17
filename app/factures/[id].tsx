import { AppHeader } from '@/components/app-header';
import { invoices } from '@/data/fakeDatas/factures';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const fallbackItems = [
  { id: '1', label: 'Ciment gris 50kg', quantity: 4, unitPrice: 18500 },
  { id: '2', label: 'Interrupteur double', quantity: 10, unitPrice: 3500 },
  { id: '3', label: 'Fer à béton 12mm', quantity: 8, unitPrice: 9600 },
  { id: '4', label: 'Peinture blanche 20L', quantity: 1, unitPrice: 42000 },
  { id: '5', label: 'Prise murale renforcée', quantity: 6, unitPrice: 4100 },
  { id: '6', label: 'Vernis satiné 5L', quantity: 2, unitPrice: 19500 },
];

const formatAmount = (amount: number) => `${amount.toLocaleString('fr-FR')} FCFA`;

export default function FactureDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1f2937' }, 'background');

  const invoice = invoices.find((item) => item.id === id);

  if (!invoice) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <AppHeader showBack title="Détail facture" subtitle="Document introuvable" />
            <View style={[styles.emptyCard, { backgroundColor: cardColor }]}> 
              <MaterialIcons name="error-outline" size={30} color="#dc2626" />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Facture introuvable</Text>
              <Text style={[styles.emptyText, { color: mutedColor }]}>Cette facture n'existe pas ou a été supprimée.</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const statusColor =
    invoice.status === 'Payée' ? '#16a34a' : invoice.status === 'En attente' ? '#f59e0b' : '#dc2626';

  const invoiceLines = fallbackItems.slice(0, invoice.itemsCount);
  const computedSubtotal = invoiceLines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const subtotal = computedSubtotal > 0 ? computedSubtotal : invoice.amount;
  const vat = Math.round(subtotal * 0.16);
  const total = subtotal + vat;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader showBack title="Détail facture" subtitle={invoice.reference} />

          <View style={[styles.headerCard, { backgroundColor: cardColor }]}> 
            <Text style={[styles.clientName, { color: textColor }]}>{invoice.client}</Text>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Émise le : {invoice.issueDate}</Text>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Échéance : {invoice.dueDate}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{invoice.status}</Text>
            </View>
          </View>

          <View style={[styles.linesCard, { backgroundColor: cardColor }]}> 
            <Text style={[styles.sectionTitle, { color: textColor }]}>Articles ({invoice.itemsCount})</Text>
            <View style={styles.linesBlock}>
              {invoiceLines.map((line) => (
                <View key={line.id} style={styles.lineRow}>
                  <View style={styles.lineLeft}>
                    <Text style={[styles.lineLabel, { color: textColor }]}>{line.label}</Text>
                    <Text style={[styles.lineMeta, { color: mutedColor }]}>{line.quantity} × {formatAmount(line.unitPrice)}</Text>
                  </View>
                  <Text style={[styles.lineTotal, { color: textColor }]}>{formatAmount(line.quantity * line.unitPrice)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: cardColor }]}> 
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: mutedColor }]}>Sous-total</Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>{formatAmount(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: mutedColor }]}>TVA (16%)</Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>{formatAmount(vat)}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: textColor }]}>Total à payer</Text>
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
    gap: 10,
  },
  clientName: { fontSize: 18, fontWeight: '800' },
  metaRow: { gap: 4 },
  metaLabel: { fontSize: 13 },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusText: { fontSize: 12, fontWeight: '800' },
  linesCard: {
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  linesBlock: { gap: 12 },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  lineLeft: { flex: 1 },
  lineLabel: { fontSize: 14, fontWeight: '700' },
  lineMeta: { fontSize: 12, marginTop: 4 },
  lineTotal: { fontSize: 14, fontWeight: '800' },
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
  emptyTitle: { fontSize: 17, fontWeight: '800' },
  emptyText: { fontSize: 13, textAlign: 'center' },
});
