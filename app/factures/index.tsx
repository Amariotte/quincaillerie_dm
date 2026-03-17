import { AppHeader } from '@/components/app-header';
import { invoices, type InvoiceStatus } from '@/data/fakeDatas/factures';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const statusFilters: Array<'Toutes' | InvoiceStatus> = ['Toutes', 'Payée', 'En attente', 'Impayée'];
const clientFilters = ['Tous', ...Array.from(new Set(invoices.map((invoice) => invoice.client)))];

const formatAmount = (amount: number) => `${amount.toLocaleString('fr-FR')} FCFA`;

const toComparableDate = (value: string) => {
  const parts = value.split('/');
  if (parts.length !== 3) {
    return null;
  }

  const [day, month, year] = parts;
  if (!day || !month || !year || day.length < 1 || month.length < 1 || year.length !== 4) {
    return null;
  }

  return `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`;
};

export default function FacturesScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1f2937' }, 'background');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#374151' }, 'text');
  const [query, setQuery] = useState('');
  const [startDateQuery, setStartDateQuery] = useState('');
  const [endDateQuery, setEndDateQuery] = useState('');
  const [activeClient, setActiveClient] = useState('Tous');
  const [activeStatus, setActiveStatus] = useState<'Toutes' | InvoiceStatus>('Toutes');

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesQuery =
      invoice.reference.toLowerCase().includes(query.toLowerCase()) ||
      invoice.client.toLowerCase().includes(query.toLowerCase());
    const issueComparable = toComparableDate(invoice.issueDate);
    const startComparable = startDateQuery.trim().length > 0 ? toComparableDate(startDateQuery.trim()) : null;
    const endComparable = endDateQuery.trim().length > 0 ? toComparableDate(endDateQuery.trim()) : null;
    const afterStart = !startComparable || !issueComparable || issueComparable >= startComparable;
    const beforeEnd = !endComparable || !issueComparable || issueComparable <= endComparable;
    const matchesDate = afterStart && beforeEnd;
    const matchesClient = activeClient === 'Tous' || invoice.client === activeClient;
    const matchesStatus = activeStatus === 'Toutes' || invoice.status === activeStatus;

    return matchesQuery && matchesDate && matchesClient && matchesStatus;
  });

  const paidCount = invoices.filter((invoice) => invoice.status === 'Payée').length;
  const pendingCount = invoices.filter((invoice) => invoice.status !== 'Payée').length;
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader showBack title="Liste des factures" subtitle="Suivi des factures et des échéances" />

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[styles.statLabel, { color: mutedColor }]}>Montant total</Text>
              <Text style={[styles.statValue, { color: textColor }]}>{formatAmount(totalAmount)}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[styles.statLabel, { color: mutedColor }]}>Factures payées</Text>
              <Text style={[styles.statValue, { color: tintColor }]}>{paidCount}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[styles.statLabel, { color: mutedColor }]}>À suivre</Text>
              <Text style={[styles.statValue, { color: '#f59e0b' }]}>{pendingCount}</Text>
            </View>
          </View>

          <View style={[styles.searchBox, { backgroundColor: cardColor, borderColor }]}> 
            <MaterialIcons name="search" size={20} color={mutedColor} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher une facture ou un client"
              placeholderTextColor={mutedColor}
              style={[styles.searchInput, { color: textColor }]}
            />
          </View>

          <View style={styles.periodRow}>
            <View style={[styles.periodInputBox, { backgroundColor: cardColor, borderColor }]}> 
              <MaterialIcons name="calendar-month" size={18} color={mutedColor} />
              <TextInput
                value={startDateQuery}
                onChangeText={setStartDateQuery}
                placeholder="Du (JJ/MM/AAAA)"
                placeholderTextColor={mutedColor}
                style={[styles.periodInput, { color: textColor }]}
              />
            </View>

            <View style={[styles.periodInputBox, { backgroundColor: cardColor, borderColor }]}> 
              <MaterialIcons name="event" size={18} color={mutedColor} />
              <TextInput
                value={endDateQuery}
                onChangeText={setEndDateQuery}
                placeholder="Au (JJ/MM/AAAA)"
                placeholderTextColor={mutedColor}
                style={[styles.periodInput, { color: textColor }]}
              />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {clientFilters.map((client) => {
              const isActive = client === activeClient;

              return (
                <TouchableOpacity
                  key={client}
                  onPress={() => setActiveClient(client)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? tintColor : cardColor,
                      borderColor: isActive ? tintColor : borderColor,
                    },
                  ]}
                >
                  <Text style={[styles.filterLabel, { color: isActive ? '#ffffff' : textColor }]}>{client}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {statusFilters.map((status) => {
              const isActive = status === activeStatus;

              return (
                <TouchableOpacity
                  key={status}
                  onPress={() => setActiveStatus(status)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? tintColor : cardColor,
                      borderColor: isActive ? tintColor : borderColor,
                    },
                  ]}
                >
                  <Text style={[styles.filterLabel, { color: isActive ? '#ffffff' : textColor }]}>{status}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.listBlock}>
            {filteredInvoices.map((invoice) => {
              const statusColor =
                invoice.status === 'Payée' ? '#16a34a' : invoice.status === 'En attente' ? '#f59e0b' : '#dc2626';

              return (
                <View key={invoice.id} style={[styles.invoiceCard, { backgroundColor: cardColor }]}> 
                  <View style={styles.invoiceTopRow}>
                    <View style={styles.invoiceRefBlock}>
                      <Text style={[styles.invoiceRef, { color: textColor }]}>{invoice.reference}</Text>
                      <Text style={[styles.invoiceClient, { color: mutedColor }]}>{invoice.client}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}> 
                      <Text style={[styles.statusText, { color: statusColor }]}>{invoice.status}</Text>
                    </View>
                  </View>

                  <View style={styles.invoiceMetaRow}>
                    <View>
                      <Text style={[styles.metaLabel, { color: mutedColor }]}>Émise le</Text>
                      <Text style={[styles.metaValue, { color: textColor }]}>{invoice.issueDate}</Text>
                    </View>
                    <View>
                      <Text style={[styles.metaLabel, { color: mutedColor }]}>Échéance</Text>
                      <Text style={[styles.metaValue, { color: textColor }]}>{invoice.dueDate}</Text>
                    </View>
                    <View>
                      <Text style={[styles.metaLabel, { color: mutedColor }]}>Articles</Text>
                      <Text style={[styles.metaValue, { color: textColor }]}>{invoice.itemsCount}</Text>
                    </View>
                  </View>

                  <View style={styles.invoiceBottomRow}>
                    <Text style={[styles.amountText, { color: textColor }]}>{formatAmount(invoice.amount)}</Text>
                    <TouchableOpacity
                      onPress={() => router.push(`/factures/${invoice.id}` as never)}
                      style={[styles.actionButton, { backgroundColor: `${tintColor}18` }]}
                    >
                      <Text style={[styles.actionText, { color: tintColor }]}>Voir détail</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {filteredInvoices.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: cardColor }]}> 
                <MaterialIcons name="receipt-long" size={28} color={mutedColor} />
                <Text style={[styles.emptyTitle, { color: textColor }]}>Aucune facture trouvée</Text>
                <Text style={[styles.emptyText, { color: mutedColor }]}>Ajustez votre recherche ou le filtre de statut.</Text>
              </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTextBlock: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  pageSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  statsRow: {
    gap: 12,
  },
  statCard: {
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statLabel: {
    fontSize: 13,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
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
  periodRow: {
    flexDirection: 'row',
    gap: 10,
  },
  periodInputBox: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  periodInput: {
    flex: 1,
    fontSize: 14,
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
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  listBlock: {
    gap: 12,
  },
  invoiceCard: {
    borderRadius: 20,
    padding: 16,
    gap: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  invoiceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  invoiceRefBlock: {
    flex: 1,
  },
  invoiceRef: {
    fontSize: 16,
    fontWeight: '800',
  },
  invoiceClient: {
    fontSize: 13,
    marginTop: 4,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  invoiceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaLabel: {
    fontSize: 12,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  invoiceBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '900',
  },
  actionButton: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '800',
  },
  emptyCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
