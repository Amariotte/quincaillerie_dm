import { ModuleDetailScreen } from '@/components/module-detail-screen';
import { transactionsData } from '@/data/fakeDatas/modules.fake';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = transactionsData.find((entry) => entry.id === id);

  return <ModuleDetailScreen title="Détail transaction" subtitle="Mouvement financier" icon="payments" item={item} />;
}
