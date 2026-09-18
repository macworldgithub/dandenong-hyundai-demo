import client from './client';
import { AuditLogEntry } from '../types/audit';

export async function getAuditLogsApi(params: {
  entityType?: string;
  action?: string;
  userId?: string;
  page?: number;
  limit?: number;
}): Promise<{ logs: AuditLogEntry[]; total: number; page: number; totalPages: number }> {
  const { data } = await client.get('/audit', { params });
  return data;
}
