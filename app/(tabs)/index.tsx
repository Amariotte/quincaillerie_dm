import { AppHeader } from '@/components/app-header';
import { menuItems } from '@/data/menus';
import { useAppTheme } from '@/hooks/use-app-theme';
import { BALANCE_CACHE_KEY, getCacheData, RECENTS_TRANSACTIONS_CACHE_KEY, setCacheData } from '@/services/cache-service';
import { fetchSoldeCompte } from '@/services/soldes-service';
import { fetchTransactions } from '@/services/transactions-service';
import { formatAmount } from '@/tools/tools';
import { SoldeResponse } from '@/types/solde.type.js';
import { Transaction } from '@/types/transactions.type';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './styles.js';


export default function HomeScreen() {
  const router = useRouter();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor } = useAppTheme();

  const [accountBalance, setAccountBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  const loadBalance = useCallback(async () => {
    let hasCachedBalance = false;
    try {
      setIsLoadingBalance(true);
      const parsedCache = await getCacheData<SoldeResponse>(BALANCE_CACHE_KEY);

      if (parsedCache) {
        const cachedBalance = Number(parsedCache.solde);

        if (!Number.isNaN(cachedBalance)) {
          setAccountBalance(cachedBalance);
          hasCachedBalance = true;
        }
      }

      const solde = await fetchSoldeCompte();

      setAccountBalance(Number(solde));
      setIsOfflineMode(false);

      await setCacheData(
        BALANCE_CACHE_KEY,
        { solde: solde },
      );
    } catch {
      setIsOfflineMode(true);

    } finally {
      setIsLoadingBalance(false);
    }
  }, []);

  const loadRecentTransactions = useCallback(async () => {
    setIsLoadingTransactions(true);
    try {
      const cached = await getCacheData<Transaction[]>(RECENTS_TRANSACTIONS_CACHE_KEY);
      if (cached && cached.length > 0) {
        setRecentTransactions(cached);
      }
      const data = await fetchTransactions();
      setRecentTransactions(data);
      await setCacheData(RECENTS_TRANSACTIONS_CACHE_KEY, data);
    } catch (ex) {
      setIsOfflineMode(true);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, []);

  useEffect(() => {
    loadBalance();
    loadRecentTransactions();
  }, [loadBalance, loadRecentTransactions]);

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
          <AppHeader title="Tableau de bord" subtitle="Vue globale de vos opérations" isOffline={isOfflineMode} />

          <View style={[styles.balanceCard, { backgroundColor: cardColor }]}> 
            <View style={styles.balanceRow}>
              <View>
                <Text style={[styles.balanceAmount, { color: tintColor }]}>
                  {isLoadingBalance
                    ? 'Chargement...'
                    : accountBalance !== null
                      ? formatAmount(accountBalance)
                      : 'Solde indisponible'}
                </Text>
                <Text style={[styles.balanceCaption, { color: '#f59e0b' }]}>Mon solde courant</Text>
              </View>
              <TouchableOpacity onPress={loadBalance} style={[styles.depositButton, { backgroundColor: tintColor }]}> 
                <MaterialIcons name="refresh" size={18} color="#ffffff" />
                <Text style={styles.depositText}>Actualiser le solde</Text>
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
            <TouchableOpacity onPress={() => router.push('/transactions' as never)}>
              <Text style={[styles.seeAllText, { color: tintColor }]}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionList}>
            {isLoadingTransactions && recentTransactions.length === 0 ? (
              <View style={[styles.transactionCard, { backgroundColor: cardColor, justifyContent: 'center' }]}>
                <Text style={[styles.transactionLabel, { color: mutedColor, textAlign: 'center' }]}>Chargement...</Text>
              </View>
            ) : recentTransactions.map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                activeOpacity={0.85}
                onPress={() => router.push(`/transactions/${transaction.id}` as never)}
                style={[styles.transactionCard, { backgroundColor: cardColor }]}
              >
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
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
