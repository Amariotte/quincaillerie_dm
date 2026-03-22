import { AppHeader } from '@/components/app-header';
import { DateRangePicker } from '@/components/date-range-picker';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchReglements } from '@/services/api-service';
import { getCacheData, REGLEMENTS_LIST_CACHE_KEY, setCacheData } from '@/services/cache-service';
import { buildSousCompteFilters, formatAmount, matchesDateRange, matchesSousCompteFilter, toComparableDate } from '@/tools/tools';
import { listReglements, statusEncaisse, statusEncaisseColorMap } from '@/types/reglements.type';
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
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style.js';

export default function ReglementsScreen() {
  const router = useRouter();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor, borderColor } = useAppTheme();

const { userToken } = useAuthContext();

  const [reglements, setReglements] = useState<listReglements>({ meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 }, data: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const [query, setQuery] = useState('');
  const [startDateQuery, setStartDateQuery] = useState('');
  const [endDateQuery, setEndDateQuery] = useState('');
  const [activeClient, setActiveClient] = useState('Tous');
  const [activeStatus, setActiveStatus] = useState<statusEncaisse | 'Tous'>('Tous');
  const [activePaymentMode, setActivePaymentMode] = useState('Tous modes');


 const loadReglements = useCallback(async () => {
    if (!userToken) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setIsError(false);
      // Try to load from cache first
      const cachedData = await getCacheData<listReglements>(REGLEMENTS_LIST_CACHE_KEY);
      if (cachedData && Array.isArray(cachedData.data) && cachedData.data.length > 0) {
        setReglements(cachedData);
      }

      // Fetch from API to update
      const data = await getfetchReglements(userToken);
      setReglements(data);
      setIsOfflineMode(false);
      await setCacheData(REGLEMENTS_LIST_CACHE_KEY, data);
    } catch {
      setReglements({ meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 }, data: [] });
      setIsError(true);
      setIsOfflineMode(true);
    } finally {
      setIsLoading(false);
    }
  }, [userToken]);

  useEffect(() => {
    loadReglements();
  }, [loadReglements]);


 const statusFilters: Array<statusEncaisse | 'Tous'> = [
  'Tous',
  ...Array.from(
    new Set(
      reglements.data
        .map((reglement) => reglement.statusEncaisse)
        .filter((status): status is statusEncaisse => typeof status === 'string' && status.trim().length > 0)
    )
  ),
];

 const sousCompteFilters = buildSousCompteFilters(
      reglements.data,
      (reglement) => reglement.nomSousCompte,
    );

