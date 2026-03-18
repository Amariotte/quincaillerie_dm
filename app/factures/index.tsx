import { AppHeader } from '@/components/app-header';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { factures } from '@/data/fakeDatas/factures.fake';
import { useAppTheme } from '@/hooks/use-app-theme';
import { formatAmount, toComparableDate } from '@/tools/tools';
import { factureStatus, statusFactureColorMap } from '@/types/factures.type';
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

const statusFilters: Array<'Toutes' | factureStatus> = ['Toutes', 'Soldée', 'Non soldée', 'Impayée'];
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

export default function FacturesScreen() {
  const router = useRouter();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor, borderColor } = useAppTheme();
  const [query, setQuery] = useState('');
  const [startDateQuery, setStartDateQuery] = useState('');
  const [endDateQuery, setEndDateQuery] = useState('');
  const [activeClient, setActiveClient] = useState('Tous');
  const [activeStatus, setActiveStatus] = useState<'Toutes' | factureStatus>('Toutes');

  const today = new Date();
  const todayComparable = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

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

  const unsettledInvoices = filteredInvoices.filter((facture) => facture.status !== 'Soldée');
  const overdueInvoices = unsettledInvoices.filter((facture) => {
    const dueComparable = facture.dateEcheanceVente ? toComparableDate(facture.dateEcheanceVente) : null;
    return !!dueComparable && dueComparable < todayComparable;
  });

  const totalCount = filteredInvoices.length;
  const totalAmount = filteredInvoices.reduce((sum, facture) => sum + facture.montant, 0);
  const unsettledCount = unsettledInvoices.length;
  const unsettledAmount = unsettledInvoices.reduce((sum, facture) => sum + facture.montant, 0);
  const overdueCount = overdueInvoices.length;
  const overdueAmount = overdueInvoices.reduce((sum, facture) => sum + facture.montant, 0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader showBack title="Liste des factures" subtitle="Suivi des factures et des échéances" />

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[styles.statLabel, { color: mutedColor }]}>Toutes les factures</Text>
              <Text style={[styles.statCount, { color: textColor }]}>{totalCount} facture{totalCount > 1 ? 's' : ''}</Text>
              <Text style={[styles.statValue, { color: textColor }]}>{formatAmount(totalAmount)}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[styles.statLabel, { color: mutedColor }]}>Factures non soldées</Text>
              <Text style={[styles.statCount, { color: tintColor }]}>{unsettledCount} facture{unsettledCount > 1 ? 's' : ''}</Text>
              <Text style={[styles.statValue, { color: tintColor }]}>{formatAmount(unsettledAmount)}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[styles.statLabel, { color: mutedColor }]}>Factures échues</Text>
              <Text style={[styles.statCount, { color: '#dc2626' }]}>{overdueCount} facture{overdueCount > 1 ? 's' : ''}</Text>
              <Text style={[styles.statValue, { color: '#dc2626' }]}>{formatAmount(overdueAmount)}</Text>
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

             const statusColor = statusFactureColorMap[invoice.status];
              
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
                          <EmptyResultsCard
                            iconName="inventory-2"
                            title="Aucune facture trouvée"
                            subtitle="Essayez une autre recherche ou filtre."
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

