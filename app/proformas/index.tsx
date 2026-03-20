import { ModuleListScreen } from '@/components/module-list-screen';
import React from 'react';

export default function ProformasScreen() {
  return <ModuleListScreen title="Proformas" subtitle="Liste des devis proforma" icon="description" items={[]}detailBasePath="/proformas" />;
}
