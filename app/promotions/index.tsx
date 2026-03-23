import { AppHeader } from '@/components/app-header';
import { DateRangePicker } from '@/components/date-range-picker';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchPromotions } from '@/services/api-service';
import { getCacheData, PROMOTIONS_LIST_CACHE_KEY, setCacheData } from '@/services/cache-service';
import { formatDate, matchesDateRange, toComparableDate } from '@/tools/tools';
import { listPromotions, promotionStatus, statusPromotionColorMap } from '@/types/promotions.type';
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
import stylesRaw from './style.js';

const styles = stylesRaw as any;

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

  const statusFilters: Array<promotionStatus | 'Tous'> = [
    'Tous',
    ...Array.from(
      new Set(
        promotions.data
          .map((promotion) => promotion.status)
          .filter((status): status is promotionStatus => typeof status === 'string' && status.trim().length > 0)
      )
    ),
  ];

  const filteredPromotions = promotions.data.filter((promotion) => {
    const matchesQuery =
      promotion.description?.toLowerCase().includes(query.toLowerCase()) ||
      promotion.nomProduit?.toLowerCase().includes(query.toLowerCase()) ||
      promotion.libelle?.toLowerCase().includes(query.toLowerCase());
    const issueComparable = toComparableDate(promotion.dateDebut);
    const matchesDate = matchesDateRange(issueComparable, startDateQuery, endDateQuery);
    const matchesStatus = activeStatus === 'Tous' || promotion.status === activeStatus;

    return matchesQuery && matchesDate && matchesStatus;
  });

  const totalCount = filteredPromotions.length;
  const activePromotions = filteredPromotions.filter((promotion) => promotion.status === 'En cours');
  const activeCount = activePromotions.length;
  const totalQuota = filteredPromotions.reduce((sum, promotion) => sum + promotion.nbMax, 0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Liste des promotions" subtitle="Suivi des campagnes et disponibilités" />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[styles.statLabel, { color: mutedColor }]}>Toutes les promotions</Text>
              <Text style={[styles.statCount, { color: textColor }]}>{totalCount} promotion{totalCount > 1 ? 's' : ''}</Text>
            </View>
           
            <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[styles.statLabel, { color: mutedColor }]}>Promotions en cours</Text>
              <Text style={[styles.statCount, { color: '#16a34a' }]}>{activeCount} promotion{activeCount > 1 ? 's' : ''}</Text>
            </View>
          </View>

          <View style={[styles.searchBox, { backgroundColor: cardColor, borderColor }]}> 
            <MaterialIcons name="search" size={20} color={mutedColor} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher une promotion ou un produit"
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

          {isOfflineMode && !isLoading ? (
            <View style={[styles.loadingBanner, { backgroundColor: cardColor }]}> 
              <MaterialIcons name="wifi-off" size={16} color={mutedColor} />
              <Text style={[styles.loadingText, { color: mutedColor }]}>Mode hors ligne activé (données locales).</Text>
            </View>
          ) : null}


          {isLoading ? (
            <ActivityIndicator size="large" color={tintColor} style={{ marginTop: 32 }} />
          ) : isError ? (
            <View style={[styles.emptyCard, { backgroundColor: cardColor }]}> 
              <MaterialIcons name="cloud-off" size={28} color={mutedColor} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Erreur de chargement</Text>
              <Text style={[styles.emptyText, { color: mutedColor }]}>Impossible de récupérer les promotions.</Text>
            </View>
          ) : filteredPromotions.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: cardColor }]}> 
              <MaterialIcons name="local-offer" size={28} color={mutedColor} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Aucune promotion trouvée</Text>
              <Text style={[styles.emptyText, { color: mutedColor }]}>Ajustez votre recherche ou la période.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredPromotions}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              contentContainerStyle={styles.listBlock}
              renderItem={({ item: promotion }) => {
                const statusLabel = promotion.status;
                const statusColor = statusPromotionColorMap[promotion.status] || tintColor;

                return (
                  <View style={[styles.invoiceCard, { backgroundColor: cardColor }]}> 
                    <View style={styles.invoiceTopRow}>
                      <View style={styles.invoiceRefBlock}>
                          <Text style={[styles.invoiceRef, { color: textColor }]}>{promotion.description || 'Description non disponible'}</Text>
                        <Text style={[styles.invoiceRef, { color: mutedColor }]}>{promotion.nomProduit || 'Produit non renseigné'}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}> 
                        <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                      </View>
                    </View>

                    <View style={styles.invoiceMetaRow}>
                      <View>
                        <Text style={[styles.metaCaption, { color: mutedColor }]}>Début</Text>
                        <Text style={[styles.metaValue, { color: textColor }]}>{promotion.dateDebut ? formatDate(promotion.dateDebut) : '—'}</Text>
                      </View>
                      <View>
                        <Text style={[styles.metaCaption, { color: mutedColor }]}>Fin</Text>
                        <Text style={[styles.metaValue, { color: textColor }]}>{promotion.dateFin ? formatDate(promotion.dateFin) : '—'}</Text>
                      </View>
                    </View>
                    
                      {promotion.nbMax > 0 ? (
                         <View style={styles.metaModeRow}>
                      <Text style={[styles.metaCaption, { color: mutedColor }]}>Volume maximum</Text>
                      <Text style={[styles.metaValue, { color: textColor }]}>{promotion.nbMax} unité{promotion.nbMax > 1 ? 's' : ''}</Text>
                    </View>
                      ) : null}
                   
            
                    <View style={styles.invoiceBottomRow}>
                      <TouchableOpacity
                        onPress={() => router.push(`/promotions/${promotion.id}` as never)}
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

