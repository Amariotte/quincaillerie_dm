import { AppHeader } from '@/components/app-header';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchReglementById } from '@/services/api-service';
import { getCacheData, REGLEMENTS_LIST_CACHE_KEY, setCacheData } from '@/services/cache-service';
import { formatAmount, formatDate, MAIN_ACCOUNT_FILTER } from '@/tools/tools';
import { listReglements, reglement, statusEncaisseColorMap } from '@/types/reglements.type';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style.js';


export default function ReglementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor } = useAppTheme();
  const { userToken } = useAuthContext();
  const [reglement, setReglement] = useState<reglement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const routeId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    let isMounted = true;

    const loadReglements = async () => {
      try {
        const cachedReglements = await getCacheData<listReglements>(REGLEMENTS_LIST_CACHE_KEY);
        const cachedReglement = cachedReglements?.data.find((item) => item.id === routeId);

        if (isMounted) {
          setReglement(cachedReglement ?? null);
        }

        if (!userToken || !routeId) {
          return;
        }

        const data = await getfetchReglementById(userToken, routeId);
        if (data) {
          if (isMounted) {
            setReglement(data);
          }

          const currentData = cachedReglements?.data ?? [];
          const existsInCache = currentData.some((item) => item.id === data.id);
          const updatedData = existsInCache
            ? currentData.map((item) => (item.id === data.id ? data : item))
            : [data, ...currentData];

          await setCacheData(REGLEMENTS_LIST_CACHE_KEY, {
            meta: cachedReglements?.meta ?? { page: 1, next: 1, totalPages: 1, total: updatedData.length, size: updatedData.length },
            data: updatedData,
          });
        }

      } catch {
        if (isMounted) {
          setReglement(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadReglements();
    return () => {
      isMounted = false;
    };
  }, [routeId, userToken]);

  if (isLoading && !reglement) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
          <AppHeader showBack title="Détail règlement" subtitle="Chargement en cours" />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <View style={[styles.emptyCard, { backgroundColor: cardColor }]}> 
              <ActivityIndicator size="large" color={tintColor} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Chargement du règlement</Text>
              <Text style={[styles.emptyText, { color: mutedColor }]}>Les informations détaillées sont en cours de récupération.</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!reglement) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
          <AppHeader showBack title="Détail règlement" subtitle="Document introuvable" />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <EmptyResultsCard
              iconName="error-outline"
              title="Règlement introuvable"
              subtitle="Ce règlement n'existe pas ou a été supprimé."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const statusColor = statusEncaisseColorMap[reglement.statusEncaisse ?? 'Non encaissé'] || tintColor;
  const reglementLines = reglement.details ?? [];
  const totalAllocatedAmount = reglementLines.reduce((sum, line) => sum + line.montantRegDoc, 0);
  const paymentReference = reglement.refReg?.trim() || '—';
  const paymentMode = reglement.nomModePaiement?.trim() || '—';
  const paymentDescription = reglement.descReg?.trim() || 'Aucune description';
  const paymentStatus = reglement.statusEncaisse ?? 'Non encaissé';

  const openTicket = async () => {
    Alert.alert(
      'Informations du règlement',
      [
        `Code: ${reglement.codeReg}`,
        `Référence: ${paymentReference}`,
        `Mode de paiement: ${paymentMode}`,
        `Montant: ${formatAmount(reglement.montantReg)}`,
        `Statut: ${paymentStatus}`,
      ].join('\n')
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Détail règlement" subtitle={reglement.codeReg} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {isLoading ? (
            <View style={[styles.loadingBanner, { backgroundColor: cardColor }]}> 
              <ActivityIndicator size="small" color={tintColor} />
              <Text style={[styles.loadingText, { color: mutedColor }]}>Chargement des informations en cours...</Text>
            </View>
          ) : null}

          <View style={[styles.headerCard, { backgroundColor: cardColor }]}> 
            <View style={styles.headerTopRow}>
              <Text style={[styles.clientName, { color: textColor }]}>{reglement.nomSousCompte?.trim() ? reglement.nomSousCompte : MAIN_ACCOUNT_FILTER}</Text>
                <View style={styles.headerActionsRow}>
      
                  <TouchableOpacity
                    onPress={openTicket}
                    style={[styles.headerActionButton, { backgroundColor: `${tintColor}18` }]}
                  >
                    <MaterialIcons name="receipt-long" size={16} color={tintColor} />
                    <View style={[styles.infoBubble, { backgroundColor: tintColor }]}>
                      <Text style={styles.infoBubbleText}>i</Text>
                    </View>
                  </TouchableOpacity>
                </View>
             
            </View>
            
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Date : {reglement.dateReg ? formatDate(reglement.dateReg) : '—'}</Text>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Date d'encaissement : {reglement.dateEncaissement ? formatDate(reglement.dateEncaissement) : '—'}</Text>
            </View>
             <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{reglement.statusEncaisse}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Agence : {reglement.nomAgence ?? '—'}</Text>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Caisse : {reglement.nomCompte ?? '—'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Référence : {paymentReference}</Text>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Mode de paiement : {paymentMode}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Opérateur saisie : {reglement.operateurSaisie ?? '—'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>{paymentDescription}</Text>
            </View>
           
          </View>

          <View style={[styles.summaryCard, { backgroundColor: cardColor }]}> 
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: mutedColor }]}>Montant du règlement</Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>{formatAmount(reglement.montantReg)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: mutedColor }]}>Montant réparti</Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>{formatAmount(totalAllocatedAmount)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: mutedColor }]}>Nombre de lignes</Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>{reglementLines.length}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: textColor }]}>Statut d'encaissement</Text>
              <Text style={[styles.totalValue, { color: statusColor }]}>{paymentStatus}</Text>
            </View>
          </View>

          <View style={[styles.linesCard, { backgroundColor: cardColor }]}> 
            <Text style={[styles.sectionTitle, { color: textColor }]}>Répartition du règlement</Text>
            <View style={styles.linesBlock}>
              {reglementLines.length === 0 ? (
                <Text style={[styles.emptyText, { color: mutedColor }]}>Aucune ligne de répartition n'est disponible pour ce règlement.</Text>
              ) : (
                reglementLines.map((line) => (
                  <View key={line.id} style={styles.lineRow}>
                    <View style={styles.lineLeft}>
                      <Text style={[styles.lineLabel, { color: textColor }]}>{line.codeDoc || 'Document sans code'}</Text>
                      <Text style={[styles.lineMeta, { color: mutedColor }]}>Type : {line.typeDoc}</Text>
                      <Text style={[styles.lineMeta, { color: mutedColor }]}>Date document : {formatDate(line.dateDoc)}</Text>
                      <Text style={[styles.lineMeta, { color: mutedColor }]}>Montant document : {formatAmount(line.montantDoc)}</Text>
                    </View>
                    <Text style={[styles.lineTotal, { color: textColor }]}>{formatAmount(line.montantRegDoc)}</Text>
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