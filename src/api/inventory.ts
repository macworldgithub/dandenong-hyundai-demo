import client from './client';
import { getDashboardKPIsApi } from './dashboard';
import { allPages } from './pagination';
import { Vehicle, DealJacket, FloorplanDraw } from '../types/inventory';

export async function getInventoryStatsApi(): Promise<{
  summary: { count: number; cost: number; over90: number; bands: { _id: number; count: number; cost: number }[] };
  facility: Awaited<ReturnType<typeof getFloorplanApi>>;
}> {
  const { data } = await client.get('/inventory/stats');
  if (!data.summary || !Number.isFinite(data.facility?.facilityLimitCents)) {
    throw new Error('Inventory statistics response is incomplete');
  }
  return data;
}

export async function getVehiclesApi(params: {
  class?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ summary: { count: number; cost: number; over90: number; bands: { _id: number; count: number; cost: number }[] }; vehicles: Vehicle[]; total: number; page: number; totalPages: number }> {
  const { data } = await client.get('/inventory/vehicles', { params: { ...params, q: params.search } });
  return data;
}

export async function getVehicleApi(id: string): Promise<{ vehicle: Vehicle; deals?: DealJacket[]; floorplan?: FloorplanDraw }> {
  const { data } = await client.get(`/inventory/vehicles/${id}`);
  return { ...data, deals: data.deals || (data.deal ? [data.deal] : []), floorplan: Array.isArray(data.floorplan) ? data.floorplan[0] : data.floorplan };
}

export async function addCostLineApi(
  vehicleId: string,
  payload: {
    type: string;
    amountCents: number;
    sourceDocRef: string;
  }
): Promise<{ vehicle: Vehicle }> {
  const { data } = await client.post(`/inventory/vehicles/${vehicleId}/cost-lines`, payload);
  return data;
}

export async function getDealsApi(params: {
  page?: number;
  limit?: number;
}): Promise<{ deals: DealJacket[]; total: number; page: number; totalPages: number }> {
  const { data } = await client.get('/inventory/deals', { params });
  return data;
}

export async function getDealApi(id: string): Promise<{ deal: DealJacket; vehicle?: Vehicle; journal?: any }> {
  const { data } = await client.get(`/inventory/deals/${id}`);
  return data;
}

export async function getFloorplanApi(page = 1): Promise<{
  activeDraws: FloorplanDraw[]; total: number; totalPages: number;
  financiers: { _id: string; count: number; drawn: number; interest: number }[];
  totalDrawnCents: number; totalInterestCents: number; facilityLimitCents: number; headroomCents: number;
}> {
  const { data } = await client.get('/inventory/floorplan', { params: { settled: false, page, limit: 15 } });
  return { ...data, activeDraws: data.draws };
}

// The backend accrues all eligible draws at once; there is no per-draw endpoint.
export async function accrueFloorplanInterestApi(): Promise<unknown> {
  const { data } = await client.post('/inventory/floorplan/accrue-interest');
  return data;
}
