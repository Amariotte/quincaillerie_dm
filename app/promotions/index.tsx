import { AppHeader } from '@/components/app-header';
import { DateRangePicker } from '@/components/date-range-picker';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchPromotions } from '@/services/api-service';
import { getCacheData, PROMOTIONS_LIST_CACHE_KEY, setCacheData } from '@/services/cache-service';
import { sharedStyles } from '@/styles/shared';
import { formatDate, matchesDateRange, toComparableDate } from '@/tools/tools';
import { listPromotions, promotionStatus, statusPromotionColorMap } from '@/types/promotions.type';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PromotionsScreen() {
  const router = useRouter();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor, borderColor } = useAppTheme();

  const { userToken } = useAuthContext();

  const [promotions, setPromotions] = useState<listPromotions>({ meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 }, data: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const [query, setQuery] = useState('');
  const [startDateQuery, setStartDateQuery] = useState('');
  const [endDateQuery, setEndDateQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<promotionStatus | 'Tous'>('Tous');


  const loadPromotions = useCallback(async () => {
    if (!userToken) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setIsError(false);
      // Try to load from cache first
      const cachedData = await getCacheData<listPromotions>(PROMOTIONS_LIST_CACHE_KEY);
      if (cachedData && Array.isArray(cachedData.data) && cachedData.data.length > 0) {
        setPromotions(cachedData);
      }

      // Fetch from API to update
      const data = await getfetchPromotions(userToken);
      setPromotions(data);
      setIsOfflineMode(false);
      await setCacheData(PROMOTIONS_LIST_CACHE_KEY, data);
    } catch {
      setPromotions({ meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 }, data: [] });
      setIsError(true);
      setIsOfflineMode(true);
    } finally {
      setIsLoading(false);
    }
  }, [userToken]);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  const statusFilters = useMemo<Array<promotionStatus | 'Tous'>>(() => [
    'Tous',
    ...Array.from(
      new Set(
        promotions.data
          .map((promotion) => promotion.status)
          .filter((status): status is promotionStatus => typeof status === 'string' && status.trim().length > 0)
      )
    ),
  ], [promotions.data]);

  const filteredPromotions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return promotions.data.filter((promotion) => {
      const matchesQuery = normalizedQuery.length === 0 || [
        promotion.description,
        promotion.nomProduit,
        promotion.libelle,
        promotion.id,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedQuery));
      const issueComparable = toComparableDate(promotion.dateDebut);
      const matchesDate = matchesDateRange(issueComparable, startDateQuery, endDateQuery);
      const matchesStatus = activeStatus === 'Tous' || promotion.status === activeStatus;

      return matchesQuery && matchesDate && matchesStatus;
    });
  }, [activeStatus, endDateQuery, promotions.data, query, startDateQuery]);

  const totalCount = filteredPromotions.length;
  const activeCount = filteredPromotions.filter((promotion) => promotion.status === 'En cours').length;
  const upcomingCount = filteredPromotions.filter((promotion) => promotion.status === 'A venir').length;
  const hasFilters = query.trim().length > 0 || startDateQuery.length > 0 || endDateQuery.length > 0 || activeStatus !== 'Tous';

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Liste des promotions" subtitle="Suivi des campagnes et disponibilités" />
      </View>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={sharedStyles.container}>
          <View style={sharedStyles.statsRow}>
            <View style={[sharedStyles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[sharedStyles.statLabel, { color: mutedColor }]}>Toutes les promotions</Text>
              <Text style={[sharedStyles.statCount, { color: textColor }]}>{totalCount} promotion{totalCount > 1 ? 's' : ''}</Text>
            </View>
           
            <View style={[sharedStyles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[sharedStyles.statLabel, { color: mutedColor }]}>Promotions en cours</Text>
              <Text style={[sharedStyles.statCount, { color: '#16a34a' }]}>{activeCount} promotion{activeCount > 1 ? 's' : ''}</Text>
            </View>

            <View style={[sharedStyles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[sharedStyles.statLabel, { color: mutedColor }]}>À venir</Text>
              <Text style={[sharedStyles.statCount, { color: '#f59e0b' }]}>{upcomingCount} promotion{upcomingCount > 1 ? 's' : ''}</Text>
            </View>
          </View>

          <View style={[sharedStyles.searchBox, { backgroundColor: cardColor, borderColor }]}> 
            <MaterialIcons name="search" size={20} color={mutedColor} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher une promotion ou un produit"
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

          {(statusFilters.length > 2) && (
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

      
          {isLoading ? (
            <ActivityIndicator size="large" color={tintColor} style={{ marginTop: 32 }} />
          ) : isError ? (
            <View style={[sharedStyles.emptyCard, { backgroundColor: cardColor }]}> 
              <MaterialIcons name="cloud-off" size={28} color={mutedColor} />
              <Text style={[sharedStyles.emptyTitle, { color: textColor }]}>Erreur de chargement</Text>
              <Text style={[sharedStyles.emptyText, { color: mutedColor }]}>Impossible de récupérer les promotions.</Text>
            </View>
          ) : filteredPromotions.length === 0 ? (
            <View style={[sharedStyles.emptyCard, { backgroundColor: cardColor }]}> 
              <MaterialIcons name="local-offer" size={28} color={mutedColor} />
              <Text style={[sharedStyles.emptyTitle, { color: textColor }]}>Aucune promotion trouvée</Text>
              <Text style={[sharedStyles.emptyText, { color: mutedColor }]}>Ajustez votre recherche ou la période.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredPromotions}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              contentContainerStyle={sharedStyles.listBlock}
              renderItem={({ item: promotion }) => {
                const statusLabel = promotion.status;
                const statusColor = statusPromotionColorMap[promotion.status] || tintColor;
                const detailCount = promotion.details?.length ?? 0;
                const hasDetailCount = detailCount > 0;
                const volumeLabel = promotion.nbMax > 0
                  ? `${promotion.nbMax} unité${promotion.nbMax > 1 ? 's' : ''}`
                  : 'Non défini';

                return (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.push(`/promotions/${promotion.id}` as never)}
                    style={[sharedStyles.invoiceCard, { backgroundColor: cardColor }]}
                  >
                    <View style={sharedStyles.invoiceTopRow}>
                      <View style={styles.cardMainBlock}>
                        <View style={styles.cardTitleRow}>
                          <Text style={[sharedStyles.invoiceRef, { color: textColor, flex: 1 }]} numberOfLines={2}>
                            {promotion.libelle || 'Promotion sans libellé'}
                          </Text>
                        </View>
                        <Text style={[styles.productLabel, { color: mutedColor }]} numberOfLines={1}>
                          {promotion.nomProduit || 'Produit non renseigné'}
                        </Text>
                        <Text style={[styles.descriptionText, { color: mutedColor }]} numberOfLines={2}>
                          {promotion.description || 'Aucune description disponible pour cette campagne.'}
                        </Text>
                      </View>
                      <View style={[sharedStyles.statusBadge, { backgroundColor: `${statusColor}18` }]}> 
                        <Text style={[sharedStyles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                      </View>
                    </View>

                    <View style={styles.quickFactsRow}>
                      <View style={[styles.quickFactCard, { backgroundColor: `${tintColor}10` }]}>
                        <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Début</Text>
                        <Text style={[sharedStyles.metaValue, { color: textColor }]}>{promotion.dateDebut ? formatDate(promotion.dateDebut) : '—'}</Text>
                      </View>
                      <View style={[styles.quickFactCard, { backgroundColor: `${tintColor}10` }]}>
                        <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Fin</Text>
                        <Text style={[sharedStyles.metaValue, { color: textColor }]}>{promotion.dateFin ? formatDate(promotion.dateFin) : '—'}</Text>
                      </View>
                      <View style={[styles.quickFactCard, { backgroundColor: `${tintColor}10` }]}>
                        <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Volume</Text>
                        <Text style={[sharedStyles.metaValue, { color: textColor }]} numberOfLines={1}>{volumeLabel}</Text>
                      </View>
                    </View>

                    <View style={styles.footerRow}>
                      <View style={styles.footerMetaRow}>
                        <Text style={[styles.footerMetaText, { color: mutedColor }]}>Réf. {promotion.id}</Text>
                        {hasDetailCount ? (
                          <Text style={[styles.footerMetaText, { color: mutedColor }]}>{detailCount} palier{detailCount > 1 ? 's' : ''}</Text>
                        ) : null}
                      </View>
                      <View style={[sharedStyles.actionButton, { backgroundColor: `${tintColor}18` }]}> 
                        <Text style={[sharedStyles.actionText, { color: tintColor }]}>Voir détail</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  resultsBanner: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
 
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardMainBlock: {
    flex: 1,
    gap: 4,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 18,
  },
  quickFactsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickFactCard: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  footerMetaRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  footerMetaText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

