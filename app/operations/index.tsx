import { ModuleListScreen } from '@/components/module-list-screen';
import { operationsData } from '@/data/fakeDatas/modules';
import React from 'react';

export default function OperationsScreen() {
  return <ModuleListScreen title="Opérations" subtitle="Actions de gestion" icon="trending-down" items={operationsData} />;
}
