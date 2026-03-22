import { AppHeader } from '@/components/app-header';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchCommissionById } from '@/services/api-service';
import { COMMISSIONS_LIST_CACHE_KEY, getCacheData, setCacheData } from '@/services/cache-service';
import { formatAmount } from '@/tools/tools';
import { commission, listCommissions } from '@/types/commissions.type.js';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style.js';


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

  if (!commission) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <AppHeader showBack title="Détail commission" subtitle="Document introuvable" />

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader showBack title="Détail commission" subtitle={commission.codeCom} />

          <View style={[styles.headerCard, { backgroundColor: cardColor }]}> 
            <View style={styles.headerTopRow}>
              <Text style={[styles.clientName, { color: textColor }]}>{commission.nomSousCompte}</Text>
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
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Date : {new Date(commission.dateCom).toLocaleDateString('fr-FR')}</Text>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Code la vente : {commission.codeVente ?? '—'}</Text>
                       <Text style={[styles.metaLabel, { color: mutedColor }]}>Date de la vente : {commission.dateVente ? new Date(commission.dateVente).toLocaleDateString('fr-FR') : '—'}</Text>

            </View>
             
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Agence : {commission.nomAgence ?? '—'}</Text>
            </View>
          
           
          </View>

          <View style={[styles.linesCard, { backgroundColor: cardColor }]}> 
            <Text style={[styles.sectionTitle, { color: textColor }]}>Répartition de la commission</Text>
            <View style={styles.linesBlock}>
              {commissionLines.map((line) => (
                <View key={line.id} style={styles.lineRow}>
                  <View style={styles.lineLeft}>
                    <Text style={[styles.lineLabel, { color: textColor }]}>{line.codeDoc}</Text>
                    {line.codeDoc ? (
                      <Text style={[styles.lineMeta, { color: mutedColor }]}>Type: {line.typeDoc}</Text>
                    ) : null}
                    
                   
                                   
                  </View>
                  <Text style={[styles.lineTotal, { color: textColor }]}>{formatAmount(line.montantRegDoc)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}