import { AppHeader } from '@/components/app-header';
import { DateRangePicker } from '@/components/date-range-picker';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchBonAchatById, getfetchBonAchats } from '@/services/api-service';
import { BONS_ACHATS_LIST_CACHE_KEY, getCacheData, setCacheData } from '@/services/cache-service';
import { sharedStyles } from '@/styles/shared.js';
import { formatAmount, formatDate, matchesDateRange, toComparableDate } from '@/tools/tools';
import { bonAchat, listBonAchats } from '@/types/bon-achats.type.js';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style';

export default function BonsAchatsScreen() {
  const router = useRouter();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor, borderColor } = useAppTheme();
  const { userToken } = useAuthContext();

  const [bonAchats, setBonAchats] = useState<listBonAchats>({ meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 }, data: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const [query, setQuery] = useState('');
  const [startDateQuery, setStartDateQuery] = useState('');
  const [endDateQuery, setEndDateQuery] = useState('');
  const [selectedBonId, setSelectedBonId] = useState<string | null>(null);
  const [selectedBonDetail, setSelectedBonDetail] = useState<bonAchat | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const loadBons = useCallback(async () => {
    if (!userToken) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setIsError(false);
      // Try to load from cache first
      const cachedData = await getCacheData<listBonAchats>(BONS_ACHATS_LIST_CACHE_KEY);
      if (cachedData && Array.isArray(cachedData.data) && cachedData.data.length > 0) {
        setBonAchats(cachedData);
      }

      // Fetch from API to update
      const data = await getfetchBonAchats(userToken);
      setBonAchats(data);
      setIsOfflineMode(false);
      await setCacheData(BONS_ACHATS_LIST_CACHE_KEY, data);
    } catch {
      setBonAchats({ meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 }, data: [] });
      setIsError(true);
      setIsOfflineMode(true);
    } finally {
      setIsLoading(false);
    }
  }, [userToken]);

  useEffect(() => {
    loadBons();
  }, [loadBons]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (!userToken) {
        setIsRefreshing(false);
        return;
      }
      const data = await getfetchBonAchats(userToken);
      setBonAchats(data);
      setIsOfflineMode(false);
      await setCacheData(BONS_ACHATS_LIST_CACHE_KEY, data);
      setIsError(false);
    } catch {
      setIsError(true);
      setIsOfflineMode(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [userToken]);


  const filteredBons = bonAchats.data.filter((bon) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery =
      normalizedQuery.length === 0
      || bon.numeroBa.toLowerCase().includes(normalizedQuery)
      || (bon.nomAgence ?? '').toLowerCase().includes(normalizedQuery);
    const issueComparable = toComparableDate(bon.dateBa);
    const matchesDate = matchesDateRange(issueComparable, startDateQuery, endDateQuery);

    return matchesQuery && matchesDate;

  });

  const totalCount = filteredBons.length;
  const totalAmount = filteredBons.reduce((sum, bon) => sum + bon.montantBa, 0);
  const selectedBon = filteredBons.find((bon) => String(bon.id) === selectedBonId) ?? filteredBons[0] ?? null;

  useEffect(() => {
    if (filteredBons.length === 0) {
      setSelectedBonId(null);
      return;
    }

    const hasSelectedBon = filteredBons.some((bon) => String(bon.id) === selectedBonId);
    if (!hasSelectedBon) {
      setSelectedBonId(String(filteredBons[0].id));
    }
  }, [filteredBons, selectedBonId]);

  useEffect(() => {
    let isMounted = true;

    const loadSelectedBonDetail = async () => {
      if (!selectedBonId) {
        if (isMounted) {
          setSelectedBonDetail(null);
          setIsDetailLoading(false);
        }
        return;
      }

      const previewBon = filteredBons.find((bon) => String(bon.id) === selectedBonId) ?? null;

      if (isMounted) {
        setSelectedBonDetail(previewBon);
        setIsDetailLoading(true);
      }

      if (!userToken) {
        if (isMounted) {
          setIsDetailLoading(false);
        }
        return;
      }

      try {
        const matchingBon = await getfetchBonAchatById(userToken, selectedBonId);

        if (matchingBon && isMounted) {
          setSelectedBonDetail(matchingBon);
        }
      } catch {
        if (isMounted) {
          setSelectedBonDetail(previewBon);
        }
      } finally {
        if (isMounted) {
          setIsDetailLoading(false);
        }
      }
    };

    loadSelectedBonDetail();

    return () => {
      isMounted = false;
    };
  }, [filteredBons, selectedBonId, userToken]);

  const selectedBonData = selectedBonDetail && String(selectedBonDetail.id) === selectedBonId
    ? selectedBonDetail
    : selectedBon;
  
  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Bons d'achat" subtitle="Suivi des bons d'achat" />
      </View>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={tintColor} />}>
        <View style={sharedStyles.container}>
          <View style={sharedStyles.statsRow}>
            <View style={[sharedStyles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[sharedStyles.statLabel, { color: mutedColor }]}>Tous les bons</Text>
              <Text style={[sharedStyles.statCount, { color: textColor }]}>{totalCount} bon{totalCount > 1 ? 's' : ''}</Text>
            </View>
            <View style={[sharedStyles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[sharedStyles.statLabel, { color: mutedColor }]}>Montant total</Text>
              <Text style={[sharedStyles.statCount, { color: textColor }]}>{formatAmount(totalAmount)}</Text>
            </View>
          </View>

          <View style={[sharedStyles.searchBox, { backgroundColor: cardColor, borderColor }]}> 
            <MaterialIcons name="search" size={20} color={mutedColor} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher un bon"
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

          {isLoading && (
            <ActivityIndicator size="large" color={tintColor} style={{ marginTop: 32 }} />
          )}

          {isError && !isLoading && (
            <EmptyResultsCard
              iconName="cloud-off"
              title="Erreur de chargement"
              subtitle="Impossible de récupérer les bons d'achat. Vérifiez votre connexion."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          )}

          {!isLoading && !isError && filteredBons.length === 0 && (
            <EmptyResultsCard
              iconName="inventory-2"
              title="Aucun bon trouvé"
              subtitle="Essayez une autre recherche ou filtre."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          )}

          {!isLoading && !isError && filteredBons.length > 0 && (
            <>
              <View style={styles.horizontalListHeader}>
                <Text style={[styles.horizontalListTitle, { color: textColor }]}>Liste des bons</Text>
                <Text style={[styles.horizontalListHint, { color: mutedColor }]}>Fais glisser et sélectionne un bon</Text>
              </View>

              <FlatList
                data={filteredBons}
                keyExtractor={(item) => String(item.id)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
                renderItem={({ item: bon }) => {
                  const isExpired = bon.dateExpBa ? new Date(bon.dateExpBa).getTime() < Date.now() : false;
                  const statusLabel = isExpired ? 'Expiré' : bon.etatBa === 1 ? 'Actif' : 'Inactif';
                  const statusColor = isExpired ? '#dc2626' : bon.etatBa === 1 ? '#16a34a' : '#d97706';
                  const isSelected = String(bon.id) === String(selectedBon?.id);

                  return (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => setSelectedBonId(String(bon.id))}
                      style={[styles.ticketCard, styles.horizontalTicketCard, isSelected && styles.horizontalTicketCardActive]}
                    >
                      <View style={styles.ticketShadow} />
                      <View style={styles.ticketBody}>
                        <View style={styles.ticketLeftPanel}>
                          <View style={styles.ticketHeaderRow}>
                            <View style={styles.ticketRefBlock}>
                              <Text style={styles.ticketRef}>{bon.numeroBa}</Text>
                            </View>
                            <View style={[styles.ticketStatusBadge, { backgroundColor: `${statusColor}22` }]}>
                              <Text style={[styles.ticketStatusText, { color: statusColor }]}>{statusLabel}</Text>
                            </View>
                          </View>

                          <View style={styles.ticketIconRow}>
                            <View style={styles.ticketMainIconWrap}>
                              <MaterialIcons name="redeem" size={54} color="#ffffff" />
                            </View>
                            <View style={styles.ticketMetaStack}>
                              <View style={styles.ticketMetaItem}>
                                <Text style={styles.ticketMetaLabel}>Agence</Text>
                                <Text style={styles.ticketMetaValue} numberOfLines={1}>{bon.nomAgence || '—'}</Text>
                              </View>
                              <View style={styles.ticketMetaItem}>
                                <Text style={styles.ticketMetaLabel}>Créé le</Text>
                                <Text style={styles.ticketMetaValue}>{bon.dateBa ? formatDate(bon.dateBa) : '—'}</Text>
                              </View>
                            </View>
                          </View>

                          <View style={styles.ticketFooterRow}>
                            <View style={styles.ticketTag}>
                              <MaterialIcons name={bon.uniqueUse ? 'looks-one' : 'all-inclusive'} size={14} color="#0f766e" />
                              <Text style={styles.ticketTagText}>{bon.uniqueUse ? 'Usage unique' : 'Multi-usage'}</Text>
                            </View>
                            <View style={styles.ticketArrowWrap}>
                              <Text style={styles.ticketArrowText}>{isSelected ? 'Sélectionné' : 'Sélectionner'}</Text>
                              <MaterialIcons name={isSelected ? 'check-circle' : 'arrow-forward'} size={16} color="#0f766e" />
                            </View>
                          </View>
                        </View>

                        <View style={styles.ticketDivider}>
                          <View style={styles.ticketPunchTop} />
                          <View style={styles.ticketPunchBottom} />
                        </View>

                        <View style={styles.ticketRightPanel}>
                          <View style={styles.ticketDot} />
                          <MaterialIcons name="confirmation-number" size={44} color="#5b1d2c" />
                          <View style={styles.ticketAmountPill}>
                            <Text style={styles.ticketAmountText}>{formatAmount(bon.montantBa)}</Text>
                          </View>
                          <View style={styles.ticketExpiryBlock}>
                            <Text style={styles.ticketExpiryLabel}>Validité</Text>
                            <Text style={styles.ticketExpiryValue}>{bon.dateExpBa ? formatDate(bon.dateExpBa) : '—'}</Text>
                          </View>
                          <View style={styles.ticketMiniBadge}>
                            <Text style={styles.ticketMiniBadgeText}>{bon.autreClientUse ? 'Partageable' : 'Personnel'}</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />

              {selectedBonData && (() => {
                const isExpired = selectedBonData.dateExpBa ? new Date(selectedBonData.dateExpBa).getTime() < Date.now() : false;
                const statusLabel = isExpired ? 'Expiré' : selectedBonData.etatBa === 1 ? 'Actif' : 'Inactif';
                const statusColor = isExpired ? '#dc2626' : selectedBonData.etatBa === 1 ? '#16a34a' : '#d97706';
                const bonAchatLines = selectedBonData.details ?? [];
                const totalAllocatedAmount = bonAchatLines.reduce((sum, line) => sum + (line.montantRegDoc ?? 0), 0);
                const remainingAmount = Math.max(selectedBonData.montantBa - totalAllocatedAmount, 0);
                const canBeUsedByOtherClients = selectedBonData.autreClientUse ? 'Oui' : 'Non';
                const restrictedToAgency = selectedBonData.uniqueAgence ? 'Oui' : 'Non';
                const uniqueUseLabel = selectedBonData.uniqueUse ? 'Oui' : 'Non';

                return (
                  <>
                    {isDetailLoading ? (
                      <View style={[sharedStyles.loadingBanner, { backgroundColor: cardColor }]}> 
                        <ActivityIndicator size="small" color={tintColor} />
                        <Text style={[sharedStyles.loadingText, { color: mutedColor }]}>Chargement du détail sélectionné...</Text>
                      </View>
                    ) : null}

                    <View style={[detailStyles.summaryCard, { backgroundColor: '#fff8e1' }]}> 
                      <View style={detailStyles.sectionHeader}>
                        <MaterialIcons name="analytics" size={20} color="#5b1d2c" />
                        <Text style={detailStyles.sectionTitle}>Synthèse du bon</Text>
                      </View>
                      <View style={sharedStyles.summaryRow}>
                        <Text style={[sharedStyles.summaryLabel, { color: mutedColor }]}>Montant du bon</Text>
                        <Text style={[detailStyles.summaryValueStrong, { color: '#5b1d2c' }]}>{formatAmount(selectedBonData.montantBa)}</Text>
                      </View>
                      <View style={sharedStyles.summaryRow}>
                        <Text style={[sharedStyles.summaryLabel, { color: mutedColor }]}>Montant réparti</Text>
                        <Text style={[sharedStyles.summaryValue, { color: textColor }]}>{formatAmount(totalAllocatedAmount)}</Text>
                      </View>
                      <View style={sharedStyles.summaryRow}>
                        <Text style={[sharedStyles.summaryLabel, { color: mutedColor }]}>Nombre de lignes</Text>
                        <Text style={[sharedStyles.summaryValue, { color: textColor }]}>{bonAchatLines.length}</Text>
                      </View>
                      <View style={sharedStyles.summaryRow}>
                        <Text style={[sharedStyles.summaryLabel, { color: mutedColor }]}>Montant restant</Text>
                        <Text style={[detailStyles.summaryValueStrong, { color: '#0f766e' }]}>{formatAmount(remainingAmount)}</Text>
                      </View>
                      <View style={sharedStyles.separator} />
                      <View style={sharedStyles.summaryRow}>
                        <Text style={[sharedStyles.totalLabel, { color: textColor }]}>Statut du bon</Text>
                        <Text style={[sharedStyles.totalValue, { color: statusColor }]}>{statusLabel}</Text>
                      </View>
                    </View>

                    <View style={[detailStyles.linesCard, { backgroundColor: cardColor }]}> 
                      <View style={detailStyles.sectionHeader}>
                        <MaterialIcons name="receipt-long" size={20} color={tintColor} />
                        <Text style={[sharedStyles.sectionTitle, { color: textColor }]}>Répartition du bon</Text>
                      </View>
                      <View style={sharedStyles.linesBlock}>
                        {bonAchatLines.length === 0 ? (
                          <Text style={[sharedStyles.emptyText, { color: mutedColor }]}>Aucune ligne de répartition n&apos;est disponible pour ce bon d&apos;achat.</Text>
                        ) : (
                          bonAchatLines.map((line) => (
                            <View key={line.id} style={detailStyles.lineCard}>
                              <View style={[sharedStyles.lineRow, detailStyles.lineRowTight]}>
                                <View style={sharedStyles.lineLeft}>
                                  <View style={detailStyles.lineTitleRow}>
                                    <MaterialIcons name="description" size={16} color={tintColor} />
                                    <Text style={[sharedStyles.lineLabel, { color: textColor }]}>{line.codeDoc || 'Document sans code'}</Text>
                                  </View>
                                  <Text style={[sharedStyles.lineMeta, { color: mutedColor }]}>Type : {line.typeDoc}</Text>
                                  <Text style={[sharedStyles.lineMeta, { color: mutedColor }]}>Date document : {formatDate(line.dateDoc)}</Text>
                                  {line.nomClient && ( <Text style={[sharedStyles.lineMeta, { color: mutedColor }]}>Propriétaire : {line.nomClient}</Text> )}
                                  <Text style={[sharedStyles.lineMeta, { color: mutedColor }]}>Montant document : {formatAmount(line.montantDoc)}</Text>
                                </View>
                                <View style={detailStyles.lineAmountBadge}>
                                  <Text style={detailStyles.lineAmountText}>{formatAmount(line.montantRegDoc)}</Text>
                                </View>
                              </View>
                            </View>
                          ))
                        )}
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => router.push(`/bonsAchats/${selectedBonData.id}` as never)}
                      style={[sharedStyles.actionButton, detailStyles.bottomActionButton, { backgroundColor: `${tintColor}18` }]}
                    >
                      <Text style={[sharedStyles.actionText, { color: tintColor }]}>Ouvrir la fiche complète</Text>
                    </TouchableOpacity>
                  </>
                );
              })()}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const detailStyles = StyleSheet.create({
  detailMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailMetaChip: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: '31%',
  },
  detailMetaChipLabel: {
    color: '#c7fffb',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailMetaChipValue: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 3,
  },
  summaryCard: {
    borderRadius: 22,
    padding: 18,
    gap: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#5b1d2c',
  },
  summaryValueStrong: {
    fontSize: 16,
    fontWeight: '900',
  },
  linesCard: {
    borderRadius: 22,
    padding: 16,
    gap: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  lineCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  lineRowTight: {
    alignItems: 'flex-start',
  },
  lineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lineAmountBadge: {
    marginLeft: 10,
    backgroundColor: '#ecfeff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#a5f3fc',
  },
  lineAmountText: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '900',
  },
  bottomActionButton: {
    alignSelf: 'flex-start',
  },
});

