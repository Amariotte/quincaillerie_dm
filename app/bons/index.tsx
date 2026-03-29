import { AppHeader } from '@/components/app-header';
import { DateRangePicker } from '@/components/date-range-picker';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchBonLivraisons } from '@/services/api-service';
import { BONS_LIVRAISONS_LIST_CACHE_KEY, getCacheData, setCacheData } from '@/services/cache-service';
import { sharedStyles } from '@/styles/shared.js';
import { formatDate, matchesDateRange, toComparableDate } from '@/tools/tools';
import { listBonLivraisons } from '@/types/bon-livraisons.type';
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

export default function BonsScreen() {
  const router = useRouter();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor, borderColor } = useAppTheme();
  const { userToken } = useAuthContext();

  const [bonLivraisons, setBonLivraisons] = useState<listBonLivraisons>({ meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 }, data: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const [query, setQuery] = useState('');
  const [startDateQuery, setStartDateQuery] = useState('');
  const [endDateQuery, setEndDateQuery] = useState('');
  const [activeClient, setActiveClient] = useState('Tous');

  const loadBons = useCallback(async () => {
    if (!userToken) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setIsError(false);
      // Try to load from cache first
      const cachedData = await getCacheData<listBonLivraisons>(BONS_LIVRAISONS_LIST_CACHE_KEY);
      if (cachedData && Array.isArray(cachedData.data) && cachedData.data.length > 0) {
        setBonLivraisons(cachedData);
      }

      // Fetch from API to update
      const data = await getfetchBonLivraisons(userToken);
      setBonLivraisons(data);
      setIsOfflineMode(false);
      await setCacheData(BONS_LIVRAISONS_LIST_CACHE_KEY, data);
    } catch {
      setBonLivraisons({ meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 }, data: [] });
      setIsError(true);
      setIsOfflineMode(true);
    } finally {
      setIsLoading(false);
    }
  }, [userToken]);

  useEffect(() => {
    loadBons();
  }, [loadBons]);


  const filteredBons = bonLivraisons.data.filter((bon) => {
    const matchesQuery =
      bon.codeBL.toLowerCase().includes(query.toLowerCase());
    const issueComparable = toComparableDate(bon.dateBL);
    const matchesDate = matchesDateRange(issueComparable, startDateQuery, endDateQuery);

    return matchesQuery && matchesDate;

  });

  const totalCount = filteredBons.length;
  
  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Bons de livraison" subtitle="Suivi des livraisons et des réceptions" />
      </View>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={sharedStyles.container}>
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

          {isLoading && (
            <ActivityIndicator size="large" color={tintColor} style={{ marginTop: 32 }} />
          )}

          {isError && !isLoading && (
            <EmptyResultsCard
              iconName="cloud-off"
              title="Erreur de chargement"
              subtitle="Impossible de récupérer les bons de livraison. Vérifiez votre connexion."
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
            <FlatList
              data={filteredBons}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              contentContainerStyle={sharedStyles.listBlock}
              renderItem={({ item: bon }) => {

                return (
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
                );
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

