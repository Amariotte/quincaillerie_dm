import { AppHeader } from '@/components/app-header';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchBonAchatById } from '@/services/api-service';
import { BONS_ACHATS_LIST_CACHE_KEY, getCacheData, setCacheData } from '@/services/cache-service';
import { sharedStyles } from '@/styles/shared.js';
import { formatAmount, formatDate } from '@/tools/tools';
import { bonAchat, listBonAchats } from '@/types/bon-achats.type';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style';

export default function BonAchatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor } = useAppTheme();
  const { userToken } = useAuthContext();
  const [bonAchat, setBonAchat] = useState<bonAchat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const routeId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    let isMounted = true;

    const loadBonAchat = async () => {
      try {
        const cachedBons = await getCacheData<listBonAchats>(BONS_ACHATS_LIST_CACHE_KEY);
        const cachedBon = cachedBons?.data.find((item) => item.id === routeId);

        if (isMounted) {
          setBonAchat(cachedBon ?? null);
        }

        if (!userToken || !routeId) {
          return;
        }

        const data = await getfetchBonAchatById(userToken, routeId);
        if (data) {
          if (isMounted) {
            setBonAchat(data);
          }

          const currentData = cachedBons?.data ?? [];
          const existsInCache = currentData.some((item) => item.id === data.id);
          const updatedData = existsInCache
            ? currentData.map((item) => (item.id === data.id ? data : item))
            : [data, ...currentData];

          await setCacheData(BONS_ACHATS_LIST_CACHE_KEY, {
            meta: cachedBons?.meta ?? { page: 1, next: 1, totalPages: 1, total: updatedData.length, size: updatedData.length },
            data: updatedData,
          });
        }

      } catch {
        if (isMounted) {
          setBonAchat(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadBonAchat();
    return () => {
      isMounted = false;
    };
  }, [routeId, userToken]);

  if (isLoading && !bonAchat) {
    return (
      <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
          <AppHeader showBack title="Détail bon d'achat" subtitle="Chargement en cours" />
        </View>
        <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
          <View style={sharedStyles.container}>
            <View style={[sharedStyles.emptyCard, { backgroundColor: cardColor }]}> 
              <ActivityIndicator size="large" color={tintColor} />
              <Text style={[sharedStyles.emptyTitle, { color: textColor }]}>Chargement du bon d'achat</Text>
              <Text style={[sharedStyles.emptyText, { color: mutedColor }]}>Les informations détaillées sont en cours de récupération.</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!bonAchat) {
    return (
      <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
          <AppHeader showBack title="Détail bon d'achat" subtitle="Document introuvable" />
        </View>
        <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
          <View style={sharedStyles.container}>
            <EmptyResultsCard
              iconName="error-outline"
              title="Bon d'achat introuvable"
              subtitle="Ce bon d'achat n'existe pas ou a été supprimé."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const isExpired = bonAchat.dateExpBa ? new Date(bonAchat.dateExpBa).getTime() < Date.now() : false;
  const statusLabel = isExpired ? 'Expiré' : bonAchat.etatBa === 1 ? 'Actif' : 'Inactif';
  const statusColor = isExpired ? '#dc2626' : bonAchat.etatBa === 1 ? '#16a34a' : '#d97706';
  const bonAchatLines = bonAchat.details ?? [];
  const totalAllocatedAmount = bonAchatLines.reduce((sum, line) => sum + (line.montantRegDoc ?? 0), 0);
  const remainingAmount = Math.max(bonAchat.montantBa - totalAllocatedAmount, 0);
  const canBeUsedByOtherClients = bonAchat.autreClientUse ? 'Oui' : 'Non';
  const restrictedToAgency = bonAchat.uniqueAgence ? 'Oui' : 'Non';
  const uniqueUseLabel = bonAchat.uniqueUse ? 'Oui' : 'Non';

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Détail bon d'achat" subtitle={bonAchat.numeroBa} />
      </View>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={sharedStyles.container}>
          {isLoading ? (
            <View style={[sharedStyles.loadingBanner, { backgroundColor: cardColor }]}> 
              <ActivityIndicator size="small" color={tintColor} />
              <Text style={[sharedStyles.loadingText, { color: mutedColor }]}>Chargement des informations en cours...</Text>
            </View>
          ) : null}

          <View style={styles.ticketCard}>
            <View style={styles.ticketShadow} />
            <View style={styles.ticketBody}>
              <View style={styles.ticketLeftPanel}>
                <View style={styles.ticketHeaderRow}>
                  <View style={styles.ticketRefBlock}>
                    <Text style={styles.ticketEyebrow}>BON D&apos;ACHAT</Text>
                    <Text style={styles.ticketRef}>{bonAchat.numeroBa?.trim() ? bonAchat.numeroBa : 'Bon sans numero'}</Text>
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
                      <Text style={styles.ticketMetaValue} numberOfLines={1}>{bonAchat.nomAgence || '—'}</Text>
                    </View>
                    <View style={styles.ticketMetaItem}>
                      <Text style={styles.ticketMetaLabel}>Créé le</Text>
                      <Text style={styles.ticketMetaValue}>{bonAchat.dateBa ? formatDate(bonAchat.dateBa) : '—'}</Text>
                    </View>
                  </View>
                </View>

                <View style={detailStyles.detailMetaGrid}>
                  <View style={detailStyles.detailMetaChip}>
                    <Text style={detailStyles.detailMetaChipLabel}>Usage</Text>
                    <Text style={detailStyles.detailMetaChipValue}>{uniqueUseLabel}</Text>
                  </View>
                  <View style={detailStyles.detailMetaChip}>
                    <Text style={detailStyles.detailMetaChipLabel}>Autres clients</Text>
                    <Text style={detailStyles.detailMetaChipValue}>{canBeUsedByOtherClients}</Text>
                  </View>
                  <View style={detailStyles.detailMetaChip}>
                    <Text style={detailStyles.detailMetaChipLabel}>Agence unique</Text>
                    <Text style={detailStyles.detailMetaChipValue}>{restrictedToAgency}</Text>
                  </View>
                </View>

                <View style={styles.ticketFooterRow}>
                  <View style={styles.ticketTag}>
                    <MaterialIcons name="payments" size={14} color="#0f766e" />
                    <Text style={styles.ticketTagText}>Coût {formatAmount(bonAchat.CoutBa ?? 0)}</Text>
                  </View>
                  <View style={styles.ticketArrowWrap}>
                    <Text style={styles.ticketArrowText}>Solde {formatAmount(remainingAmount)}</Text>
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
                  <Text style={styles.ticketAmountText}>{formatAmount(bonAchat.montantBa)}</Text>
                </View>
                <View style={styles.ticketExpiryBlock}>
                  <Text style={styles.ticketExpiryLabel}>Validité</Text>
                  <Text style={styles.ticketExpiryValue}>{bonAchat.dateExpBa ? formatDate(bonAchat.dateExpBa) : '—'}</Text>
                </View>
                <View style={styles.ticketMiniBadge}>
                  <Text style={styles.ticketMiniBadgeText}>{bonAchatLines.length} ligne{bonAchatLines.length > 1 ? 's' : ''}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[detailStyles.summaryCard, { backgroundColor: '#fff8e1' }]}> 
            <View style={detailStyles.sectionHeader}>
              <MaterialIcons name="analytics" size={20} color="#5b1d2c" />
              <Text style={detailStyles.sectionTitle}>Synthèse du bon</Text>
            </View>
            <View style={sharedStyles.summaryRow}>
              <Text style={[sharedStyles.summaryLabel, { color: mutedColor }]}>Montant du bon</Text>
              <Text style={[detailStyles.summaryValueStrong, { color: '#5b1d2c' }]}>{formatAmount(bonAchat.montantBa)}</Text>
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
});