import { AppHeader } from '@/components/app-header';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchCommissionById } from '@/services/api-service';
import { COMMISSIONS_LIST_CACHE_KEY, getCacheData, setCacheData } from '@/services/cache-service';
import { sharedStyles } from '@/styles/shared.js';
import { formatAmount, MAIN_ACCOUNT_FILTER } from '@/tools/tools';
import { commission, listCommissions } from '@/types/commissions.type.js';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function CommissionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor } = useAppTheme();
  const { userToken } = useAuthContext();
  const [commission, setCommission] = useState<commission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCommissions = async () => {
      try {
        const cachedCommissions = await getCacheData<listCommissions>(COMMISSIONS_LIST_CACHE_KEY);
        const commission = cachedCommissions?.data.find((item) => item.id === id);
        setCommission(commission ?? null);

        if (!userToken || !id) {
          return;
        }

        const data = await getfetchCommissionById(userToken, id);
        if (data) {
          setCommission(data);

          const currentData = cachedCommissions?.data ?? [];
          const existsInCache = currentData.some((item) => item.id === data.id);
          const updatedData = existsInCache
            ? currentData.map((item) => (item.id === data.id ? data : item))
            : [data, ...currentData];

          await setCacheData(COMMISSIONS_LIST_CACHE_KEY, {
            meta: cachedCommissions?.meta ?? { page: 1, next: 1, totalPages: 1, total: updatedData.length, size: updatedData.length },
            data: updatedData,
          });
        }

      } catch {
        setCommission(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommissions();
  }, [id, userToken]);

  if (isLoading && !commission) {
    return (
      <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
          <AppHeader showBack title="Détail commission" subtitle="Chargement en cours" />
        </View>
        <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
          <View style={sharedStyles.container}>
            <View style={[sharedStyles.emptyCard, { backgroundColor: cardColor }]}> 
              <ActivityIndicator size="large" color={tintColor} />
              <Text style={[sharedStyles.emptyTitle, { color: textColor }]}>Chargement de la commission</Text>
              <Text style={[sharedStyles.emptyText, { color: mutedColor }]}>Les informations détaillées sont en cours de récupération.</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!commission) {
    return (
      <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
          <AppHeader showBack title="Détail commission" subtitle="Document introuvable" />
        </View>
        <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
          <View style={sharedStyles.container}>
            <EmptyResultsCard
              iconName="error-outline"
              title="Commission introuvable"
              subtitle="Cette commission n'existe pas ou a été supprimée."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const commissionLines = commission.details ?? [];

  const openTicket = async () => {
      return;
    };

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Détail commission" subtitle={commission.codeCom} />
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
              <Text style={[sharedStyles.clientName, { color: textColor }]}>{commission.nomSousCompte?.trim() ? commission.nomSousCompte : MAIN_ACCOUNT_FILTER}</Text>
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
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Date : {new Date(commission.dateCom).toLocaleDateString('fr-FR')}</Text>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Code la vente : {commission.codeVente ?? '—'}</Text>
                       <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Date de la vente : {commission.dateVente ? new Date(commission.dateVente).toLocaleDateString('fr-FR') : '—'}</Text>

            </View>
             
            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>Agence : {commission.nomAgence ?? '—'}</Text>
            </View>
          
           
          </View>

          <View style={[sharedStyles.linesCard, { backgroundColor: cardColor }]}> 
            <Text style={[sharedStyles.sectionTitle, { color: textColor }]}>Répartition de la commission</Text>
            <View style={sharedStyles.linesBlock}>
              {commissionLines.map((line) => (
                <View key={line.id} style={sharedStyles.lineRow}>
                  <View style={sharedStyles.lineLeft}>
                    <Text style={[sharedStyles.lineLabel, { color: textColor }]}>{line.codeDoc}</Text>
                    {line.codeDoc ? (
                      <Text style={[sharedStyles.lineMeta, { color: mutedColor }]}>Type: {line.typeDoc}</Text>
                    ) : null}
                    
                   
                                   
                  </View>
                  <Text style={[sharedStyles.lineTotal, { color: textColor }]}>{formatAmount(line.montantRegDoc)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}