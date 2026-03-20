import { AppHeader } from '@/components/app-header';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchCommissions } from '@/services/api-service';
import { COMMISSIONS_LIST_CACHE_KEY, getCacheData, setCacheData } from '@/services/cache-service';
import { formatAmount, toComparableDate } from '@/tools/tools';
import { listCommissions } from '@/types/commissions.type';
import { factureStatus } from '@/types/factures.type';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style';

const statusFilters: Array<'Toutes' | factureStatus> = ['Toutes', 'Soldée', 'Non soldée', 'Echue'];
const MAIN_ACCOUNT_FILTER = 'Compte principal';



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
    if (!userToken) return;
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

  const sousCompteFilters = [
    'Tous',
    MAIN_ACCOUNT_FILTER,
    ...Array.from(
      new Set(
        commissions.data
          .map((f) => f.nomSousCompte)
          .filter((sousCompte): sousCompte is string => typeof sousCompte === 'string' && sousCompte.trim().length > 0)
      )
    ),
  ];

  sousCompteFilters.sort((a, b) => {
    if (a === 'Tous') return -1;
    if (b === 'Tous') return 1;
    if (a === MAIN_ACCOUNT_FILTER) return -1;
    if (b === MAIN_ACCOUNT_FILTER) return 1;
    return a.localeCompare(b);
  });

  const today = new Date();
  const todayComparable = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  const filteredCommissions = commissions.data.filter((commission) => {
    const matchesQuery =
      commission.codeCom.toLowerCase().includes(query.toLowerCase()) ||
      commission.nomSousCompte?.toLowerCase().includes(query.toLowerCase());
    const issueComparable = toComparableDate(commission.dateCom);
    const parseInputDate = (s: string): Date | null => {
      const [d, m, y] = s.split('/');
      if (!d || !m || !y) return null;
      const dt = new Date(Number(y), Number(m) - 1, Number(d));
      return isNaN(dt.getTime()) ? null : dt;
    };
    const startParsed = startDateQuery.trim().length > 0 ? parseInputDate(startDateQuery.trim()) : null;
    const endParsed = endDateQuery.trim().length > 0 ? parseInputDate(endDateQuery.trim()) : null;
    const startComparable = startParsed ? toComparableDate(startParsed) : null;
    const endComparable = endParsed ? toComparableDate(endParsed) : null;
    const afterStart = !startComparable || !issueComparable || issueComparable >= startComparable;
    const beforeEnd = !endComparable || !issueComparable || issueComparable <= endComparable;
    const matchesDate = afterStart && beforeEnd;
    const hasSousCompte = typeof commission.nomSousCompte === 'string' && commission.nomSousCompte.trim().length > 0;
    const matchesClient =
      activeClient === 'Tous'
        ? true
        : activeClient === MAIN_ACCOUNT_FILTER
          ? !hasSousCompte
          : commission.nomSousCompte === activeClient;

    return matchesQuery && matchesDate && matchesClient;
  });

  const totalCount = filteredCommissions.length;
  const totalAmount = filteredCommissions.reduce((sum, commission) => sum + commission.montCom, 0);
  
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader showBack title="Liste des commissions" subtitle="Suivi des commissions" />

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[styles.statLabel, { color: mutedColor }]}>Toutes les commissions</Text>
              <Text style={[styles.statCount, { color: textColor }]}>{totalCount} commission{totalCount > 1 ? 's' : ''}</Text>
              <Text style={[styles.statValue, { color: textColor }]}>{formatAmount(totalAmount)}</Text>
            </View>
          </View>

          <View style={[styles.searchBox, { backgroundColor: cardColor, borderColor }]}> 
            <MaterialIcons name="search" size={20} color={mutedColor} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher une commission ou un client"
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

          {!isLoading && !isError && (
          <View style={styles.listBlock}>
            {filteredCommissions.map((commission) => {
              
              function formatDisplayDate(descVente: Date | undefined): React.ReactNode {
                throw new Error('Function not implemented.');
              }

              return (
                <View key={commission.id} style={[styles.invoiceCard, { backgroundColor: cardColor }]}> 
                  <View style={styles.invoiceTopRow}>
                    <View style={styles.invoiceRefBlock}>
                      <Text style={[styles.invoiceRef, { color: textColor }]}>{commission.codeCom}</Text>
                      <Text style={[styles.invoiceClient, { color: textColor }]}>Vente: {commission.codeVente ?? '—'}</Text>
                      <Text style={[styles.invoiceClient, { color: mutedColor }]}>{commission.nomSousCompte ?? MAIN_ACCOUNT_FILTER}</Text>
                    </View>
                  </View>

                  <View style={styles.invoiceMetaRow}>
                    <View>
                      <Text style={[styles.metaLabel, { color: mutedColor }]}>Date de vente</Text>
                      <Text style={[styles.metaValue, { color: textColor }]}>{formatDisplayDate(commission.descVente)}</Text>
                    </View>
                    <View>
                      <Text style={[styles.metaLabel, { color: mutedColor }]}>Date commission</Text>
                      <Text style={[styles.metaValue, { color: textColor }]}>{formatDisplayDate(commission.dateCom)}</Text>
                    </View>
                    <View>
                      <Text style={[styles.metaLabel, { color: mutedColor }]}>Échéance</Text>
                      <Text style={[styles.metaValue, { color: textColor }]}>{formatDisplayDate(commission.dateEchVente)}</Text>
                    </View>
                    <View>
                      <Text style={[styles.metaLabel, { color: mutedColor }]}>Articles</Text>
                      <Text style={[styles.metaValue, { color: textColor }]}>{commission.nbProduits}</Text>
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
              );
            })}

              {filteredCommissions.length === 0 ? (
                          <EmptyResultsCard
                            iconName="inventory-2"
                            title="Aucune commission trouvée"
                            subtitle="Essayez une autre recherche ou filtre."
                            cardColor={cardColor}
                            titleColor={textColor}
                            subtitleColor={mutedColor}
                          />
                        ) : null}
           
          </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

