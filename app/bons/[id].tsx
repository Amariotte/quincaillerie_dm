import { AppHeader } from '@/components/app-header';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchBonLivraisonById } from '@/services/api-service';
import { BONS_LIVRAISONS_LIST_CACHE_KEY, getCacheData, setCacheData } from '@/services/cache-service';
import { sharedStyles } from '@/styles/shared.js';
import { bonLivraison, listBonLivraisons } from '@/types/bon-livraisons.type';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function BonLivraisonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor } = useAppTheme();
  const { userToken } = useAuthContext();
  const [bonLivraison, setBonLivraison] = useState<bonLivraison | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const routeId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    const loadBonLivraison = async () => {
      try {
        const cachedBonLivraisons = await getCacheData<listBonLivraisons>(BONS_LIVRAISONS_LIST_CACHE_KEY);
        const bonLivraison = cachedBonLivraisons?.data.find((item) => item.id === routeId);
        setBonLivraison(bonLivraison ?? null);

        if (!userToken || !routeId) {
          return;
        }

        const data = await getfetchBonLivraisonById(userToken, routeId);
        if (data) {
          setBonLivraison(data);

          const currentData = cachedBonLivraisons?.data ?? [];
          const existsInCache = currentData.some((item) => item.id === data.id);
          const updatedData = existsInCache
            ? currentData.map((item) => (item.id === data.id ? data : item))
            : [data, ...currentData];

          await setCacheData(BONS_LIVRAISONS_LIST_CACHE_KEY, {
            meta: cachedBonLivraisons?.meta ?? { page: 1, next: 1, totalPages: 1, total: updatedData.length, size: updatedData.length },
            data: updatedData,
          });
        }

      } catch {
        setBonLivraison(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadBonLivraison();
  }, [routeId, userToken]);

  const bl = bonLivraison;

  if (isLoading && !bl) {
    return (
      <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
        <View style={sharedStyles.fixedHeader}>
          <AppHeader showBack title="Détail bon de livraison" subtitle="Chargement en cours" />
        </View>
        <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
          <View style={sharedStyles.container}>
            <View style={[sharedStyles.headerCard, { backgroundColor: cardColor, alignItems: 'center' }]}> 
              <ActivityIndicator size="large" color={tintColor} />
              <Text style={[sharedStyles.metaCaption, { color: mutedColor, textAlign: 'center' }]}>Chargement du bon de livraison...</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!bl) {
    return (
      <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
        <View style={sharedStyles.fixedHeader}>
          <AppHeader showBack title="Détail bon de livraison" subtitle="Document introuvable" />
        </View>
        <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
          <View style={sharedStyles.container}>
            <EmptyResultsCard
              iconName="error-outline"
              title="Bon introuvable"
              subtitle="Ce bon de livraison n'existe pas ou a été supprimé."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const blLines = bl.details ?? [];
  const totalDeliveredQuantity = blLines.reduce((sum, line) => sum + (line.qteLivree || 0), 0);
  const receiverIdentity = bl.nomRecepteur?.trim() || '—';
  const receiverDocument = bl.numPieceRecepteur?.trim() || '—';
  const receiverDocumentType = bl.libTypePiece?.trim() || '—';
  const deliveryDescription = bl.descBL?.trim() || bl.descRecepBL?.trim() || 'Aucune description disponible';

  const openTicket = async () => {
    Alert.alert(
      'Informations de livraison',
      [
        `Code: ${bl.codeBL}`,
        `Date: ${new Date(bl.dateBL).toLocaleDateString('fr-FR')}`,
        `Livraison: ${bl.dateLivraison ? new Date(bl.dateLivraison).toLocaleDateString('fr-FR') : '—'}`,
        `Livreur: ${bl.nomLivreur?.trim() || '—'}`,
        `Récepteur: ${receiverIdentity}`,
        `Lieu: ${bl.lieuLivraison?.trim() || '—'}`,
      ].join('\n')
    );
  };

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
      <View style={sharedStyles.fixedHeader}>
        <AppHeader showBack title="Détail bon de livraison" subtitle={bl.codeBL} />
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
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Date : {new Date(bl.dateBL).toLocaleDateString('fr-FR')}</Text>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Date livraison : {bl.dateLivraison ? new Date(bl.dateLivraison).toLocaleDateString('fr-FR') : '—'}</Text>
            </View>
            
            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Agence : {bl.nomAgence ?? '—'}</Text>
            </View>
            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Véhicule : {bl.vehiculeLivreur ?? '—'}</Text>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Livreur : {bl.nomLivreur ?? '—'}</Text>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Lieu livraison : {bl.lieuLivraison ?? '—'}</Text>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Nom récepteur : {receiverIdentity}</Text>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>{receiverDocumentType} : {receiverDocument}</Text>
            </View>
            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>{deliveryDescription}</Text>
            </View>
           
          </View>

          <View style={[sharedStyles.linesCard, { backgroundColor: cardColor }]}> 
            <Text style={[sharedStyles.sectionTitle, { color: textColor }]}>Articles</Text>
            <View style={sharedStyles.linesBlock}>
              {blLines.length === 0 ? (
                <Text style={[sharedStyles.metaCaption, { color: mutedColor, textAlign: 'center' }]}>Aucune ligne de livraison disponible pour ce document.</Text>
              ) : (
                blLines.map((line) => (
                  <View key={line.id} style={sharedStyles.lineRow}>
                    <View style={sharedStyles.lineLeft}>
                      <Text style={[sharedStyles.lineLabel, { color: textColor }]}>{line.designation}</Text>
                      <Text style={[sharedStyles.lineMeta, { color: mutedColor }]}>Référence: {line.reference || '—'}</Text>
                    </View>
                    <Text style={[sharedStyles.lineTotal, { color: textColor }]}>{line.qteLivree}</Text>
                  </View>
                ))
              )}
            </View>
          </View>

          <View style={[sharedStyles.summaryCard, { backgroundColor: cardColor }]}> 
            <View style={sharedStyles.summaryRow}>
              <Text style={[sharedStyles.summaryLabel, { color: mutedColor }]}>Code document</Text>
              <Text style={[sharedStyles.summaryValue, { color: textColor }]}>{bl.codeBL}</Text>
            </View>
            <View style={sharedStyles.summaryRow}>
              <Text style={[sharedStyles.summaryLabel, { color: mutedColor }]}>Articles livrés</Text>
              <Text style={[sharedStyles.summaryValue, { color: textColor }]}>{blLines.length}</Text>
            </View>
            <View style={sharedStyles.summaryRow}>
              <Text style={[sharedStyles.summaryLabel, { color: mutedColor }]}>Quantité totale</Text>
              <Text style={[sharedStyles.summaryValue, { color: textColor }]}>{totalDeliveredQuantity}</Text>
            </View>
            <View style={sharedStyles.summaryRow}>
              <Text style={[sharedStyles.summaryLabel, { color: mutedColor }]}>Récepteur</Text>
              <Text style={[sharedStyles.summaryValue, { color: textColor }]}>{receiverIdentity}</Text>
            </View>
            <View style={sharedStyles.separator} />
            <View style={sharedStyles.summaryRow}>
              <Text style={[sharedStyles.totalLabel, { color: textColor }]}>Livraison enregistrée</Text>
              <Text style={[sharedStyles.totalValue, { color: tintColor }]}>{bl.dateLivraison ? new Date(bl.dateLivraison).toLocaleDateString('fr-FR') : 'En attente'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}