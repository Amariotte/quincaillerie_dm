import { ModuleDetailScreen } from '@/components/module-detail-screen';
import { operationsData } from '@/data/fakeDatas/modules';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function OperationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = operationsData.find((entry) => entry.id === id);

  return <ModuleDetailScreen title="Détail opération" subtitle="Suivi d'exécution" icon="trending-down" item={item} />;
}
