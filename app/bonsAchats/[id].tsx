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
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  const openTicket = async () => {
    Alert.alert(
      'Informations du bon d\'achat',
      [
        `Numéro: ${bonAchat.numeroBa}`,
        `Date: ${bonAchat.dateBa ? formatDate(bonAchat.dateBa) : '—'}`,
        `Date d'expiration: ${bonAchat.dateExpBa ? formatDate(bonAchat.dateExpBa) : '—'}`,
        `Agence: ${bonAchat.nomAgence ?? '—'}`,
        `Montant: ${formatAmount(bonAchat.montantBa)}`,
        `Statut: ${statusLabel}`,
      ].join('\n')
    );
  };

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

          <View style={[sharedStyles.headerCard, { backgroundColor: cardColor }]}> 
            <View style={sharedStyles.headerTopRow}>
              <Text style={[sharedStyles.clientName, { color: textColor }]}>{bonAchat.numeroBa?.trim() ? bonAchat.numeroBa : 'Bon sans numero'}</Text>
                <View style={sharedStyles.headerActionsRow}>
      
                  <TouchableOpacity
                    onPress={openTicket}
                    style={[sharedStyles.headerActionButton, { backgroundColor: `${tintColor}18` }]}
                  >
                    <MaterialIcons name="receipt-long" size={16} color={tintColor} />
                    <View style={[sharedStyles.infoBubble, { backgroundColor: tintColor }]}>
                      <Text style={sharedStyles.infoBubbleText}>i</Text>
                    </View>
                  </TouchableOpacity>
                </View>
             
            </View>
            
            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Date : {bonAchat.dateBa ? formatDate(bonAchat.dateBa) : '—'}</Text>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Date d'expiration : {bonAchat.dateExpBa ? formatDate(bonAchat.dateExpBa) : '—'}</Text>
            </View>
             <View style={[sharedStyles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
              <Text style={[sharedStyles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Agence : {bonAchat.nomAgence ?? '—'}</Text>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Usage unique : {uniqueUseLabel}</Text>
            </View>
            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Autres clients autorisés : {canBeUsedByOtherClients}</Text>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Limité à une agence : {restrictedToAgency}</Text>
            </View>
            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Coût d'acquisition : {formatAmount(bonAchat.CoutBa ?? 0)}</Text>
            </View>
           
          </View>

          <View style={[sharedStyles.summaryCard, { backgroundColor: cardColor }]}> 
            <View style={sharedStyles.summaryRow}>
              <Text style={[sharedStyles.summaryLabel, { color: mutedColor }]}>Montant du bon d'achat</Text>
              <Text style={[sharedStyles.summaryValue, { color: textColor }]}>{formatAmount(bonAchat.montantBa)}</Text>
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
              <Text style={[sharedStyles.summaryValue, { color: textColor }]}>{formatAmount(remainingAmount)}</Text>
            </View>
            <View style={sharedStyles.separator} />
            <View style={sharedStyles.summaryRow}>
              <Text style={[sharedStyles.totalLabel, { color: textColor }]}>Statut du bon</Text>
              <Text style={[sharedStyles.totalValue, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>

          <View style={[sharedStyles.linesCard, { backgroundColor: cardColor }]}> 
            <Text style={[sharedStyles.sectionTitle, { color: textColor }]}>Répartition du bon d'achat</Text>
            <View style={sharedStyles.linesBlock}>
              {bonAchatLines.length === 0 ? (
                <Text style={[sharedStyles.emptyText, { color: mutedColor }]}>Aucune ligne de répartition n'est disponible pour ce bon d'achat.</Text>
              ) : (
                bonAchatLines.map((line) => (
                  <View key={line.id} style={sharedStyles.lineRow}>
                    <View style={sharedStyles.lineLeft}>
                      <Text style={[sharedStyles.lineLabel, { color: textColor }]}>{line.codeDoc || 'Document sans code'}</Text>
                      <Text style={[sharedStyles.lineMeta, { color: mutedColor }]}>Type : {line.typeDoc}</Text>
                      <Text style={[sharedStyles.lineMeta, { color: mutedColor }]}>Date document : {formatDate(line.dateDoc)}</Text>
                      <Text style={[sharedStyles.lineMeta, { color: mutedColor }]}>Montant document : {formatAmount(line.montantDoc)}</Text>
                    </View>
                    <Text style={[sharedStyles.lineTotal, { color: textColor }]}>{formatAmount(line.montantRegDoc)}</Text>
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