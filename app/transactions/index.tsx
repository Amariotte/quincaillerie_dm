import { ModuleListScreen } from '@/components/module-list-screen';
import { transactionsData } from '@/data/fakeDatas/modules';
import React from 'react';

export default function TransactionsScreen() {
  return <ModuleListScreen title="Transactions" subtitle="Mouvements financiers" icon="payments" items={transactionsData} detailBasePath="/transactions" />;
}
