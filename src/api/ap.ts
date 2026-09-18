import client from './client';
import { getAccountsApi, getTrialBalanceApi } from './gl';

function invoice(data: any): ApInvoice {
  const value = data.invoice || data;
  return { ...value, poId: typeof value.poId === 'object' ? value.poId?._id : value.poId,
    lines: (value.lines || []).map((line: any) => ({ ...line, totalCents: line.totalCents ?? line.amountCents })),
    exceptions: (value.exceptions || []).map((ex: any) => ({ ...ex, description: ex.description || ex.message, status: ex.status || (ex.resolvedAt ? 'resolved' : 'open') })),
    extraction: value.extraction ? { ...value.extraction, fields: Array.isArray(value.extraction.fields) ? value.extraction.fields : Object.entries(value.extraction.fields || {}).map(([name, field]: [string, any]) => ({ name, ...(typeof field === 'object' ? field : { value: String(field), confidence: value.extraction.confidence }) })) } : undefined };
}
import { ApInvoice, Supplier, PaymentRun, ApAgeingSummary } from '../types/ap';

export async function getSuppliersApi(): Promise<{ suppliers: Supplier[] }> {
  const { data } = await client.get('/ap/suppliers');
  return { suppliers: Array.isArray(data) ? data : data.suppliers };
}

export async function getInvoicesApi(params: {
  status?: string;
  supplierId?: string;
  page?: number;
  limit?: number;
}): Promise<{ invoices: ApInvoice[]; total: number; page: number; totalPages: number }> {
  const { data } = await client.get('/ap/invoices', { params });
  return { ...data, invoices: data.invoices.map(invoice) };
}

export async function getInvoiceApi(id: string): Promise<{ invoice: ApInvoice; po?: any }> {
  const { data } = await client.get(`/ap/invoices/${id}`);
  return { invoice: invoice(data), po: data.po || (typeof data.poId === 'object' ? data.poId : undefined) };
}

export async function uploadInvoiceApi(file: File): Promise<{ invoice: ApInvoice }> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await client.post('/ap/invoices/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return { invoice: invoice(data) };
}

export async function updateExtractionApi(id: string, fields: any): Promise<{ invoice: ApInvoice }> {
  const { data } = await client.patch(`/ap/invoices/${id}/extraction`, fields.fields ? Object.fromEntries(fields.fields.map((f: any) => [f.name, f.value])) : fields);
  return { invoice: invoice(data) };
}

export async function codeInvoiceApi(
  id: string,
  payload: {
    lines: Array<{
      description: string;
      quantity: number;
      unitPriceCents: number;
      totalCents: number;
      accountId: string;
      department?: string;
    }>;
    poId?: string;
    vin?: string;
  }
): Promise<{ invoice: ApInvoice }> {
  const ids = [...new Set(payload.lines.map(line => line.accountId))];
  if (ids.length !== 1) throw new Error('This API supports one GL account per invoice. Select the same account for all lines.');
  const { accounts } = await getAccountsApi();
  const account = accounts.find(a => a._id === ids[0] || a.code === ids[0]);
  if (!account) throw new Error('Select a valid GL account before coding this invoice.');
  const { data } = await client.post(`/ap/invoices/${id}/code`, { accountId: account._id, vin: payload.vin });
  return { invoice: invoice(data) };
}

export async function matchInvoiceApi(id: string, poId: string): Promise<{ invoice: ApInvoice; matched: boolean }> {
  const { data } = await client.post(`/ap/invoices/${id}/match`, { poId });
  return { invoice: invoice(data), matched: data.invoice?.status === 'matched' };
}

export async function resolveExceptionApi(
  id: string,
  exceptionId: string,
  payload: { resolution: string; action: 'resolve' | 'waive' }
): Promise<{ invoice: ApInvoice }> {
  const { data } = await client.post(`/ap/invoices/${id}/resolve`, { resolution: payload.action === 'waive' ? 'waived' : 'accepted', notes: payload.resolution });
  return { invoice: invoice(data) };
}

export async function approveInvoiceApi(id: string): Promise<{ invoice: ApInvoice }> {
  const { data } = await client.post(`/ap/invoices/${id}/approve`);
  return { invoice: invoice(data) };
}

export async function getPaymentRunsApi(): Promise<{ paymentRuns: PaymentRun[] }> {
  const { data } = await client.get('/ap/payment-runs');
  return { paymentRuns: Array.isArray(data) ? data : data.paymentRuns };
}

export async function createPaymentRunApi(invoiceIds: string[]): Promise<{ paymentRun: PaymentRun }> {
  const { data } = await client.post('/ap/payment-runs', { invoiceIds });
  return { paymentRun: data.paymentRun || data };
}

export async function approvePaymentRunApi(id: string): Promise<{ paymentRun: PaymentRun }> {
  const { data } = await client.post(`/ap/payment-runs/${id}/approve`);
  return { paymentRun: data.paymentRun || data };
}

export async function getApAgeingApi(): Promise<ApAgeingSummary> {
  const [{ data }, tb] = await Promise.all([client.get('/ap/ageing'), getTrialBalanceApi({})]);
  if (Array.isArray(data.buckets)) return data;
  const grouped = new Map<string, any>();
  for (const [bucket, items] of Object.entries(data.buckets) as [string, any[]][]) {
    for (const item of items) {
      const row = grouped.get(item.supplier) || { supplierId: item.supplier, supplierName: item.supplier, currentCents: 0, days30Cents: 0, days60Cents: 0, days90PlusCents: 0, totalCents: 0 };
      const key = bucket === 'current' ? 'currentCents' : bucket === 'days30' ? 'days30Cents' : bucket === 'days60' ? 'days60Cents' : 'days90PlusCents';
      row[key] += item.grossCents; row.totalCents += item.grossCents; grouped.set(item.supplier, row);
    }
  }
  const buckets = [...grouped.values()];
  const totals = { currentCents: data.totals.current, days30Cents: data.totals.days30, days60Cents: data.totals.days60, days90PlusCents: data.totals.days90 + data.totals.over90, totalCents: data.grandTotalCents };
  const glControlBalanceCents = tb.accounts.filter(a => a.controlFor === 'ap').reduce((sum, a) => sum + a.netCreditCents - a.netDebitCents, 0);
  return { buckets, totals, glControlBalanceCents, varianceCents: totals.totalCents - glControlBalanceCents };
}
