import { AppHeader } from '@/components/app-header';
import { detailsReglements, reglements } from '@/data/fakeDatas/reglements.fake';
import { useAppTheme } from '@/hooks/use-app-theme';
import { formatAmount } from '@/tools/tools';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style';

const getReglementStatus = (soldeReg: number, isEncaisse?: boolean): 'Soldé' | 'Partiel' | 'Non encaissé' => {
  if (isEncaisse && soldeReg <= 0) {
    return 'Soldé';
  }

  if (isEncaisse && soldeReg > 0) {
    return 'Partiel';
  }

  return 'Non encaissé';
};

export default function ReglementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor } = useAppTheme();

  const reglement = reglements.find((entry) => entry.id === id);

  if (!reglement) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <AppHeader showBack title="Détail règlement" subtitle="Document introuvable" />
            <View style={[styles.emptyCard, { backgroundColor: cardColor }]}> 
              <MaterialIcons name="error-outline" size={30} color="#dc2626" />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Règlement introuvable</Text>
              <Text style={[styles.emptyText, { color: mutedColor }]}>Ce règlement n'existe pas ou a été supprimé.</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const statusLabel = getReglementStatus(reglement.soldeReg, reglement.isEncaisse);
  const statusColor =
    statusLabel === 'Soldé' ? '#16a34a' : statusLabel === 'Partiel' ? '#f59e0b' : '#dc2626';

  const reglementLines = detailsReglements.filter((line) => line.codeVente === reglement.codeReg);
  const totalRegle = reglementLines.reduce((sum, line) => sum + line.montantRegle, 0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader showBack title="Détail règlement" subtitle={reglement.codeReg} />

          <View style={[styles.headerCard, { backgroundColor: cardColor }]}> 
            <View style={styles.headerTopRow}>
              <Text style={[styles.clientName, { color: textColor }]}>{reglement.nomSousCompte ?? 'Client inconnu'}</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}> 
                <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Date : {reglement.dateReg}</Text>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Référence : {reglement.refReg ?? '—'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Agence : {reglement.nomAgence ?? '—'}</Text>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Compte : {reglement.nomCompte ?? '—'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Mode : {reglement.modePaiement ?? '—'}</Text>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Opérateur : {reglement.operateurSaisie ?? '—'}</Text>
            </View>
          </View>

          <View style={[styles.linesCard, { backgroundColor: cardColor }]}> 
            <Text style={[styles.sectionTitle, { color: textColor }]}>Détails du règlement ({reglementLines.length})</Text>
            <View style={styles.linesBlock}>
              {reglementLines.map((line) => (
                <View key={line.id} style={styles.lineRow}>
                  <View style={styles.lineLeft}>
                    <Text style={[styles.lineLabel, { color: textColor }]}>{line.nomClient}</Text>
                    <Text style={[styles.lineMeta, { color: mutedColor }]}>{line.type}</Text>
                  </View>
                  <Text style={[styles.lineTotal, { color: textColor }]}>{formatAmount(line.montantRegle)}</Text>
                </View>
              ))}
              {reglementLines.length === 0 ? (
                <Text style={[styles.emptyText, { color: mutedColor }]}>Aucun détail disponible pour ce règlement.</Text>
              ) : null}
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: cardColor }]}> 
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: mutedColor }]}>Montant réglé</Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>{formatAmount(totalRegle || reglement.montant)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: mutedColor }]}>Solde restant</Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>{formatAmount(reglement.soldeReg)}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: textColor }]}>Montant total</Text>
              <Text style={[styles.totalValue, { color: tintColor }]}>{formatAmount(reglement.montant)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
