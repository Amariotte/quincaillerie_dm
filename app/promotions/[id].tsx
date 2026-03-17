import { ModuleDetailScreen } from '@/components/module-detail-screen';
import { promotionsData } from '@/data/fakeDatas/modules';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function PromotionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = promotionsData.find((entry) => entry.id === id);

  return <ModuleDetailScreen title="Détail promotion" subtitle="Configuration de campagne" icon="redeem" item={item} />;
}
