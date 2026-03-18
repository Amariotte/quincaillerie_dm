import { ModuleListScreen } from '@/components/module-list-screen';
import { reglementsData } from '@/data/fakeDatas/modules.fake';
import React from 'react';

export default function ReglementsScreen() {
  return <ModuleListScreen title="Règlements" subtitle="Historique des règlements" icon="account-balance-wallet" items={reglementsData} detailBasePath="/reglements" />;
}
