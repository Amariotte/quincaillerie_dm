import { ModuleListScreen } from '@/components/module-list-screen';
import { bonsLivraisonData } from '@/data/fakeDatas/modules.fake';
import React from 'react';

export default function BonsLivraisonScreen() {
  return <ModuleListScreen title="Bons de livraison" subtitle="Suivi des livraisons" icon="local-shipping" items={bonsLivraisonData} detailBasePath="/bons" />;
}
