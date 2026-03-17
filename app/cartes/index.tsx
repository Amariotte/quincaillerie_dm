import { ModuleListScreen } from '@/components/module-list-screen';
import { cartesData } from '@/data/fakeDatas/modules';
import React from 'react';

export default function CartesScreen() {
  return <ModuleListScreen title="Cartes" subtitle="Cartes et fidélité clients" icon="credit-card" items={cartesData} detailBasePath="/cartes" />;
}
