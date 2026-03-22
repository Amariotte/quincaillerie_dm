import { AppHeader } from '@/components/app-header';
import { DateRangePicker } from '@/components/date-range-picker';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchOperations } from '@/services/api-service';
import { getCacheData, OPERATIONS_LIST_CACHE_KEY, setCacheData } from '@/services/cache-service';
import { buildSousCompteFilters, formatAmount, formatDate, MAIN_ACCOUNT_FILTER, matchesDateRange, matchesSousCompteFilter, toComparableDate } from '@/tools/tools';
import { listOperations, typeMouvementColorMap, typeOperation } from '@/types/operations.type';
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

const statusFilters: Array<'Toutes' | typeOperation> = ['Toutes', 'Encaissement', 'Décaissement'];

export default function OperationsScreen() {
  const router = useRouter();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor, borderColor } = useAppTheme();
  const { userToken } = useAuthContext();

  const [operations, setOperations] = useState<listOperations>({ meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 }, data: [] });
  const [isLoading, setIsLoading] = useState(true);
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Liste des opérations" subtitle="Suivi des opérations" />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[styles.statLabel, { color: mutedColor }]}>Toutes les opérations</Text>
              <Text style={[styles.statCount, { color: textColor }]}>{totalCount} opération{totalCount > 1 ? 's' : ''}</Text>
              <Text style={[styles.statValue, { color: textColor }]}>{formatAmount(totalAmount)}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[styles.statLabel, { color: mutedColor }]}>Encaissements</Text>
              <Text style={[styles.statCount, { color: tintColor }]}>{unsettledCount} opération{unsettledCount > 1 ? 's' : ''}</Text>
              <Text style={[styles.statValue, { color: tintColor }]}>{formatAmount(unsettledAmount)}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[styles.statLabel, { color: mutedColor }]}>Décaissements</Text>
              <Text style={[styles.statCount, { color: '#dc2626' }]}>{overdueCount} opération{overdueCount > 1 ? 's' : ''}</Text>
              <Text style={[styles.statValue, { color: '#dc2626' }]}>{formatAmount(overdueAmount)}</Text>
            </View>
          </View>

          <View style={[styles.searchBox, { backgroundColor: cardColor, borderColor }]}> 
            <MaterialIcons name="search" size={20} color={mutedColor} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher une opération ou sous-compte"
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
              contentContainerStyle={styles.listBlock}
              ItemSeparatorComponent={() => (
                <View style={[styles.separator, { backgroundColor: borderColor, marginVertical: 8 }]} />
              )}
              renderItem={({ item: operation }) => {
                const statusColor = typeMouvementColorMap[operation.libType ?? 'Décaissement'];

                return (
                  <View style={[styles.invoiceCard, { backgroundColor: cardColor }]}> 
                    <View style={styles.invoiceTopRow}>
                      <View style={styles.invoiceRefBlock}>
                        <Text style={[styles.invoiceRef, { color: textColor }]}>{operation.codeOp}</Text>
                        <Text style={[styles.invoiceClient, { color: mutedColor }]}>{operation.nomSousCompte?.trim() ? operation.nomSousCompte : MAIN_ACCOUNT_FILTER}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}> 
                        <Text style={[styles.statusText, { color: statusColor }]}>{operation.libType}</Text>
                      </View>
                    </View>

                    <View style={styles.invoiceMetaRow}>
                      <View>
                        <Text style={[styles.metaLabel, { color: mutedColor }]}>Date</Text>
                        <Text style={[styles.metaValue, { color: textColor }]}>
                          {formatDate(operation.dateOp)}
                        </Text>
                      </View>
                      {operation.nomModePaiement && (
                        <View>
                          <Text style={[styles.metaLabel, { color: mutedColor }]}>Mode paiement</Text>
                          <Text style={[styles.metaValue, { color: textColor }]}>{operation.nomModePaiement}</Text>
                        </View>
                      )}
                      {operation.libRubrique && (
                        <View>
                          <Text style={[styles.metaLabel, { color: mutedColor }]}>Rubrique</Text>
                          <Text style={[styles.metaValue, { color: textColor }]}>{operation.libRubrique}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.invoiceBottomRow}>
                      <Text style={[styles.amountText, { color: textColor }]}>{formatAmount(operation.montantOp)}</Text>
                      <TouchableOpacity
                        onPress={() => router.push({
                          pathname: `/operations/${operation.id}`,
                          params: { operation: JSON.stringify(operation) }
                        } as never)}
                        style={[styles.actionButton, { backgroundColor: `${tintColor}18` }]}
                      >
                        <Text style={[styles.actionText, { color: tintColor }]}>Voir détail</Text>
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

