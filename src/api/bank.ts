import client from './client';
import { BankAccount, BankTransaction, ReconciliationPack } from '../types/bank';

export async function getBankAccountsApi(): Promise<{ accounts: BankAccount[] }> {
  const { data } = await client.get('/bank/accounts');
  return { accounts: Array.isArray(data) ? data : data.accounts };
}

export async function getBankTransactionsApi(params: {
  bankAccountId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<{ transactions: BankTransaction[]; total: number; page: number; totalPages: number }> {
  const { data } = await client.get('/bank/transactions', { params: { ...params, from: params.startDate, to: params.endDate } });
  return data;
}

export async function getSuggestedMatchesApi(transactionId: string): Promise<{
  transaction: BankTransaction;
  matches: Array<{
    type: string;
    score: number;
    description: string;
    details: any;
  }>;
}> {
  const { data } = await client.get(`/bank/transactions/${transactionId}/matches`);
  return { ...data, matches: (data.candidates || data.matches || []).map((c: any) => ({ ...c, score: c.confidence ?? c.score, details: { ...c.matchDetails, ...c.details, ...(c.type === 'deal_deposit' ? { dealId: c.id } : {}) } })) };
}

export async function allocateBankTransactionApi(
  transactionId: string,
  payload: {
    allocations: Array<{
      amountCents: number;
      accountId?: string;
      dealId?: string;
      vin?: string;
      supplierId?: string;
      note?: string;
    }>;
  }
): Promise<{ transaction: BankTransaction }> {
  const { data } = await client.post(`/bank/transactions/${transactionId}/allocate`, payload);
  return data;
}

export async function splitBankTransactionApi(
  transactionId: string,
  payload: {
    splits: Array<{
      amountCents: number;
      accountId?: string;
      dealId?: string;
      note?: string;
    }>;
  }
): Promise<{ transaction: BankTransaction }> {
  const { data } = await client.post(`/bank/transactions/${transactionId}/split`, { allocations: payload.splits });
  return data;
}

export async function parkBankTransactionApi(
  transactionId: string,
  reason: string
): Promise<{ transaction: BankTransaction }> {
  const { data } = await client.post(`/bank/transactions/${transactionId}/park`, { reason });
  return data;
}

export async function unmatchBankTransactionApi(
  transactionId: string
): Promise<{ transaction: BankTransaction }> {
  const { data } = await client.post(`/bank/transactions/${transactionId}/unmatch`);
  return data;
}

export async function getRecPackApi(bankAccountId: string, periodId?: string): Promise<{ recPack: ReconciliationPack }> {
  const { data } = await client.post('/bank/rec-pack', { bankAccountId, periodId });
  return { recPack: data.recPack || data };
}

export async function importBankStatementApi(bankAccountId: string, file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bankAccountId', bankAccountId);
  const { data } = await client.post('/bank/statements/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
