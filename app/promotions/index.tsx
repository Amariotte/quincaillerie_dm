import { ModuleListScreen } from '@/components/module-list-screen';
import { promotionsData } from '@/data/fakeDatas/modules';
import React from 'react';

export default function PromotionsScreen() {
  return <ModuleListScreen title="Promotions" subtitle="Campagnes et remises" icon="redeem" items={promotionsData} />;
}
