import { AppHeader } from '@/components/app-header';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchPromotions } from '@/services/api-service';
import { getCacheData, PROMOTIONS_LIST_CACHE_KEY, setCacheData } from '@/services/cache-service';
import { sharedStyles } from '@/styles/shared';
import { formatDate } from '@/tools/tools';
import { listPromotions, promotion, statusPromotionColorMap } from '@/types/promotions.type';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const detailItems = promotion.details ?? [];
  const detailSummary = useMemo(() => {
    if (detailItems.length === 0) {
      return null;
    }

    const totalGains = detailItems.reduce((sum, item) => sum + (item.gains ?? 0), 0);
    const hasThresholds = detailItems.some((item) => item.valeurMini != null || item.valeurMaxi != null);

    return {
      count: detailItems.length,
      totalGains,
      hasThresholds,
    };
  }, [detailItems]);

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
              <View style={styles.heroTitleBlock}>
                <Text style={[sharedStyles.clientName, { color: textColor }]}>{promotion.libelle || 'Promotion sans libellé'}</Text>
                <Text style={[styles.heroSubtitle, { color: mutedColor }]}>{promotion.nomProduit || 'Produit non renseigné'}</Text>
              </View>
              <View style={[sharedStyles.statusBadge, { backgroundColor: `${statusColor}18` }]}> 
                <Text style={[sharedStyles.statusText, { color: statusColor }]}>{promotion.status}</Text>
              </View>
            </View>

            <Text style={[sharedStyles.descriptionText, { color: mutedColor }]}>
              {promotion.description || 'Aucune description disponible pour cette campagne.'}
            </Text>

            <View style={styles.heroStatsRow}>
              <View style={[styles.heroStatCard, { backgroundColor: `${tintColor}10` }]}>
                <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Référence</Text>
                <Text style={[sharedStyles.metaValue, { color: textColor }]}>{promotion.id}</Text>
              </View>
              <View style={[styles.heroStatCard, { backgroundColor: `${tintColor}10` }]}>
                <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Volume max</Text>
                <Text style={[sharedStyles.metaValue, { color: textColor }]}>{promotion.nbMax > 0 ? `${promotion.nbMax} unité${promotion.nbMax > 1 ? 's' : ''}` : 'Non défini'}</Text>
              </View>
              <View style={[styles.heroStatCard, { backgroundColor: `${tintColor}10` }]}>
                <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Paliers</Text>
                <Text style={[sharedStyles.metaValue, { color: textColor }]}>{detailItems.length}</Text>
              </View>
            </View>
          </View>

          <View style={[sharedStyles.summaryCard, { backgroundColor: cardColor }]}> 
            <Text style={[sharedStyles.sectionTitle, { color: textColor }]}>Période de validité</Text>
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

          {detailSummary ? (
            <View style={[sharedStyles.summaryCard, { backgroundColor: cardColor }]}> 
              <Text style={[sharedStyles.sectionTitle, { color: textColor }]}>Synthèse des paliers</Text>
              <View style={sharedStyles.summaryRow}>
                <Text style={[sharedStyles.summaryLabel, { color: mutedColor }]}>Nombre de paliers</Text>
                <Text style={[sharedStyles.summaryValue, { color: textColor }]}>{detailSummary.count}</Text>
              </View>
              <View style={sharedStyles.summaryRow}>
                <Text style={[sharedStyles.summaryLabel, { color: mutedColor }]}>Gains cumulés</Text>
                <Text style={[sharedStyles.summaryValue, { color: textColor }]}>{detailSummary.totalGains}</Text>
              </View>
              <View style={sharedStyles.summaryRow}>
                <Text style={[sharedStyles.summaryLabel, { color: mutedColor }]}>Seuils définis</Text>
                <Text style={[sharedStyles.summaryValue, { color: textColor }]}>{detailSummary.hasThresholds ? 'Oui' : 'Non'}</Text>
              </View>
            </View>
          ) : null}

          <View style={[sharedStyles.linesCard, { backgroundColor: cardColor }]}> 
            <View style={styles.sectionHeader}>
              <Text style={[sharedStyles.sectionTitle, { color: textColor }]}>Paliers et avantages</Text>
              <View style={[styles.sectionBadge, { backgroundColor: `${tintColor}18` }]}>
                <Text style={[styles.sectionBadgeText, { color: tintColor }]}>{detailItems.length}</Text>
              </View>
            </View>

            {detailItems.length === 0 ? (
              <View style={styles.emptyDetailBlock}>
                <MaterialIcons name="inventory-2" size={24} color={mutedColor} />
                <Text style={[styles.emptyDetailTitle, { color: textColor }]}>Aucun palier disponible</Text>
                <Text style={[styles.emptyDetailText, { color: mutedColor }]}>Cette promotion ne contient pas encore de détail complémentaire.</Text>
              </View>
            ) : (
              detailItems.map((detail, index) => (
                <View key={`${promotion.id}-${index}`} style={[styles.detailTierCard, { borderColor: `${tintColor}20` }]}> 
                  <View style={styles.detailTierHeader}>
                    <Text style={[styles.detailTierTitle, { color: textColor }]}>
                      {detail.libelle || detail.nomProduit || `Palier ${index + 1}`}
                    </Text>
                    {detail.type != null ? (
                      <View style={[styles.typeBadge, { backgroundColor: `${statusColor}18` }]}> 
                        <Text style={[styles.typeBadgeText, { color: statusColor }]}>Type {detail.type}</Text>
                      </View>
                    ) : null}
                  </View>

                  {detail.description ? (
                    <Text style={[styles.detailTierDescription, { color: mutedColor }]}>{detail.description}</Text>
                  ) : null}

                  <View style={styles.detailMetricsGrid}>
                    <View style={[styles.detailMetricBox, { backgroundColor: `${tintColor}10` }]}>
                      <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Valeur mini</Text>
                      <Text style={[sharedStyles.metaValue, { color: textColor }]}>{detail.valeurMini ?? '—'}</Text>
                    </View>
                    <View style={[styles.detailMetricBox, { backgroundColor: `${tintColor}10` }]}>
                      <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Valeur maxi</Text>
                      <Text style={[sharedStyles.metaValue, { color: textColor }]}>{detail.valeurMaxi ?? '—'}</Text>
                    </View>
                    <View style={[styles.detailMetricBox, { backgroundColor: `${tintColor}10` }]}>
                      <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Gains</Text>
                      <Text style={[sharedStyles.metaValue, { color: textColor }]}>{detail.gains ?? '—'}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroTitleBlock: {
    flex: 1,
    gap: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroStatCard: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionBadge: {
    minWidth: 34,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  emptyDetailBlock: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyDetailTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptyDetailText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  detailTierCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  detailTierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  detailTierTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  typeBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  detailTierDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  detailMetricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  detailMetricBox: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
