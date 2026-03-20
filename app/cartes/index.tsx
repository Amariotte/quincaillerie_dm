import { ModuleListScreen } from '@/components/module-list-screen';
import React from 'react';

export default function CartesScreen() {
  return <ModuleListScreen title="Cartes" subtitle="Cartes et fidélité clients" icon="credit-card" items={[]} detailBasePath="/cartes" />;
}
