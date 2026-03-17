import { ModuleListScreen } from '@/components/module-list-screen';
import { achatsData } from '@/data/fakeDatas/modules';
import React from 'react';

export default function AchatsScreen() {
  return <ModuleListScreen title="Bon d'achats" subtitle="Achats fournisseurs" icon="description" items={achatsData} detailBasePath="/achats" />;
}
