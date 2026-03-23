import { AppHeader } from '@/components/app-header';
import { DateRangePicker } from '@/components/date-range-picker';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchBonAchats } from '@/services/api-service';
import { BONS_ACHATS_LIST_CACHE_KEY, getCacheData, setCacheData } from '@/services/cache-service';
import { sharedStyles } from '@/styles/shared.js';
import { formatAmount, formatDate, matchesDateRange, toComparableDate } from '@/tools/tools';
import { listBonAchats } from '@/types/bon-achats.type.js';
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
import stylesRaw from './style.js';

const styles = stylesRaw as any;

export default function BonsAchatsScreen() {
  const router = useRouter();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor, borderColor } = useAppTheme();
  const { userToken } = useAuthContext();

  const [bonAchats, setBonAchats] = useState<listBonAchats>({ meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 }, data: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const [query, setQuery] = useState('');
  const [startDateQuery, setStartDateQuery] = useState('');
  const [endDateQuery, setEndDateQuery] = useState('');

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
  
  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Bons d'achat" subtitle="Suivi des bons d'achat" />
      </View>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={sharedStyles.container}>
          <View style={styles.statsRow}>
            <View style={[sharedStyles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[sharedStyles.statLabel, { color: mutedColor }]}>Tous les bons</Text>
              <Text style={[styles.statCount, { color: textColor }]}>{totalCount} bon{totalCount > 1 ? 's' : ''}</Text>
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
            <FlatList
              data={filteredBons}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              contentContainerStyle={styles.listBlock}
              renderItem={({ item: bon }) => {
                const isExpired = bon.dateExpBa ? new Date(bon.dateExpBa).getTime() < Date.now() : false;
                const statusLabel = isExpired ? 'Expiré' : bon.etatBa === 1 ? 'Actif' : 'Inactif';
                const statusColor = isExpired ? '#dc2626' : bon.etatBa === 1 ? '#16a34a' : '#d97706';

                return (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push(`/bonsAchats/${bon.id}` as never)}
                    style={[styles.invoiceCard, { backgroundColor: cardColor }]}
                  > 
                    <View style={styles.invoiceTopRow}>
                      <View style={styles.invoiceRefBlock}>
                        <Text style={[styles.invoiceRef, { color: textColor }]}>{bon.numeroBa}</Text>
                      </View>
                      <View style={[sharedStyles.statusBadge, { backgroundColor: `${statusColor}18` }]}> 
                        <Text style={[sharedStyles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                      </View>
                    </View>

                    <View style={styles.invoiceMetaRow}>
                      <View>
                        <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Créé le</Text>
                        <Text style={[sharedStyles.metaValue, { color: textColor }]}>{bon.dateBa ? formatDate(bon.dateBa) : '—'}</Text>
                      </View>
                      <View>
                        <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Date d'expiration</Text>
                        <Text style={[sharedStyles.metaValue, { color: textColor }]}>{bon.dateExpBa ? formatDate(bon.dateExpBa) : '—'}</Text>
                      </View>
                    </View>

                    <View style={styles.invoiceMetaRow}>
                      <View>
                        <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Agence</Text>
                        <Text style={[sharedStyles.metaValue, { color: textColor }]}>{bon.nomAgence || '—'}</Text>
                      </View>
                      <View>
                        <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Usage unique</Text>
                        <Text style={[sharedStyles.metaValue, { color: textColor }]}>{bon.uniqueUse ? 'Oui' : 'Non'}</Text>
                      </View>
                    </View>

                    <View style={styles.invoiceBottomRow}>
                      <Text style={[styles.invoiceClient, { color: mutedColor, flex: 1 }]} numberOfLines={1}>
                        Montant: {formatAmount(bon.montantBa)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => router.push(`/bonsAchats/${bon.id}` as never)}
                        style={[styles.actionButton, { backgroundColor: `${tintColor}18` }]}
                      >
                        <Text style={[styles.actionText, { color: tintColor }]}>Voir détail</Text>
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

