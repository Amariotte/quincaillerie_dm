import { ModuleDetailScreen } from '@/components/module-detail-screen';
import { proformasData } from '@/data/fakeDatas/modules';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function ProformaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = proformasData.find((entry) => entry.id === id);

  return <ModuleDetailScreen title="Détail proforma" subtitle="Informations du document" icon="description" item={item} />;
}
