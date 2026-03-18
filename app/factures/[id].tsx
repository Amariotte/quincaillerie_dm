import { AppHeader } from '@/components/app-header';
import { factures, fallbackItems } from '@/data/fakeDatas/factures.fake';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatAmount } from '@/tools/tools';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style.js';


export default function FactureDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1f2937' }, 'background');

  const invoice = factures.find((item) => item.id === id);

  if (!invoice) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <AppHeader showBack title="Détail facture" subtitle="Document introuvable" />
            <View style={[styles.emptyCard, { backgroundColor: cardColor }]}> 
              <MaterialIcons name="error-outline" size={30} color="#dc2626" />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Facture introuvable</Text>
              <Text style={[styles.emptyText, { color: mutedColor }]}>Cette facture n'existe pas ou a été supprimée.</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const statusColor =
    invoice.status === 'Payée' ? '#16a34a' : invoice.status === 'En attente' ? '#f59e0b' : '#dc2626';

  const invoiceLines = fallbackItems.slice(0, invoice.nbProduits);
  const computedSubtotal = invoiceLines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const subtotal = computedSubtotal > 0 ? computedSubtotal : invoice.montant;
  const vat = Math.round(subtotal * 0.16);
  const total = subtotal + vat;
  const hasFneUrl = Boolean(invoice.fneURL && invoice.fneURL.trim().length > 0);

  const openNormalizedInvoice = async () => {
    if (!hasFneUrl || !invoice.fneURL) {
      return;
    }

    await Linking.openURL(invoice.fneURL);
  };

  const openTicket = async () => {
    if (!hasFneUrl || !invoice.fneURL) {
      return;
    }

    await Linking.openURL(invoice.fneURL);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader showBack title="Détail facture" subtitle={invoice.codeVente} />

          <View style={[styles.headerCard, { backgroundColor: cardColor }]}> 
            <View style={styles.headerTopRow}>
              <Text style={[styles.clientName, { color: textColor }]}>{invoice.nomSousCompte}</Text>
              {hasFneUrl ? (
                <View style={styles.headerActionsRow}>
                  <TouchableOpacity
                    onPress={openNormalizedInvoice}
                    style={[styles.headerActionButton, { backgroundColor: `${tintColor}18` }]}
                  >
                    <MaterialIcons name="visibility" size={16} color={tintColor} />
                    <View style={[styles.infoBubble, { backgroundColor: tintColor }]}>
                      <Text style={styles.infoBubbleText}>i</Text>
                    </View>
                  </TouchableOpacity>
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
              ) : null}
            </View>
            
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Émise le : {invoice.dateVente}</Text>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Échéance : {invoice.dateEcheanceVente}</Text>
            </View>
             <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{invoice.status}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Agence : {invoice.nomAgence ?? '—'}</Text>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Caisse : {invoice.nomCaisse ?? '—'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Opérateur saisie : {invoice.operateurSaisie ?? '—'}</Text>
              <Text style={[styles.metaLabel, { color: mutedColor }]}>Opérateur validation : {invoice.operateurValidation ?? '—'}</Text>
            </View>
           
          </View>

          <View style={[styles.linesCard, { backgroundColor: cardColor }]}> 
            <Text style={[styles.sectionTitle, { color: textColor }]}>Articles ({invoice.nbProduits})</Text>
            <View style={styles.linesBlock}>
              {invoiceLines.map((line) => (
                <View key={line.id} style={styles.lineRow}>
                  <View style={styles.lineLeft}>
                    <Text style={[styles.lineLabel, { color: textColor }]}>{line.label}</Text>
                    <Text style={[styles.lineMeta, { color: mutedColor }]}>{line.quantity} × {formatAmount(line.unitPrice)}</Text>
                  </View>
                  <Text style={[styles.lineTotal, { color: textColor }]}>{formatAmount(line.quantity * line.unitPrice)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: cardColor }]}> 
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: mutedColor }]}>Sous-total</Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>{formatAmount(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: mutedColor }]}>TVA (16%)</Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>{formatAmount(vat)}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: textColor }]}>Total à payer</Text>
              <Text style={[styles.totalValue, { color: tintColor }]}>{formatAmount(total)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}