const paymentModeFilters = [
  'Tous modes',
  ...Array.from(
    new Set(
      reglements.data
        .map((reglement) => reglement.nomModePaiement)
        .filter((mode): mode is string => typeof mode === 'string' && mode.trim().length > 0)
    )
  ),
];



  const filteredReglements = reglements.data.filter((reglement) => {
    const matchesQuery =
      reglement.codeReg.toLowerCase().includes(query.toLowerCase()) ||
      reglement.nomSousCompte?.toLowerCase().includes(query.toLowerCase());
    const issueComparable = toComparableDate(reglement.dateReg);
       const matchesDate = matchesDateRange(issueComparable, startDateQuery, endDateQuery);
    const matchesStatus = activeStatus === 'Tous' || reglement.statusEncaisse === activeStatus;
    const matchesPaymentMode = activePaymentMode === 'Tous modes' || reglement.nomModePaiement === activePaymentMode;
    const matchesClient = matchesSousCompteFilter(activeClient, reglement.nomSousCompte);

    return matchesQuery && matchesDate && matchesClient && matchesStatus && matchesPaymentMode;
  });

  
  const totalCount = filteredReglements.length;
  const totalAmount = filteredReglements.reduce((sum, reglement) => sum + reglement.montantReg, 0);
  const unsettledReglements = filteredReglements.filter(reglement => reglement.statusEncaisse === 'Non encaissé');
  const unsettledCount = unsettledReglements.length;
  const unsettledAmount = unsettledReglements.reduce((sum, reglement) => sum + reglement.montantReg, 0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader showBack title="Liste des règlements" subtitle="Suivi des paiements et soldes restants" />

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[styles.statLabel, { color: mutedColor }]}>Tous les règlements</Text>
              <Text style={[styles.statCount, { color: textColor }]}>{totalCount} règlement{totalCount > 1 ? 's' : ''}</Text>
              <Text style={[styles.statValue, { color: textColor }]}>{formatAmount(totalAmount)}</Text>
            </View>
           
            <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[styles.statLabel, { color: mutedColor }]}>Règlements non encaissés</Text>
              <Text style={[styles.statCount, { color: '#dc2626' }]}>{unsettledCount} règlement{unsettledCount > 1 ? 's' : ''}</Text>
              <Text style={[styles.statValue, { color: '#dc2626' }]}>{formatAmount(unsettledAmount)}</Text>
            </View>
          </View>

          <View style={[styles.searchBox, { backgroundColor: cardColor, borderColor }]}> 
            <MaterialIcons name="search" size={20} color={mutedColor} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher un règlement ou un client"
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

         {(sousCompteFilters.length > 2) && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {sousCompteFilters.map((client) => {

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
          )}
          
          {(statusFilters.length > 2) && (
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

          {(paymentModeFilters.length > 2) && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {paymentModeFilters.map((mode) => {
              const isActive = mode === activePaymentMode;

              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setActivePaymentMode(mode)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? tintColor : cardColor,
                      borderColor: isActive ? tintColor : borderColor,
                    },
                  ]}
                >
                  <Text style={[styles.filterLabel, { color: isActive ? '#ffffff' : textColor }]}>{mode}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          )}
          {isLoading ? (
            <ActivityIndicator size="large" color={tintColor} style={{ marginTop: 32 }} />
          ) : isError ? (
            <View style={[styles.emptyCard, { backgroundColor: cardColor }]}> 
              <MaterialIcons name="cloud-off" size={28} color={mutedColor} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Erreur de chargement</Text>
              <Text style={[styles.emptyText, { color: mutedColor }]}>Impossible de récupérer les règlements.</Text>
            </View>
          ) : filteredReglements.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: cardColor }]}> 
              <MaterialIcons name="receipt-long" size={28} color={mutedColor} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Aucun règlement trouvé</Text>
              <Text style={[styles.emptyText, { color: mutedColor }]}>Ajustez votre recherche ou le filtre de statut.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredReglements}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              contentContainerStyle={styles.listBlock}
              renderItem={({ item: reglement }) => {
                const statusLabel = reglement.statusEncaisse ?? 'Non encaissé';
   const statusColor = statusEncaisseColorMap[reglement.statusEncaisse ?? 'Non encaissé'] || tintColor;

                return (
                  <View style={[styles.invoiceCard, { backgroundColor: cardColor }]}> 
                    <View style={styles.invoiceTopRow}>
                      <View style={styles.invoiceRefBlock}>
                        <Text style={[styles.invoiceRef, { color: textColor }]}>{reglement.codeReg}</Text>
                        <Text style={[styles.invoiceClient, { color: mutedColor }]}>{reglement.nomSousCompte}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}> 
                        <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                      </View>
                    </View>

                    <View style={styles.invoiceMetaRow}>
                      <View>
                        <Text style={[styles.metaLabel, { color: mutedColor }]}>Date</Text>
                        <Text style={[styles.metaValue, { color: textColor }]}>{reglement.dateReg ? new Date(reglement.dateReg).toLocaleDateString('fr-FR') : '—'}</Text>
                      </View>
                      <View>
                        <Text style={[styles.metaLabel, { color: mutedColor }]}>Référence</Text>
                        <Text style={[styles.metaValue, { color: textColor }]}>{reglement.refReg || '-'}</Text>
                      </View>
                    </View>

                    <View style={styles.metaModeRow}>
                      <Text style={[styles.metaLabel, { color: mutedColor }]}>Mode de paiement</Text>
                      <Text style={[styles.metaValue, { color: textColor }]}>{reglement.nomModePaiement || '—'}</Text>
                    </View>

                    <View style={styles.invoiceBottomRow}>
                      <View style={styles.amountBlock}>
                        <Text style={[styles.amountText, { color: textColor }]}>{formatAmount(reglement.montantReg)}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => router.push(`/reglements/${reglement.id}` as never)}
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

