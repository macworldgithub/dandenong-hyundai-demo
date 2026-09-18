import { useCallback, useEffect, useRef, useState } from 'react';
export function useResource<T>(loader: () => Promise<T>, dependencies: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const version = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++version.current;
    setLoading(true); setError('');
    try { const result = await loader(); if (request === version.current) setData(result); }
    catch (e: any) { if (request === version.current) { setData(null); setError(e.response?.data?.error || e.response?.data?.message || 'Unable to load data. Check the API connection and try again.'); } }
    finally { if (request === version.current) setLoading(false); }
  }, dependencies);
  useEffect(() => { refresh(); return () => { version.current++; }; }, [refresh]);
  return { data, loading, error, refresh };
}
