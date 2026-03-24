import { AppHeader } from '@/components/app-header';
import { DateRangePicker } from '@/components/date-range-picker';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchOperations } from '@/services/api-service';
import { getCacheData, OPERATIONS_LIST_CACHE_KEY, setCacheData } from '@/services/cache-service';
import { sharedStyles } from '@/styles/shared';
import { buildSousCompteFilters, formatAmount, formatDate, MAIN_ACCOUNT_FILTER, matchesDateRange, matchesSousCompteFilter, toComparableDate } from '@/tools/tools';
import { listOperations, typeMouvementColorMap, typeOperation } from '@/types/operations.type';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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


const statusFilters: Array<'Toutes' | typeOperation> = ['Toutes', 'Encaissement', 'Décaissement'];

export default function OperationsScreen() {
  const router = useRouter();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor, borderColor } = useAppTheme();
  const { userToken } = useAuthContext();

  const [operations, setOperations] = useState<listOperations>({ meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 }, data: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const [query, setQuery] = useState('');
  const [startDateQuery, setStartDateQuery] = useState('');
  const [endDateQuery, setEndDateQuery] = useState('');
  const [activeClient, setActiveClient] = useState('Tous');
  const [activeStatus, setActiveStatus] = useState<'Toutes' | typeOperation>('Toutes');

  const loadOperations = useCallback(async () => {
    if (!userToken) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setIsError(false);
      
      // Try to load from cache first
      const cachedData = await getCacheData<listOperations>(OPERATIONS_LIST_CACHE_KEY);
      if (cachedData && Array.isArray(cachedData.data) && cachedData.data.length > 0) {
        setOperations(cachedData);
      }

      // Fetch from API to update
      const data = await getfetchOperations(userToken);
      setOperations(data);
      setIsOfflineMode(false);
      await setCacheData(OPERATIONS_LIST_CACHE_KEY, data);
    } catch {
      setOperations({ meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 }, data: [] });
      setIsError(true);
      setIsOfflineMode(true);
    } finally {
      setIsLoading(false);
    }
  }, [userToken]);

  useEffect(() => {
    loadOperations();
  }, [loadOperations]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (!userToken) {
        setIsRefreshing(false);
        return;
      }
      const data = await getfetchOperations(userToken);
      setOperations(data);
      setIsOfflineMode(false);
      await setCacheData(OPERATIONS_LIST_CACHE_KEY, data);
      setIsError(false);
    } catch {
      setIsError(true);
      setIsOfflineMode(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [userToken]);

  const sousCompteFilters = buildSousCompteFilters(
    operations.data,
    (operation) => operation.nomSousCompte,
  );

  const filteredOperations = operations.data.filter((operation) => {
    const matchesQuery =
      operation.codeOp.toLowerCase().includes(query.toLowerCase()) ||
      operation.nomSousCompte?.toLowerCase().includes(query.toLowerCase());
      
    const issueComparable = toComparableDate(operation.dateOp);
    const matchesDate = matchesDateRange(issueComparable, startDateQuery, endDateQuery);
    const matchesClient = matchesSousCompteFilter(activeClient, operation.nomSousCompte);
    const matchesStatus = activeStatus === 'Toutes' || operation.libType === activeStatus;

    return matchesQuery && matchesDate && matchesClient && matchesStatus;
  });

  const encaissements = filteredOperations.filter((operation) => operation.libType == "Encaissement");
  const decaissements = filteredOperations.filter((operation) => operation.libType == "Décaissement");


  const totalCount = filteredOperations.length;
  const totalAmount = filteredOperations.reduce((sum, operation) => sum + operation.montantOp, 0);
  
  const unsettledCount = encaissements.length;
  const unsettledAmount = encaissements.reduce((sum, operation) => sum + operation.montantOp, 0);
  const overdueCount = decaissements.length;
  const overdueAmount = decaissements.reduce((sum, operation) => sum + operation.montantOp, 0);

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Liste des opérations" subtitle="Suivi des opérations" />
      </View>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={tintColor} />}>
        <View style={sharedStyles.container}>
          <View style={sharedStyles.statsRow}>
            <View style={[sharedStyles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[sharedStyles.statLabel, { color: mutedColor }]}>Toutes les opérations</Text>
              <Text style={[sharedStyles.statCount, { color: textColor }]}>{totalCount} opération{totalCount > 1 ? 's' : ''}</Text>
              <Text style={[sharedStyles.statValue, { color: textColor }]}>{formatAmount(totalAmount)}</Text>
            </View>
            <View style={[sharedStyles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[sharedStyles.statLabel, { color: mutedColor }]}>Encaissements</Text>
              <Text style={[sharedStyles.statCount, { color: tintColor }]}>{unsettledCount} opération{unsettledCount > 1 ? 's' : ''}</Text>
              <Text style={[sharedStyles.statValue, { color: tintColor }]}>{formatAmount(unsettledAmount)}</Text>
            </View>
            <View style={[sharedStyles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[sharedStyles.statLabel, { color: mutedColor }]}>Décaissements</Text>
              <Text style={[sharedStyles.statCount, { color: '#dc2626' }]}>{overdueCount} opération{overdueCount > 1 ? 's' : ''}</Text>
              <Text style={[sharedStyles.statValue, { color: '#dc2626' }]}>{formatAmount(overdueAmount)}</Text>
            </View>
          </View>

          <View style={[sharedStyles.searchBox, { backgroundColor: cardColor, borderColor }]}> 
            <MaterialIcons name="search" size={20} color={mutedColor} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher une opération ou sous-compte"
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
          {isLoading && (
            <ActivityIndicator size="large" color={tintColor} style={{ marginTop: 32 }} />
          )}

          {isError && !isLoading && (
            <EmptyResultsCard
              iconName="cloud-off"
              title="Erreur de chargement"
              subtitle="Impossible de récupérer les opérations. Vérifiez votre connexion."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          )}

          {!isLoading && !isError && (
          filteredOperations.length === 0 ? (
            <EmptyResultsCard
              iconName="inventory-2"
              title="Aucune opération trouvée"
              subtitle="Essayez une autre recherche ou filtre."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          ) : (
            <FlatList
              data={filteredOperations}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              contentContainerStyle={sharedStyles.listBlock}
              ItemSeparatorComponent={() => (
                <View style={[sharedStyles.separator, { backgroundColor: borderColor, marginVertical: 8 }]} />
              )}
              renderItem={({ item: operation }) => {
                const statusColor = typeMouvementColorMap[operation.libType ?? 'Décaissement'];

                return (
                  <View style={[sharedStyles.invoiceCard, { backgroundColor: cardColor }]}> 
                    <View style={sharedStyles.invoiceTopRow}>
                      <View style={sharedStyles.invoiceRefBlock}>
                        <Text style={[sharedStyles.invoiceRef, { color: textColor }]}>{operation.codeOp}</Text>
                        <Text style={[sharedStyles.invoiceClient, { color: mutedColor }]}>{operation.nomSousCompte?.trim() ? operation.nomSousCompte : MAIN_ACCOUNT_FILTER}</Text>
                      </View>
                      <View style={[sharedStyles.statusBadge, { backgroundColor: `${statusColor}18` }]}> 
                        <Text style={[sharedStyles.statusText, { color: statusColor }]}>{operation.libType}</Text>
                      </View>
                    </View>
                    
  <View style={sharedStyles.invoiceMetaRow}>
                      <View>
                          <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Rubrique</Text>
                          <Text style={[sharedStyles.metaValue, { color: textColor }]}>{operation.libRubrique}</Text>
                        </View>
                      
                    </View>
                    <View style={sharedStyles.invoiceMetaRow}>
                      <View>
                        <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Date</Text>
                        <Text style={[sharedStyles.metaValue, { color: textColor }]}>
                          {formatDate(operation.dateOp)}
                        </Text>
                      </View>
                      {operation.nomModePaiement && (
                        <View>
                          <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Mode paiement</Text>
                          <Text style={[sharedStyles.metaValue, { color: textColor }]}>{operation.nomModePaiement}</Text>
                        </View>
                      )}
                    </View>

                    <View style={sharedStyles.invoiceBottomRow}>
                      <Text style={[sharedStyles.amountText, { color: textColor }]}>{formatAmount(operation.montantOp)}</Text>
                      <TouchableOpacity
                        onPress={() => router.push({
                          pathname: `/operations/${operation.id}`,
                          params: { operation: JSON.stringify(operation) }
                        } as never)}
                        style={[sharedStyles.actionButton, { backgroundColor: `${tintColor}18` }]}
                      >
                        <Text style={[sharedStyles.actionText, { color: tintColor }]}>Voir détail</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

