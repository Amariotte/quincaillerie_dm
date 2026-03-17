import { ModuleDetailScreen } from '@/components/module-detail-screen';
import { achatsData } from '@/data/fakeDatas/modules';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function AchatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = achatsData.find((entry) => entry.id === id);

  return <ModuleDetailScreen title="Détail achat" subtitle="Bon d'achats fournisseur" icon="description" item={item} />;
}
