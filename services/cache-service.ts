import AsyncStorage from '@react-native-async-storage/async-storage';

export const BALANCE_CACHE_KEY = 'home.balance.cache.v1';
export const RECENTS_MOUVEMENTS_CACHE_KEY = 'home.mouvements.recents.cache.v1';
export const TRANSACTIONS_LIST_CACHE_KEY = 'transactions.list.cache.v1';
export const FACTURES_LIST_CACHE_KEY = 'factures.list.cache.v1';
export const STAT_DATA_CACHE_KEY = 'statData.cache.v1';
export const PRODUITS_LIST_CACHE_KEY = 'produits.list.cache.v1';
export const PROMOTIONS_LIST_CACHE_KEY = 'promotions.list.cache.v1';
export const REGLEMENTS_LIST_CACHE_KEY = 'reglements.list.cache.v1';
export const COMMISSIONS_LIST_CACHE_KEY = 'commissions.list.cache.v1';
export const OPERATIONS_LIST_CACHE_KEY = 'operations.list.cache.v1';



export async function getCacheData<T>(key: string): Promise<T | null> {
  try {
    const rawValue = await AsyncStorage.getItem(key);
    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
}

export async function setCacheData<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeCacheData(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
