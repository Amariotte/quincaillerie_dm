import { ModuleListScreen } from '@/components/module-list-screen';
import React from 'react';

export default function BonsLivraisonScreen() {
  return <ModuleListScreen title="Bons de livraison" subtitle="Suivi des livraisons" icon="local-shipping" items={[]} detailBasePath="/bons" />;
}
