import { AppHeader } from '@/components/app-header';
import { transactions } from '@/data/fakeDatas/transactions';
import { menuItems } from '@/data/menus';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './styles.js';




export default function HomeScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1f2937' }, 'background');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');

  const handleMenuPress = (itemId: string) => {
    if (itemId === 'factures') {
      router.push('/factures' as never);
      return;
    }

    if (itemId === 'proformas') {
      router.push('/proformas' as never);
      return;
    }

    if (itemId === 'bons') {
      router.push('/bons' as never);
      return;
    }

    if (itemId === 'reglements') {
      router.push('/reglements' as never);
      return;
    }

    if (itemId === 'produits') {
      router.push('/produits' as never);
      return;
    }

    if (itemId === 'achats') {
      router.push('/achats' as never);
      return;
    }

    if (itemId === 'transactions') {
      router.push('/transactions' as never);
      return;
    }

    if (itemId === 'promotions') {
      router.push('/promotions' as never);
      return;
    }

    if (itemId === 'operations') {
      router.push('/operations' as never);
      return;
    }

    if (itemId === 'commissions') {
      router.push('/commissions' as never);
      return;
    }

    if (itemId === 'cartes') {
      router.push('/cartes' as never);
      return;
    }

    if (itemId === 'devis') {
      router.push('/devis/nouveau');
      return;
    }

    Alert.alert('Bientot disponible', 'Ce module n\'est pas encore relie dans cette version.');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader title="Tableau de bord" subtitle="Vue globale de vos opérations" />

          <Text style={[styles.sectionTitle, { color: textColor }]}>Solde du compte</Text>

          <View style={[styles.balanceCard, { backgroundColor: cardColor }]}> 
            <View style={styles.balanceRow}>
              <View>
                <Text style={[styles.balanceAmount, { color: tintColor }]}>0 FCFA</Text>
                <Text style={[styles.balanceCaption, { color: '#f59e0b' }]}>Mon solde courant</Text>
              </View>
              <TouchableOpacity style={[styles.depositButton, { backgroundColor: tintColor }]}> 
                <MaterialIcons name="add" size={18} color="#ffffff" />
                <Text style={styles.depositText}>Déposer de l'argent</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricBlock}>
                <Text style={[styles.metricLabel, { color: mutedColor }]}>Factures non soldées</Text>
                <Text style={[styles.metricValue, { color: textColor }]}>0</Text>
              </View>
              <View style={styles.metricBlock}>
                <Text style={[styles.metricLabel, { color: mutedColor }]}>Factures échues</Text>
                <Text style={[styles.metricValue, { color: textColor }]}>0</Text>
              </View>
              <View style={styles.metricBlock}>
                <Text style={[styles.metricLabel, { color: mutedColor }]}>Promotions actives</Text>
                <Text style={[styles.metricValue, { color: textColor }]}>0</Text>
              </View>
            </View>

            <Text style={[styles.updateText, { color: mutedColor }]}>Dernière mise à jour : 17/03/2026 13:32:08</Text>
          </View>

          <Text style={[styles.sectionTitle, { color: textColor }]}>Menu</Text>

          <View style={styles.menuGrid}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleMenuPress(item.id)}
                style={[
                  styles.menuCard,
                  { backgroundColor: cardColor },
                  item.featured && { backgroundColor: item.tint, justifyContent: 'center' },
                ]}
              >
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: item.featured ? 'rgba(255,255,255,0.18)' : `${item.tint}18` },
                  ]}
                >
                  <MaterialIcons
                    name={item.icon as any}
                    size={26}
                    color={item.featured ? '#ffffff' : item.tint}
                  />
                </View>
                <Text
                  style={[
                    styles.menuLabel,
                    { color: item.featured ? '#ffffff' : textColor },
                  ]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.transactionsHeader}>
            <Text style={[styles.sectionTitle, styles.transactionTitle, { color: textColor }]}>50 Dernières transactions</Text>
          </View>

          <View style={styles.transactionList}>
            {transactions.map((transaction) => (
              <View key={transaction.id} style={[styles.transactionCard, { backgroundColor: cardColor }]}> 
                <View style={[styles.transactionIcon, { backgroundColor: `${tintColor}15` }]}>
                  <MaterialIcons name="sync-alt" size={20} color={tintColor} />
                </View>
                <View style={styles.transactionContent}>
                  <Text style={[styles.transactionLabel, { color: textColor }]}>{transaction.label}</Text>
                  <Text style={[styles.transactionDate, { color: mutedColor }]}>{transaction.date}</Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[styles.transactionAmount, { color: textColor }]}>{transaction.amount}</Text>
                  <Text style={[styles.transactionStatus, { color: tintColor }]}>{transaction.status}</Text>
                </View>
              </View>
            ))}
          </View>

    
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
