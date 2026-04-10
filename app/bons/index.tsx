import { AppHeader } from '@/components/app-header';
import { DateRangePicker } from '@/components/date-range-picker';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { InfiniteListFooter } from '@/components/infinite-list-footer';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { usePaginatedCachedResource } from '@/hooks/use-paginated-cached-resource';
import { getfetchBonLivraisons } from '@/services/api-service';
import { BONS_LIVRAISONS_LIST_CACHE_KEY } from '@/services/cache-service';
import { sharedStyles } from '@/styles/shared.js';
import { formatDate, matchesDateRange, toComparableDate } from '@/tools/tools';
import { listBonLivraisons } from '@/types/bon-livraisons.type';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BonsScreen() {
  const router = useRouter();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor, borderColor } = useAppTheme();

  const initialBonLivraisons = useMemo<listBonLivraisons>(
    () => ({
      meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 },
      data: [],
    }),
    []
  );

const { userToken } = useAuthContext();
  const {
    data: bonLivraisons,
    isLoading,
    isRefreshing,
    isLoadingMore,
    isError,
    refresh: handleRefresh,
    loadMore,
    hasNextPage,
  } = usePaginatedCachedResource<listBonLivraisons['data'][number], listBonLivraisons>({

    cacheKey: BONS_LIVRAISONS_LIST_CACHE_KEY,
    initialData: initialBonLivraisons,
    enabled: Boolean(userToken),
    fetchPage: async (page, size) => getfetchBonLivraisons(userToken ?? "", { page, size }),
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

  const filteredBons = bonLivraisons.data.filter((bon) => {
    const matchesQuery =
      bon.codeBL.toLowerCase().includes(query.toLowerCase());
    const issueComparable = toComparableDate(bon.dateBL);
    const matchesDate = matchesDateRange(issueComparable, startDateQuery, endDateQuery);

    return matchesQuery && matchesDate;

  });

  const totalCount = filteredBons.length;
  const showInitialLoader = isLoading && bonLivraisons.data.length === 0;
  const showErrorState = isError && bonLivraisons.data.length === 0;
  
  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Bons de livraison" subtitle="Suivi des livraisons et des réceptions" />
      </View>
      <FlatList
        data={showInitialLoader || showErrorState ? [] : filteredBons}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item: bon }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(`/bons/${bon.id}` as never)}
            style={[sharedStyles.invoiceCard, { backgroundColor: cardColor }]}
          > 
            <View style={sharedStyles.invoiceTopRow}>
              <View style={sharedStyles.invoiceRefBlock}>
                <Text style={[sharedStyles.invoiceRef, { color: textColor }]}>{bon.codeBL}</Text>
              </View>
            </View>

            <View style={sharedStyles.invoiceMetaRow}>
              <View>
                <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Créé le</Text>
                <Text style={[sharedStyles.metaValue, { color: textColor }]}>{formatDate(bon.dateBL)}</Text>
              </View>
              <View>
                <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Livraison</Text>
                <Text style={[sharedStyles.metaValue, { color: textColor }]}>{bon.dateLivraison ? formatDate(bon.dateLivraison) : '—'}</Text>
              </View>
            </View>

            <View style={sharedStyles.invoiceMetaRow}>
              <View>
                <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Agence</Text>
                <Text style={[sharedStyles.metaValue, { color: textColor }]}>{bon.nomAgence || '—'}</Text>
              </View>
              <View>
                <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Livreur</Text>
                <Text style={[sharedStyles.metaValue, { color: textColor }]}>{bon.nomLivreur || '—'}</Text>
              </View>
            </View>

            <View style={sharedStyles.invoiceBottomRow}>
              <Text style={[sharedStyles.invoiceClient, { color: mutedColor, flex: 1 }]} numberOfLines={1}>
                {bon.lieuLivraison?.trim() ? `Lieu: ${bon.lieuLivraison}` : 'Lieu non renseigné'}
              </Text>
              <TouchableOpacity
                onPress={() => router.push(`/bons/${bon.id}` as never)}
                style={[sharedStyles.actionButton, { backgroundColor: `${tintColor}18` }]}
              >
                <Text style={[sharedStyles.actionText, { color: tintColor }]}>Voir détail</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={[sharedStyles.scrollContent, { paddingHorizontal: 18, paddingTop: 12 }]}
        ListHeaderComponent={
          <View style={{ gap: 16 }}>
            <View style={sharedStyles.statsRow}>
              <View style={[sharedStyles.statCard, { backgroundColor: cardColor }]}> 
                <Text style={[sharedStyles.statLabel, { color: mutedColor }]}>Tous les bons</Text>
                <Text style={[sharedStyles.statCount, { color: textColor }]}>{totalCount} bon{totalCount > 1 ? 's' : ''}</Text>
              </View>
            </View>

            <View style={[sharedStyles.searchBox, { backgroundColor: cardColor, borderColor }]}> 
              <MaterialIcons name="search" size={20} color={mutedColor} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Rechercher un bon ou un client"
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

            {showInitialLoader ? (
              <ActivityIndicator size="large" color={tintColor} style={{ marginTop: 32 }} />
            ) : null}

            {showErrorState ? (
              <EmptyResultsCard
                iconName="cloud-off"
                title="Erreur de chargement"
                subtitle="Impossible de récupérer les bons de livraison. Vérifiez votre connexion."
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
              title="Aucun bon trouvé"
              subtitle="Essayez une autre recherche ou filtre."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListFooterComponent={
          filteredBons.length > 0 ? (
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

