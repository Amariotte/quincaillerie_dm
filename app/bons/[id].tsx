import { ModuleDetailScreen } from '@/components/module-detail-screen';
import { bonsLivraisonData } from '@/data/fakeDatas/modules';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function BonLivraisonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = bonsLivraisonData.find((entry) => entry.id === id);

  return <ModuleDetailScreen title="Détail bon de livraison" subtitle="Suivi de livraison" icon="local-shipping" item={item} />;
}
