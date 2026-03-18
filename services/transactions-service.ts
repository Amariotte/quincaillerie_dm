import apiConfig from '@/config/api';
import { transactionsFake } from '@/data/fakeDatas/transactions.fake';
import { isFakeModeEnabled } from '@/tools/tools';
import { Transaction } from '@/types/transactions.type';
import { getJson } from './api-client';

const LIMIT = 50;


export async function fetchTransactions(): Promise<Transaction[]> {
  
    if (isFakeModeEnabled()) {
      return getTransactionsFromFakeData();
    }
  
  const data = await getJson<Transaction[]>(`${apiConfig.endpoints.transactions}?limit=${LIMIT}`);
  return data;
}

export function getTransactionsFromFakeData(): Transaction[] {
  return transactionsFake.slice(0, LIMIT);
}
