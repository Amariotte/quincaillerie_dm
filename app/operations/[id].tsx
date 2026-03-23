import { AppHeader } from '@/components/app-header';
import { EmptyResultsCard } from '@/components/empty-results-card';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { formatAmount, formatDate, MAIN_ACCOUNT_FILTER } from '@/tools/tools';
import { operation, typeMouvementColorMap } from '@/types/operations.type';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style.js';


export default function OperationDetailScreen() {
  const { id, operation: operationParam } = useLocalSearchParams<{ id: string; operation?: string }>();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor } = useAppTheme();
  const { userToken } = useAuthContext();
  const [operationData, setOperationData] = useState<operation | null>(() => {
    // If operation is passed as parameter, parse it and use it
    if (operationParam) {
      try {
        return JSON.parse(operationParam) as operation;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(!operationParam);


  const operation_item = operationParam ? JSON.parse(operationParam) as operation : operationData;

  if (!operation_item) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
        <View style={styles.fixedHeader}>
          <AppHeader showBack title="Détail opération" subtitle="Document introuvable" />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <EmptyResultsCard
              iconName="error-outline"
              title="Opération introuvable"
              subtitle="Cette opération n'existe pas ou a été supprimée."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const operationType = operation_item.libType ?? 'Décaissement';
  const typeColor = typeMouvementColorMap[operationType];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <View style={styles.fixedHeader}>
        <AppHeader showBack title="Détail de l'opération" subtitle={operation_item.codeOp} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header Card - Informations principales */}
          <View style={[styles.headerCard, { backgroundColor: cardColor }]}> 
            <View style={styles.headerTopRow}>
              <Text style={[styles.clientName, { color: textColor }]}>
                {operation_item.nomSousCompte?.trim() ? operation_item.nomSousCompte : MAIN_ACCOUNT_FILTER}
              </Text>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: `${typeColor}18` }]}>
              <Text style={[styles.statusText, { color: typeColor }]}>{operationType}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Date : {formatDate(operation_item.dateOp)}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Agence : {operation_item.nomAgence ?? '—'}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Mode paiement : {operation_item.nomModePaiement ?? '—'}</Text>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Référence : {operation_item.refOp ?? '—'}</Text>
            </View>
          </View>

          {/* Description Card */}

         <View style={[styles.linesCard, { backgroundColor: cardColor }]}> 
              <Text style={[styles.sectionTitle, { color: textColor }]}>Rubrique</Text>
              <Text style={[styles.descriptionText, { color: textColor }]}>{operation_item.libRubrique}</Text>
            </View>


          {operation_item.descOp && (
            <View style={[styles.linesCard, { backgroundColor: cardColor }]}> 
              <Text style={[styles.sectionTitle, { color: textColor }]}>Description</Text>
              <Text style={[styles.descriptionText, { color: textColor }]}>{operation_item.descOp}</Text>
            </View>
          )}

          {/* Participants Card */}
          <View style={[styles.linesCard, { backgroundColor: cardColor }]}> 
            <Text style={[styles.sectionTitle, { color: textColor }]}>Participants</Text>
            <View style={styles.linesBlock}>
              <View style={styles.lineRow}>
                <View style={styles.lineLeft}>
                  <Text style={[styles.lineLabel, { color: textColor }]}>Solliciteur</Text>
                  <Text style={[styles.lineMeta, { color: mutedColor }]}>{operation_item.solliciteurOp ?? '—'}</Text>
                </View>
              </View>
              <View style={styles.lineRow}>
                <View style={styles.lineLeft}>
                  <Text style={[styles.lineLabel, { color: textColor }]}>{operationType == "Encaissement" ? "Déposant" : "Bénéficiaire"}</Text>
                  <Text style={[styles.lineMeta, { color: mutedColor }]}>{operation_item.depoOrBene ?? '—'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Summary Card - Montant */}
          <View style={[styles.summaryCard, { backgroundColor: cardColor }]}> 
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: textColor }]}>Montant de l'opération</Text>
              <Text style={[styles.totalValue, { color: typeColor }]}>
                {formatAmount(operation_item.montantOp)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
