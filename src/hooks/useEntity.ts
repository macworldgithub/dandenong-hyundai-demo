import { useState, useEffect } from 'react';
import { Entity } from '../types/entity';
import { Period } from '../types/period';
import { getEntityApi } from '../api/entity';

export function useEntity() {
  const [entity, setEntity] = useState<Entity | null>(null);
  const [activePeriod, setActivePeriod] = useState<Period | null>(null);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntity = () => {
    setIsLoading(true);
    getEntityApi()
      .then((res) => {
        setEntity(res.entity);
        setActivePeriod(res.activePeriod);
        setPeriods(res.periods);
      })
      .catch((err) => {
        console.error('Failed to load entity context:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchEntity();
    }
  }, []);

  const changeActivePeriod = (periodId: string) => {
    const found = periods.find((p) => p._id === periodId);
    if (found) {
      setActivePeriod(found);
    }
  };

  return { entity, activePeriod, periods, isLoading, changeActivePeriod, refetch: fetchEntity };
}
