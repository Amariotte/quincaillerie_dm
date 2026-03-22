import { AppHeader } from '@/components/app-header';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchDevisById } from '@/services/api-service';
import { DEVIS_LIST_CACHE_KEY, getCacheData, setCacheData } from '@/services/cache-service';
import { formatAmount, MAIN_ACCOUNT_FILTER } from '@/tools/tools';
import { devis, listDevis, statusDevisColorMap } from '@/types/devis.type';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style.js';


export default function ProformaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor } = useAppTheme();
  const { userToken } = useAuthContext();
  const [proforma, setProforma] = useState<devis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProformas = async () => {
      try {
        const cachedProformas = await getCacheData<listDevis>(DEVIS_LIST_CACHE_KEY);
        const proforma = cachedProformas?.data.find((item) => item.id === id);
        setProforma(proforma ?? null);

        if (!userToken || !id) {
          return;
        }

        const data = await getfetchDevisById(userToken, id);
        if (data) {
          setProforma(data);

          const currentData = cachedProformas?.data ?? [];
          const existsInCache = currentData.some((item) => item.id === data.id);
          const updatedData = existsInCache
            ? currentData.map((item) => (item.id === data.id ? data : item))
            : [data, ...currentData];

          await setCacheData(DEVIS_LIST_CACHE_KEY, {
            meta: cachedProformas?.meta ?? { page: 1, next: 1, totalPages: 1, total: updatedData.length, size: updatedData.length },
            data: updatedData,
          });
        }

      } catch {
        setProforma(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProformas();
  }, [id, userToken]);

  const devis = proforma;

  if (!devis) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
          <AppHeader showBack title="Détail de la proforma" subtitle="Document introuvable" />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <EmptyResultsCard
              iconName="error-outline"
              title="Proforma introuvable"
              subtitle="Cette proforma n'existe pas ou a été supprimée."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const statusColor = statusDevisColorMap[devis.status];
  const invoiceLines = devis.details ?? [];

 
  const openTicket = async () => {
      return;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader showBack title="Détail de la proforma" subtitle={devis.codeDevis} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={[styles.headerCard, { backgroundColor: cardColor }]}> 
            <View style={styles.headerTopRow}>
              <Text style={[styles.clientName, { color: textColor }]}>{devis.nomSousCompte?.trim() ? devis.nomSousCompte : MAIN_ACCOUNT_FILTER}</Text>
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
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Émise le : {new Date(devis.dateDevis).toLocaleDateString('fr-FR')}</Text>
            </View>
             <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{devis.status}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Agence : {devis.nomAgence ?? '—'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Opérateur saisie : {devis.operateurSaisie ?? '—'}</Text>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Opérateur validation : {devis.operateurValidation ?? '—'}</Text>
            </View>
           
          </View>

          <View style={[styles.linesCard, { backgroundColor: cardColor }]}> 
            <Text style={[styles.sectionTitle, { color: textColor }]}>Articles</Text>
            <View style={styles.linesBlock}>
              {invoiceLines.map((line) => (
                <View key={line.id} style={styles.lineRow}>
                  <View style={styles.lineLeft}>
                    <Text style={[styles.lineLabel, { color: textColor }]}>{line.designation}</Text>
                    {line.nomSuplementaire ? (
                      <Text style={[styles.lineMeta, { color: mutedColor }]}>Supplémentaire: {line.nomSuplementaire}</Text>
                    ) : null}
                    {line.descPackage ? (
                      <Text style={[styles.lineMeta, { color: mutedColor }]}>Package: {line.descPackage}</Text>
                    ) : null}
                    <Text style={[styles.lineMeta, { color: mutedColor }]}>{line.qteVendue} × {formatAmount(line.prixVenteTTC)}</Text>
                    {line.txRemise > 0 ? (
                      <Text style={[styles.lineMeta, { color: mutedColor }]}>Tx remise: {line.txRemise}% • Remise prix: {formatAmount(line.remisePrix)}</Text>
                    ) : null}
                    {line.qteGratuite > 0 ? (
                      <Text style={[styles.lineMeta, { color: mutedColor }]}>Qté gratuite: {line.qteGratuite} • TVA: {line.txTaxe}% ({formatAmount(line.montantTaxe)})</Text>
                    ) : null}
                    {line.montantHT > 0 || line.montantTTC > 0 ? (
                      <Text style={[styles.lineMeta, { color: mutedColor }]}>Totaux ligne HT/TTC: {formatAmount(line.montantHT)} / {formatAmount(line.montantTTC)}</Text>
                    ) : null}
                  </View>
                  <Text style={[styles.lineTotal, { color: textColor }]}>{formatAmount(line.montantTTC)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: cardColor }]}> 
              <>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: mutedColor }]}>Total brut HT</Text>
                  <Text style={[styles.summaryValue, { color: textColor }]}>{formatAmount(devis.totalHT)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: mutedColor }]}>Total brut TTC</Text>
                  <Text style={[styles.summaryValue, { color: textColor }]}>{formatAmount(devis.totalNetPayer)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: mutedColor }]}>Total remise HT</Text>
                  <Text style={[styles.summaryValue, { color: textColor }]}>{formatAmount(devis.totalRemCialeHT)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: mutedColor }]}>Total remise TTC</Text>
                  <Text style={[styles.summaryValue, { color: textColor }]}>{formatAmount(devis.totalRemCialeTTC)}</Text>
                </View>
              </>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: mutedColor }]}>Sous-total</Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>{formatAmount(devis.totalHT)}</Text>
            </View>

        

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: mutedColor }]}>TVA</Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>{formatAmount(devis.totalTaxe)}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: textColor }]}>Total à payer</Text>
              <Text style={[styles.totalValue, { color: tintColor }]}>{formatAmount(devis.totalNetPayer)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}