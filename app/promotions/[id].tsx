import { AppHeader } from '@/components/app-header';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchPromotionById } from '@/services/api-service';
import { getCacheData, PROMOTIONS_LIST_CACHE_KEY, setCacheData } from '@/services/cache-service';
import { sharedStyles } from '@/styles/shared.js';
import { formatDate, MAIN_ACCOUNT_FILTER } from '@/tools/tools';
import { listPromotions, promotion, statusPromotionColorMap } from '@/types/promotions.type';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PromotionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor } = useAppTheme();
  const { userToken } = useAuthContext();
  const [promotion, setPromotion] = useState<promotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const routeId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    let isMounted = true;

    const loadPromotions = async () => {
      try {
        const cachedPromotions = await getCacheData<listPromotions>(PROMOTIONS_LIST_CACHE_KEY);
        const cachedPromotion = cachedPromotions?.data.find((item) => item.id === routeId);

        if (isMounted) {
          setPromotion(cachedPromotion ?? null);
        }

        if (!userToken || !routeId) {
          return;
        }

        const data = await getfetchPromotionById(userToken, routeId);
        if (data) {
          if (isMounted) {
            setPromotion(data);
          }

          const currentData = cachedPromotions?.data ?? [];
          const existsInCache = currentData.some((item) => item.id === data.id);
          const updatedData = existsInCache
            ? currentData.map((item) => (item.id === data.id ? data : item))
            : [data, ...currentData];

          await setCacheData(PROMOTIONS_LIST_CACHE_KEY, {
            meta: cachedPromotions?.meta ?? { page: 1, next: 1, totalPages: 1, total: updatedData.length, size: updatedData.length },
            data: updatedData,
          });
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

    loadPromotions();
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
              <Text style={[sharedStyles.emptyTitle, { color: textColor }]}>Chargement du règlement</Text>
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

  const statusColor = statusPromotionColorMap[promotion.status ?? ''] || tintColor;
  const promotionLines = promotion.details ?? [];

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Détail promotion" subtitle={promotion.libelle} />
      </View>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={sharedStyles.container}>
          {isLoading ? (
            <View style={[sharedStyles.loadingBanner, { backgroundColor: cardColor }]}> 
              <ActivityIndicator size="small" color={tintColor} />
              <Text style={[sharedStyles.loadingText, { color: mutedColor }]}>Chargement des informations en cours...</Text>
            </View>
          ) : null}

          <View style={[sharedStyles.headerCard, { backgroundColor: cardColor }]}> 
            <View style={sharedStyles.headerTopRow}>
              <Text style={[sharedStyles.clientName, { color: textColor }]}>{promotion.libelle?.trim() ? promotion.libelle : MAIN_ACCOUNT_FILTER}</Text>   
            </View>
            
            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Date de debut: {promotion.dateDebut ? formatDate(promotion.dateDebut) : '—'}</Text>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Date de fin : {promotion.dateFin ? formatDate(promotion.dateFin) : '—'}</Text>
            </View>
             <View style={[sharedStyles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
              <Text style={[sharedStyles.statusText, { color: statusColor }]}>{promotion.status}</Text>
            </View>
            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Produit : {promotion.nomProduit ?? '—'}</Text>
            </View>
            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Nombre : {promotion.nbMax ?? '—'}</Text>
            </View>
            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Description : {promotion.description ?? '—'}</Text>
            </View>
            
          </View>

        
          <View style={[sharedStyles.linesCard, { backgroundColor: cardColor }]}> 
            <Text style={[sharedStyles.sectionTitle, { color: textColor }]}>Palier</Text>
            <View style={sharedStyles.linesBlock}>
              {promotionLines.length === 0 ? (
                <Text style={[sharedStyles.emptyText, { color: mutedColor }]}>Aucune ligne de répartition n'est disponible pour ce règlement.</Text>
              ) : (
                promotionLines.map((line) => (
                  <View style={sharedStyles.lineRow}>
                    <View style={sharedStyles.lineLeft}>
                      <Text style={[sharedStyles.lineLabel, { color: textColor }]}>{line.description || 'Document sans code'}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}