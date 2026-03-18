import { ModuleDetailScreen } from '@/components/module-detail-screen';
import { cartesData } from '@/data/fakeDatas/modules.fake';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function CarteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = cartesData.find((entry) => entry.id === id);

  return <ModuleDetailScreen title="Détail carte" subtitle="Informations fidélité" icon="credit-card" item={item} />;
}
