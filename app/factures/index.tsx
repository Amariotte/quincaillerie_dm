import { AppHeader } from '@/components/app-header';
import { DateRangePicker } from '@/components/date-range-picker';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchFactures } from '@/services/api-service';
import { FACTURES_LIST_CACHE_KEY, getCacheData, setCacheData } from '@/services/cache-service';
import { buildSousCompteFilters, formatAmount, MAIN_ACCOUNT_FILTER, matchesDateRange, matchesSousCompteFilter, toComparableDate } from '@/tools/tools';
import { factureStatus, listFactures, statusFactureColorMap } from '@/types/factures.type';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style.js';

const statusFilters: Array<'Toutes' | factureStatus> = ['Toutes', 'Soldée', 'Non soldée', 'Echue'];

export default function FacturesScreen() {
  const router = useRouter();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor, borderColor } = useAppTheme();
  const { userToken } = useAuthContext();

  const [factures, setFactures] = useState<listFactures>({ meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 }, data: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const [query, setQuery] = useState('');
  const [startDateQuery, setStartDateQuery] = useState('');
  const [endDateQuery, setEndDateQuery] = useState('');
  const [activeClient, setActiveClient] = useState('Tous');
  const [activeStatus, setActiveStatus] = useState<'Toutes' | factureStatus>('Toutes');

  const loadFactures = useCallback(async () => {
    if (!userToken) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setIsError(false);
      // Try to load from cache first
      const cachedData = await getCacheData<listFactures>(FACTURES_LIST_CACHE_KEY);
      if (cachedData && Array.isArray(cachedData.data) && cachedData.data.length > 0) {
        setFactures(cachedData);
      }

      // Fetch from API to update
      const data = await getfetchFactures(userToken);
      setFactures(data);
      setIsOfflineMode(false);
      await setCacheData(FACTURES_LIST_CACHE_KEY, data);
    } catch {
      setFactures({ meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 }, data: [] });
      setIsError(true);
      setIsOfflineMode(true);
    } finally {
      setIsLoading(false);
    }
  }, [userToken]);

  useEffect(() => {
    loadFactures();
  }, [loadFactures]);


  const sousCompteFilters = buildSousCompteFilters(
      factures.data,
      (facture) => facture.nomSousCompte,
    );

  const filteredInvoices = factures.data.filter((facture) => {
    const matchesQuery =
      facture.codeVente.toLowerCase().includes(query.toLowerCase()) ||
      facture.nomSousCompte?.toLowerCase().includes(query.toLowerCase());
    const issueComparable = toComparableDate(facture.dateVente);
    const matchesDate = matchesDateRange(issueComparable, startDateQuery, endDateQuery);
    const matchesClient = matchesSousCompteFilter(activeClient, facture.nomSousCompte);
    const matchesStatus = activeStatus === 'Toutes' || facture.status === activeStatus;

    return matchesQuery && matchesDate && matchesClient && matchesStatus;
  });

  const unsettledInvoices = filteredInvoices.filter((facture) => facture.soldeVente > 0);
  const overdueInvoices = filteredInvoices.filter((facture) => facture.status === 'Echue');


  const totalCount = filteredInvoices.length;
  const totalAmount = filteredInvoices.reduce((sum, facture) => sum + facture.totalNetPayer, 0);
  const unsettledCount = unsettledInvoices.length;
  const unsettledAmount = unsettledInvoices.reduce((sum, facture) => sum + facture.soldeVente, 0);
  const overdueCount = overdueInvoices.length;
  const overdueAmount = overdueInvoices.reduce((sum, facture) => sum + facture.soldeVente, 0);

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

          <DateRangePicker
            startDateValue={startDateQuery}
            endDateValue={endDateQuery}
            onChangeStartDate={setStartDateQuery}
            onChangeEndDate={setEndDateQuery}
            cardColor={cardColor}
            borderColor={borderColor}
            textColor={textColor}
            mutedColor={mutedColor}
            tintColor={tintColor}
          />

 {sousCompteFilters.length > 2 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {sousCompteFilters.map((sousCompte) => {
              const isActive = sousCompte === activeClient;

              return (
                <TouchableOpacity
                  key={sousCompte}
                  onPress={() => setActiveClient(sousCompte)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? tintColor : cardColor,
                      borderColor: isActive ? tintColor : borderColor,
                    },
                  ]}
                >
                  <Text style={[styles.filterLabel, { color: isActive ? '#ffffff' : textColor }]}>{sousCompte}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
 )}

{statusFilters.length > 2 && (
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
 )}
          {isLoading && (
            <ActivityIndicator size="large" color={tintColor} style={{ marginTop: 32 }} />
          )}

          {isError && !isLoading && (
            <EmptyResultsCard
              iconName="cloud-off"
              title="Erreur de chargement"
              subtitle="Impossible de récupérer les factures. Vérifiez votre connexion."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          )}

          {!isLoading && !isError && filteredInvoices.length === 0 && (
            <EmptyResultsCard
              iconName="inventory-2"
              title="Aucune facture trouvée"
              subtitle="Essayez une autre recherche ou filtre."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          )}

          {!isLoading && !isError && filteredInvoices.length > 0 && (
            <FlatList
              data={filteredInvoices}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              contentContainerStyle={styles.listBlock}
              renderItem={({ item: invoice }) => {
                const statusColor = statusFactureColorMap[invoice.status];

                return (
                  <View style={[styles.invoiceCard, { backgroundColor: cardColor }]}> 
                    <View style={styles.invoiceTopRow}>
                      <View style={styles.invoiceRefBlock}>
                        <Text style={[styles.invoiceRef, { color: textColor }]}>{invoice.codeVente}</Text>
                        <Text style={[styles.invoiceClient, { color: mutedColor }]}>{invoice.nomSousCompte ?? MAIN_ACCOUNT_FILTER}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}> 
                        <Text style={[styles.statusText, { color: statusColor }]}>{invoice.status}</Text>
                      </View>
                    </View>

                    <View style={styles.invoiceMetaRow}>
                      <View>
                        <Text style={[styles.metaLabel, { color: mutedColor }]}>Émise le</Text>
                        <Text style={[styles.metaValue, { color: textColor }]}>{new Date(invoice.dateVente).toLocaleDateString('fr-FR')}</Text>
                      </View>
                      <View>
                        <Text style={[styles.metaLabel, { color: mutedColor }]}>Échéance</Text>
                        <Text style={[styles.metaValue, { color: textColor }]}>{invoice.dateEchVente ? new Date(invoice.dateEchVente).toLocaleDateString('fr-FR') : '—'}</Text>
                      </View>
                      <View>
                        <Text style={[styles.metaLabel, { color: mutedColor }]}>Articles</Text>
                        <Text style={[styles.metaValue, { color: textColor }]}>{invoice.nbProduits}</Text>
                      </View>
                    </View>

                    <View style={styles.invoiceBottomRow}>
                      <Text style={[styles.amountText, { color: textColor }]}>{formatAmount(invoice.totalNetPayer)}</Text>
                      <TouchableOpacity
                        onPress={() => router.push(`/factures/${invoice.id}` as never)}
                        style={[styles.actionButton, { backgroundColor: `${tintColor}18` }]}
                      >
                        <Text style={[styles.actionText, { color: tintColor }]}>Voir détail</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

