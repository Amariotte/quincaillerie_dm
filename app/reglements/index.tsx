import { AppHeader } from '@/components/app-header';
import { reglements } from '@/data/fakeDatas/reglements.fake';
import { useAppTheme } from '@/hooks/use-app-theme';
import { formatAmount, toComparableDate } from '@/tools/tools';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style';

type ReglementFilterStatus = 'Toutes' | 'Soldé' | 'Disponible' | 'Non encaissé';

const statusFilters: ReglementFilterStatus[] = ['Toutes', 'Soldé', 'Disponible', 'Non encaissé'];

const getReglementStatus = (soldeReg: number, isEncaisse?: boolean): Exclude<ReglementFilterStatus, 'Toutes'> => {
  if (isEncaisse && soldeReg <= 0) {
    return 'Soldé';
  }

  if (isEncaisse && soldeReg > 0) {
    return 'Disponible';
  }

  return 'Non encaissé';
};
const clientFilters = [
  'Tous',
  ...Array.from(
    new Set(
      reglements
        .map((reglement) => reglement.nomSousCompte)
        .filter((client): client is string => typeof client === 'string' && client.trim().length > 0)
    )
  ),
];

const paymentModeFilters = [
  'Tous modes',
  ...Array.from(
    new Set(
      reglements
        .map((reglement) => reglement.modePaiement)
        .filter((mode): mode is string => typeof mode === 'string' && mode.trim().length > 0)
    )
  ),
];




