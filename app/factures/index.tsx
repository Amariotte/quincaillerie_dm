import { AppHeader } from '@/components/app-header';
import { factures } from '@/data/fakeDatas/factures.fake';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatAmount } from '@/tools/tools';
import { factureStatus } from '@/types/factures.type.js';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style.js';

const statusFilters: Array<'Toutes' | factureStatus> = ['Toutes', 'Payée', 'En attente', 'Impayée'];
const clientFilters = [
  'Tous',
  ...Array.from(
    new Set(
      factures
        .map((facture) => facture.nomSousCompte)
        .filter((client): client is string => typeof client === 'string' && client.trim().length > 0)
    )
  ),
];


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
  const [activeStatus, setActiveStatus] = useState<'Toutes' | factureStatus>('Toutes');

  const filteredInvoices = factures.filter((facture) => {
    const matchesQuery =
      facture.codeVente.toLowerCase().includes(query.toLowerCase()) ||
      facture.nomSousCompte?.toLowerCase().includes(query.toLowerCase());
    const issueComparable = toComparableDate(facture.dateVente);
    const startComparable = startDateQuery.trim().length > 0 ? toComparableDate(startDateQuery.trim()) : null;
    const endComparable = endDateQuery.trim().length > 0 ? toComparableDate(endDateQuery.trim()) : null;
    const afterStart = !startComparable || !issueComparable || issueComparable >= startComparable;
    const beforeEnd = !endComparable || !issueComparable || issueComparable <= endComparable;
    const matchesDate = afterStart && beforeEnd;
    const matchesClient = activeClient === 'Tous' || facture.nomSousCompte === activeClient;
    const matchesStatus = activeStatus === 'Toutes' || facture.status === activeStatus;

    return matchesQuery && matchesDate && matchesClient && matchesStatus;
  });

  const paidCount = filteredInvoices.filter((facture) => facture.status === 'Payée').length;
  const pendingCount = filteredInvoices.filter((facture) => facture.status !== 'Payée').length;
  const totalAmount = filteredInvoices.reduce((sum, facture) => sum + facture.montant, 0);

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
                      <Text style={[styles.invoiceRef, { color: textColor }]}>{invoice.codeVente}</Text>
                      <Text style={[styles.invoiceClient, { color: mutedColor }]}>{invoice.nomSousCompte}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}> 
                      <Text style={[styles.statusText, { color: statusColor }]}>{invoice.status}</Text>
                    </View>
                  </View>

                  <View style={styles.invoiceMetaRow}>
                    <View>
                      <Text style={[styles.metaLabel, { color: mutedColor }]}>Émise le</Text>
                      <Text style={[styles.metaValue, { color: textColor }]}>{invoice.dateVente}</Text>
                    </View>
                    <View>
                      <Text style={[styles.metaLabel, { color: mutedColor }]}>Échéance</Text>
                      <Text style={[styles.metaValue, { color: textColor }]}>{invoice.dateEcheanceVente}</Text>
                    </View>
                    <View>
                      <Text style={[styles.metaLabel, { color: mutedColor }]}>Articles</Text>
                      <Text style={[styles.metaValue, { color: textColor }]}>{invoice.nbProduits}</Text>
                    </View>
                  </View>

                  <View style={styles.invoiceBottomRow}>
                    <Text style={[styles.amountText, { color: textColor }]}>{formatAmount(invoice.montant)}</Text>
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

