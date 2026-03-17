import { ModuleDetailScreen } from '@/components/module-detail-screen';
import { commissionsData } from '@/data/fakeDatas/modules';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function CommissionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = commissionsData.find((entry) => entry.id === id);

  return <ModuleDetailScreen title="Détail commission" subtitle="Répartition des commissions" icon="percent" item={item} />;
}
