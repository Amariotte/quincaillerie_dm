import { ModuleDetailScreen } from '@/components/module-detail-screen';
import { reglementsData } from '@/data/fakeDatas/modules';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function ReglementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = reglementsData.find((entry) => entry.id === id);

  return <ModuleDetailScreen title="Détail règlement" subtitle="Informations du paiement" icon="account-balance-wallet" item={item} />;
}
