import client from './client';
import { Account, TrialBalanceResponse, Department } from '../types/account';
import { JournalEntry } from '../types/journal';
import { ControlRec } from '../types/reconciliation';

export async function getAccountsApi(): Promise<{ accounts: Account[] }> {
  const { data } = await client.get('/gl/accounts');
  return { accounts: Array.isArray(data) ? data : data.accounts };
}

export async function getTrialBalanceApi(params: {
  periodId?: string;
  department?: Department;
}): Promise<TrialBalanceResponse> {
  const { data } = await client.get('/gl/trial-balance', { params });
  return { ...data, accounts: data.accounts.map((row: any) => ({ ...row, netDebitCents: Math.max(0, row.balanceCents ?? row.netDebitCents - row.netCreditCents), netCreditCents: Math.max(0, -(row.balanceCents ?? row.netDebitCents - row.netCreditCents)) })) };
}

export async function drillAccountApi(
  accountId: string,
  params: { periodId?: string; page?: number; limit?: number }
): Promise<{
  account: Account;
  entries: JournalEntry[];
  totalDebitCents: number;
  totalCreditCents: number;
  netCents: number;
}> {
  const { data } = await client.get(`/gl/accounts/${accountId}/drill`, { params });
  if (data.entries) return data;
  const { accounts } = await getAccountsApi();
  const account = accounts.find(a => a._id === accountId);
  const entries = (data.lines || []).map((line: any, index: number) => ({ ...line, _id: line.journalEntryId + '-' + index, lines: [{ ...line, accountId }], postedAt: line.date }));
  const totalDebitCents = (data.lines || []).reduce((sum: number, line: any) => sum + line.debitCents, 0);
  const totalCreditCents = (data.lines || []).reduce((sum: number, line: any) => sum + line.creditCents, 0);
  return { account: account!, entries, totalDebitCents, totalCreditCents, netCents: totalDebitCents - totalCreditCents };
}

export async function getJournalsApi(params: {
  periodId?: string;
  source?: string;
  page?: number;
  limit?: number;
}): Promise<{ journals: JournalEntry[]; total: number; page: number; totalPages: number }> {
  const { data } = await client.get('/gl/journals', { params });
  return data;
}

export async function getJournalApi(id: string): Promise<{ journal: JournalEntry }> {
  const { data } = await client.get(`/gl/journals/${id}`);
  return { journal: data.journal || data };
}

export async function postManualJournalApi(payload: {
  periodId: string;
  date: string;
  narration: string;
  lines: Array<{
    accountId: string;
    debitCents: number;
    creditCents: number;
    department?: string;
    vin?: string;
    dealId?: string;
    supplierId?: string;
  }>;
}): Promise<{ journal: JournalEntry }> {
  const { data } = await client.post('/gl/journals', payload);
  return { journal: data.journal || data };
}

export async function reverseJournalApi(
  id: string,
  reason: string
): Promise<{ journal: JournalEntry }> {
  const { data } = await client.post(`/gl/journals/${id}/reverse`, { reason });
  return { journal: data.journal || data };
}

export async function getControlRecsApi(periodId?: string): Promise<{ controlRecs: ControlRec[] }> {
  const { data } = await client.get('/gl/control-recs', {
    params: periodId ? { periodId } : {},
  });
  return { controlRecs: Array.isArray(data) ? data : data.controlRecs };
}

export async function completeControlRecApi(type: string, periodId?: string): Promise<{ controlRec: ControlRec }> {
  const { data } = await client.post(`/gl/control-recs/${type}/complete`, { periodId });
  return { controlRec: data.controlRec || data };
}

export async function exportEvidencePackApi(periodId?: string): Promise<{
  generatedAt: string;
  dealership: string;
  period: string;
  trialBalance: any;
  controlRecs: ControlRec[];
  bankRecPacks: any[];
  apAgeing: any;
}> {
  const { data } = await client.get('/gl/evidence-pack', {
    params: periodId ? { periodId } : {},
  });
  return { ...data, controlRecs: data.controlRecs || data.controlReconciliations || [], bankRecPacks: data.bankRecPacks || data.bankReconciliations || [] };
}