export default function ReglementsScreen() {
  const router = useRouter();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor, borderColor } = useAppTheme();
  const [query, setQuery] = useState('');
  const [startDateQuery, setStartDateQuery] = useState('');
  const [endDateQuery, setEndDateQuery] = useState('');
  const [activeClient, setActiveClient] = useState('Tous');
  const [activeStatus, setActiveStatus] = useState<ReglementFilterStatus>('Toutes');
  const [activePaymentMode, setActivePaymentMode] = useState('Tous modes');

  const filteredReglements = reglements.filter((reglement) => {
    const matchesQuery =
      reglement.codeReg.toLowerCase().includes(query.toLowerCase()) ||
      reglement.nomSousCompte?.toLowerCase().includes(query.toLowerCase());
    const issueComparable = toComparableDate(reglement.dateReg);
    const startComparable = startDateQuery.trim().length > 0 ? toComparableDate(startDateQuery.trim()) : null;
    const endComparable = endDateQuery.trim().length > 0 ? toComparableDate(endDateQuery.trim()) : null;
    const afterStart = !startComparable || !issueComparable || issueComparable >= startComparable;
    const beforeEnd = !endComparable || !issueComparable || issueComparable <= endComparable;
    const matchesDate = afterStart && beforeEnd;
    const matchesClient = activeClient === 'Tous' || reglement.nomSousCompte === activeClient;
    const reglementStatus = getReglementStatus(reglement.soldeReg, reglement.isEncaisse);
    const matchesStatus = activeStatus === 'Toutes' || reglementStatus === activeStatus;
    const matchesPaymentMode = activePaymentMode === 'Tous modes' || reglement.modePaiement === activePaymentMode;

    return matchesQuery && matchesDate && matchesClient && matchesStatus && matchesPaymentMode;
  });

  const unsettledReglements = filteredReglements.filter((reglement) => reglement.soldeReg > 0 || !reglement.isEncaisse);
  const settledReglements = filteredReglements.filter((reglement) => reglement.soldeReg <= 0 && reglement.isEncaisse);
  const totalSolde = filteredReglements.reduce((sum, reglement) => sum + reglement.soldeReg, 0);

  const totalCount = filteredReglements.length;
  const totalAmount = filteredReglements.reduce((sum, reglement) => sum + reglement.montant, 0);
  const unsettledCount = unsettledReglements.length;
  const unsettledAmount = unsettledReglements.reduce((sum, reglement) => sum + reglement.montant, 0);
  const settledCount = settledReglements.length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader showBack title="Liste des règlements" subtitle="Suivi des paiements et soldes restants" />

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[styles.statLabel, { color: mutedColor }]}>Tous les règlements</Text>
              <Text style={[styles.statCount, { color: textColor }]}>{totalCount} règlement{totalCount > 1 ? 's' : ''}</Text>
              <Text style={[styles.statValue, { color: textColor }]}>{formatAmount(totalAmount)}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[styles.statLabel, { color: mutedColor }]}>Règlements à suivre</Text>
              <Text style={[styles.statCount, { color: tintColor }]}>{unsettledCount} règlement{unsettledCount > 1 ? 's' : ''}</Text>
              <Text style={[styles.statValue, { color: tintColor }]}>{formatAmount(unsettledAmount)}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
              <Text style={[styles.statLabel, { color: mutedColor }]}>Soldes restants</Text>
              <Text style={[styles.statCount, { color: '#16a34a' }]}>{settledCount} soldé{settledCount > 1 ? 's' : ''}</Text>
              <Text style={[styles.statValue, { color: '#16a34a' }]}>{formatAmount(totalSolde)}</Text>
            </View>
          </View>

          <View style={[styles.searchBox, { backgroundColor: cardColor, borderColor }]}> 
            <MaterialIcons name="search" size={20} color={mutedColor} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher un règlement ou un client"
              placeholderTextColor={mutedColor}
              style={[styles.searchInput, { color: textColor }]}
            />
          </View>

          <View style={styles.periodRow}>
            <View style={[styles.periodInputBox, { backgroundColor: cardColor, borderColor }]}> 
              <MaterialIcons name="calendar-month" size={18} color={mutedColor} />
              <TextInput
                value={startDateQuery}
                onChangeText={setStartDateQuery}
                placeholder="Du (JJ/MM/AAAA)"
                placeholderTextColor={mutedColor}
                style={[styles.periodInput, { color: textColor }]}
              />
            </View>

            <View style={[styles.periodInputBox, { backgroundColor: cardColor, borderColor }]}> 
              <MaterialIcons name="event" size={18} color={mutedColor} />
              <TextInput
                value={endDateQuery}
                onChangeText={setEndDateQuery}
                placeholder="Au (JJ/MM/AAAA)"
                placeholderTextColor={mutedColor}
                style={[styles.periodInput, { color: textColor }]}
              />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {clientFilters.map((client) => {
              const isActive = client === activeClient;

              return (
                <TouchableOpacity
                  key={client}
                  onPress={() => setActiveClient(client)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? tintColor : cardColor,
                      borderColor: isActive ? tintColor : borderColor,
                    },
                  ]}
                >
                  <Text style={[styles.filterLabel, { color: isActive ? '#ffffff' : textColor }]}>{client}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {statusFilters.map((status) => {
              const isActive = status === activeStatus;

              return (
                <TouchableOpacity
                  key={status}
                  onPress={() => setActiveStatus(status)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? tintColor : cardColor,
                      borderColor: isActive ? tintColor : borderColor,
                    },
                  ]}
                >
                  <Text style={[styles.filterLabel, { color: isActive ? '#ffffff' : textColor }]}>{status}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {paymentModeFilters.map((mode) => {
              const isActive = mode === activePaymentMode;

              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setActivePaymentMode(mode)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? tintColor : cardColor,
                      borderColor: isActive ? tintColor : borderColor,
                    },
                  ]}
                >
                  <Text style={[styles.filterLabel, { color: isActive ? '#ffffff' : textColor }]}>{mode}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.listBlock}>
            {filteredReglements.map((reglement) => {
              const statusLabel = getReglementStatus(reglement.soldeReg, reglement.isEncaisse);
              const statusColor =
                statusLabel === 'Soldé' ? '#fcfdfc' : statusLabel === 'Disponible' ? '#16a34a' : '#dc2626';

              return (
                <View key={reglement.id} style={[styles.invoiceCard, { backgroundColor: cardColor }]}> 
                  <View style={styles.invoiceTopRow}>
                    <View style={styles.invoiceRefBlock}>
                      <Text style={[styles.invoiceRef, { color: textColor }]}>{reglement.codeReg}</Text>
                      <Text style={[styles.invoiceClient, { color: mutedColor }]}>{reglement.nomSousCompte}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}> 
                      <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                    </View>
                  </View>

                  <View style={styles.invoiceMetaRow}>
                    <View>
                      <Text style={[styles.metaLabel, { color: mutedColor }]}>Date</Text>
                      <Text style={[styles.metaValue, { color: textColor }]}>{reglement.dateReg}</Text>
                    </View>
                    <View>
                      <Text style={[styles.metaLabel, { color: mutedColor }]}>Référence</Text>
                      <Text style={[styles.metaValue, { color: textColor }]}>{reglement.refReg || '-'}</Text>
                    </View>
                    <View>
                      <Text style={[styles.metaLabel, { color: mutedColor }]}>Solde</Text>
                      <Text style={[styles.metaValue, { color: textColor }]}>{formatAmount(reglement.soldeReg)}</Text>
                    </View>
                  </View>

                  <View style={styles.metaModeRow}>
                    <Text style={[styles.metaLabel, { color: mutedColor }]}>Mode de paiement</Text>
                    <Text style={[styles.metaValue, { color: textColor }]}>{reglement.modePaiement || '—'}</Text>
                  </View>

                  <View style={styles.invoiceBottomRow}>
                    <View style={styles.amountBlock}>
                      <Text style={[styles.amountText, { color: textColor }]}>{formatAmount(reglement.montant)}</Text>
                      <Text style={[styles.paymentModeText, { color: mutedColor }]}>{reglement.modePaiement || '—'}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => router.push(`/reglements/${reglement.id}` as never)}
                      style={[styles.actionButton, { backgroundColor: `${tintColor}18` }]}
                    >
                      <Text style={[styles.actionText, { color: tintColor }]}>Voir détail</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {filteredReglements.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: cardColor }]}> 
                <MaterialIcons name="receipt-long" size={28} color={mutedColor} />
                <Text style={[styles.emptyTitle, { color: textColor }]}>Aucun règlement trouvé</Text>
                <Text style={[styles.emptyText, { color: mutedColor }]}>Ajustez votre recherche ou le filtre de statut.</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

