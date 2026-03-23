import { AppHeader } from '@/components/app-header';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchPromotions } from '@/services/api-service';
import { getCacheData, PROMOTIONS_LIST_CACHE_KEY, setCacheData } from '@/services/cache-service';
import { sharedStyles } from '@/styles/shared';
import { formatDate } from '@/tools/tools';
import { listPromotions, promotion, statusPromotionColorMap } from '@/types/promotions.type';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PromotionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routeId = Array.isArray(id) ? id[0] : id;
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor } = useAppTheme();
  const { userToken } = useAuthContext();
  const [promotion, setPromotion] = useState<promotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadPromotion = async () => {
      try {
        const cachedPromotions = await getCacheData<listPromotions>(PROMOTIONS_LIST_CACHE_KEY);
        const cachedPromotion = cachedPromotions?.data.find((item) => item.id === routeId);

        if (isMounted) {
          setPromotion(cachedPromotion ?? null);
        }

        if (!userToken || !routeId) {
          return;
        }

        const remoteData = await getfetchPromotions(userToken);
        const remotePromotion = remoteData.data.find((item) => item.id === routeId);

        await setCacheData(PROMOTIONS_LIST_CACHE_KEY, remoteData);

        if (isMounted) {
          setPromotion(remotePromotion ?? null);
        }
      } catch {
        if (isMounted) {
          setPromotion(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPromotion();
    return () => {
      isMounted = false;
    };
  }, [routeId, userToken]);

  if (isLoading && !promotion) {
    return (
      <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
          <AppHeader showBack title="Détail promotion" subtitle="Chargement en cours" />
        </View>
        <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
          <View style={sharedStyles.container}>
            <View style={[sharedStyles.emptyCard, { backgroundColor: cardColor }]}> 
              <ActivityIndicator size="large" color={tintColor} />
              <Text style={[sharedStyles.emptyTitle, { color: textColor }]}>Chargement de la promotion</Text>
              <Text style={[sharedStyles.emptyText, { color: mutedColor }]}>Les informations détaillées sont en cours de récupération.</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!promotion) {
    return (
      <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
          <AppHeader showBack title="Détail promotion" subtitle="Document introuvable" />
        </View>
        <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
          <View style={sharedStyles.container}>
            <EmptyResultsCard
              iconName="error-outline"
              title="Promotion introuvable"
              subtitle="Cette promotion n'existe pas ou a été supprimée."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const statusColor = statusPromotionColorMap[promotion.status] || tintColor;
  const startDate = promotion.dateDebut ? formatDate(promotion.dateDebut) : '—';
  const endDate = promotion.dateFin ? formatDate(promotion.dateFin) : '—';
  const durationText = startDate !== '—' && endDate !== '—' ? `${startDate} → ${endDate}` : 'Période non définie';

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Détail promotion" subtitle={promotion.id} />
      </View>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={sharedStyles.container}>
          {isLoading ? (
            <View style={[sharedStyles.loadingBanner, { backgroundColor: cardColor }]}> 
              <ActivityIndicator size="small" color={tintColor} />
              <Text style={[sharedStyles.loadingText, { color: mutedColor }]}>Mise à jour des données en cours...</Text>
            </View>
          ) : null}

          <View style={[sharedStyles.headerCard, { backgroundColor: cardColor }]}> 
            <View style={sharedStyles.headerTopRow}>
              <Text style={[sharedStyles.clientName, { color: textColor }]}>{promotion.nomProduit || 'Produit non renseigné'}</Text>
              <View style={[sharedStyles.statusBadge, { backgroundColor: `${statusColor}18` }]}> 
                <Text style={[sharedStyles.statusText, { color: statusColor }]}>{promotion.status}</Text>
              </View>
            </View>

            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Code: {promotion.id}</Text>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Volume max: {promotion.nbMax} unité{promotion.nbMax > 1 ? 's' : ''}</Text>
            </View>
          </View>

          <View style={[sharedStyles.linesCard, { backgroundColor: cardColor }]}> 
            <Text style={[sharedStyles.sectionTitle, { color: textColor }]}>Description</Text>
            <Text style={[sharedStyles.summaryLabel, { color: mutedColor }]}>{promotion.description || 'Aucune description disponible.'}</Text>
          </View>

          <View style={[sharedStyles.summaryCard, { backgroundColor: cardColor }]}> 
            <View style={sharedStyles.summaryRow}>
              <Text style={[sharedStyles.summaryLabel, { color: mutedColor }]}>Date de début</Text>
              <Text style={[sharedStyles.summaryValue, { color: textColor }]}>{startDate}</Text>
            </View>
            <View style={sharedStyles.summaryRow}>
              <Text style={[sharedStyles.summaryLabel, { color: mutedColor }]}>Date de fin</Text>
              <Text style={[sharedStyles.summaryValue, { color: textColor }]}>{endDate}</Text>
            </View>
            <View style={sharedStyles.separator} />
            <View style={sharedStyles.summaryRow}>
              <Text style={[sharedStyles.totalLabel, { color: textColor }]}>Période</Text>
              <Text style={[sharedStyles.summaryValue, { color: textColor }]}>{durationText}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
