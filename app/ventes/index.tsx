import { AppHeader } from '@/components/app-header';
import { DateRangePicker } from '@/components/date-range-picker';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { InfiniteListFooter } from '@/components/infinite-list-footer';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { usePaginatedCachedResource } from '@/hooks/use-paginated-cached-resource';
import { getfetchFactures } from '@/services/api-service';
import { FACTURES_LIST_CACHE_KEY } from '@/services/cache-service';
import { sharedStyles } from '@/styles/shared.js';
import { buildSousCompteFilters, formatAmount, formatDate, MAIN_ACCOUNT_FILTER, matchesDateRange, matchesSousCompteFilter, toComparableDate } from '@/tools/tools';
import { factureStatus, listFactures, statusFactureColorMap } from '@/types/factures.type';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const statusFilters: ('Toutes' | factureStatus)[] = ['Toutes', 'Soldée', 'Non soldée', 'Echue'];

export default function FacturesScreen() {
  const router = useRouter();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor, borderColor } = useAppTheme();

  const initialFactures = useMemo<listFactures>(
      () => ({
        meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 },
        data: [],
      }),
      [],
    );

const { userToken } = useAuthContext();
  const {
    data: factures,
    isLoading,
    isRefreshing,
    isLoadingMore,
    isError,
    refresh: handleRefresh,
    loadMore,
    hasNextPage,
  } = usePaginatedCachedResource<listFactures['data'][number], listFactures>({
    cacheKey: FACTURES_LIST_CACHE_KEY,
    initialData: initialFactures,
    enabled: Boolean(userToken),
    fetchPage: async (page, size) => getfetchFactures(userToken ?? "", { page, size }),
    getItemKey: (item) => item.id,
    hasUsableCachedData: (cachedData) =>
      Boolean(
        cachedData &&
        Array.isArray(cachedData.data) &&
        cachedData.data.length > 0,
      ),
  });


  const [query, setQuery] = useState('');
  const [startDateQuery, setStartDateQuery] = useState('');
  const [endDateQuery, setEndDateQuery] = useState('');
  const [activeClient, setActiveClient] = useState('Tous');
  const [activeStatus, setActiveStatus] = useState<'Toutes' | factureStatus>('Toutes');

 

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
  const showInitialLoader = isLoading && factures.data.length === 0;
  const showErrorState = isError && factures.data.length === 0;

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Liste des ventes" subtitle="Suivi des ventes et des échéances" />
      </View>
      <FlatList
        data={showInitialLoader || showErrorState ? [] : filteredInvoices}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item: invoice }) => {
          const statusColor = statusFactureColorMap[invoice.status];

          return (
            <View style={[sharedStyles.invoiceCard, { backgroundColor: cardColor }]}> 
              <View style={sharedStyles.invoiceTopRow}>
                <View style={sharedStyles.invoiceRefBlock}>
                  <Text style={[sharedStyles.invoiceRef, { color: textColor }]}>{invoice.codeVente}</Text>
                  <Text style={[sharedStyles.invoiceClient, { color: mutedColor }]}>{invoice.nomSousCompte?.trim() ? invoice.nomSousCompte : MAIN_ACCOUNT_FILTER}</Text>
                </View>
                <View style={[sharedStyles.statusBadge, { backgroundColor: `${statusColor}18` }]}> 
                  <Text style={[sharedStyles.statusText, { color: statusColor }]}>{invoice.status}</Text>
                </View>
              </View>

              <View style={sharedStyles.invoiceMetaRow}>
                <View>
                  <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Date</Text>
                  <Text style={[sharedStyles.metaValue, { color: textColor }]}>
                    {formatDate(invoice.dateVente)}
                  </Text>
                </View>
                <View>
                  <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Échéance</Text>
                  <Text style={[sharedStyles.metaValue, { color: textColor }]}>{invoice.dateEchVente ? formatDate(invoice.dateEchVente) : '—'}</Text>
                </View>
                <View>
                  <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Articles</Text>
                  <Text style={[sharedStyles.metaValue, { color: textColor }]}>{invoice.nbProduits}</Text>
                </View>
              </View>

              <View style={sharedStyles.invoiceBottomRow}>
                <Text style={[sharedStyles.amountText, { color: textColor }]}>{formatAmount(invoice.totalNetPayer)}</Text>
                <TouchableOpacity
                  onPress={() => router.push(`/ventes/${invoice.id}` as never)}
                  style={[sharedStyles.actionButton, { backgroundColor: `${tintColor}18` }]}
                >
                  <Text style={[sharedStyles.actionText, { color: tintColor }]}>Voir détail</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        contentContainerStyle={[sharedStyles.scrollContent, { paddingHorizontal: 18, paddingTop: 12 }]}
        ListHeaderComponent={
          <View style={{ gap: 16 }}>
          <View style={sharedStyles.statsRow}>
            <View style={[sharedStyles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[sharedStyles.statLabel, { color: mutedColor }]}>Toutes les ventes</Text>
              <Text style={[sharedStyles.statCount, { color: textColor }]}>{totalCount} vente{totalCount > 1 ? 's' : ''}</Text>
              <Text style={[sharedStyles.statValue, { color: textColor }]}>{formatAmount(totalAmount)}</Text>
            </View>
            <View style={[sharedStyles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[sharedStyles.statLabel, { color: mutedColor }]}>Ventes non soldées</Text>
              <Text style={[sharedStyles.statCount, { color: tintColor }]}>{unsettledCount} vente{unsettledCount > 1 ? 's' : ''}</Text>
              <Text style={[sharedStyles.statValue, { color: tintColor }]}>{formatAmount(unsettledAmount)}</Text>
            </View>
            <View style={[sharedStyles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[sharedStyles.statLabel, { color: mutedColor }]}>Ventes échues</Text>
              <Text style={[sharedStyles.statCount, { color: '#dc2626' }]}>{overdueCount} vente{overdueCount > 1 ? 's' : ''}</Text>
              <Text style={[sharedStyles.statValue, { color: '#dc2626' }]}>{formatAmount(overdueAmount)}</Text>
            </View>
          </View>

          <View style={[sharedStyles.searchBox, { backgroundColor: cardColor, borderColor }]}> 
            <MaterialIcons name="search" size={20} color={mutedColor} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher une vente ou un sous-compte"
              placeholderTextColor={mutedColor}
              style={[sharedStyles.searchInput, { color: textColor }]}
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={sharedStyles.filterRow}>
            {sousCompteFilters.map((sousCompte) => {
              const isActive = sousCompte === activeClient;

              return (
                <TouchableOpacity
                  key={sousCompte}
                  onPress={() => setActiveClient(sousCompte)}
                  style={[
                    sharedStyles.filterChip,
                    {
                      backgroundColor: isActive ? tintColor : cardColor,
                      borderColor: isActive ? tintColor : borderColor,
                    },
                  ]}
                >
                  <Text style={[sharedStyles.filterLabel, { color: isActive ? '#ffffff' : textColor }]}>{sousCompte}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
 )}

{statusFilters.length > 2 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={sharedStyles.filterRow}>
            {statusFilters.map((status) => {
              const isActive = status === activeStatus;

              return (
                <TouchableOpacity
                  key={status}
                  onPress={() => setActiveStatus(status)}
                  style={[
                    sharedStyles.filterChip,
                    {
                      backgroundColor: isActive ? tintColor : cardColor,
                      borderColor: isActive ? tintColor : borderColor,
                    },
                  ]}
                >
                  <Text style={[sharedStyles.filterLabel, { color: isActive ? '#ffffff' : textColor }]}>{status}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
 )}
          {showInitialLoader ? (
            <ActivityIndicator size="large" color={tintColor} style={{ marginTop: 32 }} />
          ) : null}

          {showErrorState ? (
            <EmptyResultsCard
              iconName="cloud-off"
              title="Erreur de chargement"
              subtitle="Impossible de récupérer les ventes. Vérifiez votre connexion."
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
              title="Aucune vente trouvée"
              subtitle="Essayez une autre recherche ou filtre."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListFooterComponent={
          filteredInvoices.length > 0 ? (
            <InfiniteListFooter isLoadingMore={isLoadingMore} tintColor={tintColor} mutedColor={mutedColor} />
          ) : null
        }
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={tintColor} />}
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

