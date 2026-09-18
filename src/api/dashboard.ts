import client from './client';
import { DashboardResponse } from '../types/kpi';

export async function getDashboardKPIsApi(periodId?: string): Promise<DashboardResponse> {
  const { data } = await client.get('/dashboard/kpis', {
    params: periodId ? { periodId } : {},
  });
  return data;
}

export async function drillKPIApi(key: string, periodId?: string): Promise<any> {
  const { data } = await client.get(`/dashboard/kpis/${key}/drill`, {
    params: periodId ? { periodId } : {},
  });
  return data.data || data;
}
