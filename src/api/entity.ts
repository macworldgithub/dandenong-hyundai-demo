import client from './client';
import { Entity } from '../types/entity';
import { Period } from '../types/period';

export async function getEntityApi(): Promise<{ entity: Entity; activePeriod: Period; periods: Period[] }> {
  const { data } = await client.get('/entity');
  return { ...data, periods: data.periods || (data.activePeriod ? [data.activePeriod] : []) };
}
