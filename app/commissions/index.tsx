import { ModuleListScreen } from '@/components/module-list-screen';
import { commissionsData } from '@/data/fakeDatas/modules';
import React from 'react';

export default function CommissionsScreen() {
  return <ModuleListScreen title="Commissions" subtitle="Suivi des commissions" icon="percent" items={commissionsData} detailBasePath="/commissions" />;
}
