import { AppHeader } from '@/components/app-header';
import { DateRangePicker } from '@/components/date-range-picker';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchCommissions } from '@/services/api-service';
import { COMMISSIONS_LIST_CACHE_KEY, getCacheData, setCacheData } from '@/services/cache-service';
import { sharedStyles } from '@/styles/shared';
import { buildSousCompteFilters, formatAmount, formatDate, MAIN_ACCOUNT_FILTER, matchesDateRange, matchesSousCompteFilter, toComparableDate } from '@/tools/tools';
import { listCommissions } from '@/types/commissions.type';
import { factureStatus } from '@/types/factures.type';
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
import styles from './style';


export default function CommissionsScreen() {
  const router = useRouter();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor, borderColor } = useAppTheme();
  const { userToken } = useAuthContext();

  const [commissions, setCommissions] = useState<listCommissions>({ meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 }, data: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const [query, setQuery] = useState('');
  const [startDateQuery, setStartDateQuery] = useState('');
  const [endDateQuery, setEndDateQuery] = useState('');
  const [activeClient, setActiveClient] = useState('Tous');
  const [activeStatus, setActiveStatus] = useState<'Toutes' | factureStatus>('Toutes');

  const loadCommissions = useCallback(async () => {
    if (!userToken) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setIsError(false);
      
      // Try to load from cache first
      const cachedData = await getCacheData<listCommissions>(COMMISSIONS_LIST_CACHE_KEY);
      if (cachedData && Array.isArray(cachedData.data) && cachedData.data.length > 0) {
        setCommissions(cachedData);
      }

      // Fetch from API to update
      const data = await getfetchCommissions(userToken);
      setCommissions(data);
      setIsOfflineMode(false);
      await setCacheData(COMMISSIONS_LIST_CACHE_KEY, data);
    } catch {
      setCommissions({ meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 }, data: [] });
      setIsError(true);
      setIsOfflineMode(true);
    } finally {
      setIsLoading(false);
    }
  }, [userToken]);

  useEffect(() => {
    loadCommissions();
  }, [loadCommissions]);

  const sousCompteFilters = buildSousCompteFilters(
        commissions.data,
        (commission) => commission.nomSousCompte,
      );

  const filteredCommissions = commissions.data.filter((commission) => {
    const matchesQuery =
      commission.codeCom.toLowerCase().includes(query.toLowerCase()) ||
      commission.nomSousCompte?.toLowerCase().includes(query.toLowerCase());
    const issueComparable = toComparableDate(commission.dateCom);

   
     const matchesDate = matchesDateRange(issueComparable, startDateQuery, endDateQuery);
     const matchesClient = matchesSousCompteFilter(activeClient, commission.nomSousCompte);
     

    return matchesQuery && matchesDate && matchesClient;
  });

  const totalCount = filteredCommissions.length;
  const totalAmount = filteredCommissions.reduce((sum, commission) => sum + commission.montCom, 0);
  
  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Liste des commissions" subtitle="Suivi des commissions" />
      </View>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={sharedStyles.container}>
          <View style={sharedStyles.statsRow}>
            <View style={[sharedStyles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[sharedStyles.statLabel, { color: mutedColor }]}>Toutes les commissions</Text>
              <Text style={[sharedStyles.statCount, { color: textColor }]}>{totalCount} commission{totalCount > 1 ? 's' : ''}</Text>
              <Text style={[sharedStyles.statValue, { color: textColor }]}>{formatAmount(totalAmount)}</Text>
            </View>
          </View>

          <View style={[sharedStyles.searchBox, { backgroundColor: cardColor, borderColor }]}> 
            <MaterialIcons name="search" size={20} color={mutedColor} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher une commission ou un client"
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

    {isLoading && (
            <ActivityIndicator size="large" color={tintColor} style={{ marginTop: 32 }} />
          )}

          {isError && !isLoading && (
            <EmptyResultsCard
              iconName="cloud-off"
              title="Erreur de chargement"
              subtitle="Impossible de récupérer les commissions. Vérifiez votre connexion."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          )}

          {!isLoading && !isError && (
          filteredCommissions.length === 0 ? (
            <EmptyResultsCard
              iconName="inventory-2"
              title="Aucune commission trouvée"
              subtitle="Essayez une autre recherche ou filtre."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          ) : (
            <FlatList
              data={filteredCommissions}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              contentContainerStyle={sharedStyles.listBlock}
              renderItem={({ item: commission }) => (
                <View style={[styles.invoiceCard, { backgroundColor: cardColor }]}> 
                  <View style={styles.invoiceTopRow}>
                    <View style={styles.invoiceRefBlock}>
                      <Text style={[styles.invoiceRef, { color: textColor }]}>{commission.codeCom}</Text>
                      <Text style={[styles.invoiceClient, { color: textColor }]}>Vente: {commission.codeVente ?? '—'}</Text>
                      <Text style={[styles.invoiceClient, { color: mutedColor }]}>{commission.nomSousCompte?.trim() ? commission.nomSousCompte : MAIN_ACCOUNT_FILTER}</Text>
                    </View>
                  </View>

                  <View style={styles.invoiceMetaRow}>
                   
                    <View>
                      <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Date commission</Text>
                      <Text style={[sharedStyles.metaValue, { color: textColor }]}>{formatDate(commission.dateCom)}</Text>
                    </View>
                    <View>
                      <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Code la vente</Text>
                      <Text style={[sharedStyles.metaValue, { color: textColor }]}>{commission.codeVente ?? '—'}</Text>
                    </View>

                     <View>
                      <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Date de la vente</Text>
                      <Text style={[sharedStyles.metaValue, { color: textColor }]}>{formatDate(commission.dateVente)}</Text>
                    </View>
                  </View>

                  <View style={styles.invoiceBottomRow}>
                    <Text style={[styles.amountText, { color: textColor }]}>{formatAmount(commission.montCom)}</Text>
                    <TouchableOpacity
                      onPress={() => router.push(`/commissions/${commission.id}` as never)}
                      style={[styles.actionButton, { backgroundColor: `${tintColor}18` }]}
                    >
                      <Text style={[styles.actionText, { color: tintColor }]}>Voir détail</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

