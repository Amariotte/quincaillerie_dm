import apiConfig from '@/config/api';
import { statsFake } from '@/data/fakeDatas/others.fake';
import { isFakeModeEnabled } from '@/tools/tools';
import { stat } from '@/types/other.type';
import { getJsonAuth } from './api-client';


export async function getStats(token: string): Promise<stat> {

  if (isFakeModeEnabled()) {
    return getStatsFromFakeData();
}

  const payload = await getJsonAuth<stat>(apiConfig.endpoints.stats, token);
  return payload;
}

export function getStatsFromFakeData(): stat {
    return statsFake;
}
