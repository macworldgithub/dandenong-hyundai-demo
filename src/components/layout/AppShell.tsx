import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { LeftRail } from './LeftRail';
import { ContextHeader } from './ContextHeader';
import { useAuth } from '../../hooks/useAuth';
import { useEntity } from '../../hooks/useEntity';
import { useResource } from '../../hooks/useResource';
import { getDashboardKPIsApi } from '../../api/dashboard';
import { getControlRecsApi } from '../../api/gl';

export function AppShell() {
  const { user, logout } = useAuth();
  const { entity, activePeriod, periods, changeActivePeriod } = useEntity();
  const dashboard = useResource(() => getDashboardKPIsApi(activePeriod?._id), [activePeriod?._id]);
  const controls = useResource(() => getControlRecsApi(activePeriod?._id), [activePeriod?._id]);
  useEffect(() => {
    const updated = () => { dashboard.refresh(); controls.refresh(); };
    window.addEventListener('accounting-data-updated', updated);
    return () => window.removeEventListener('accounting-data-updated', updated);
  }, [dashboard.refresh, controls.refresh]);
  const recs = controls.data?.controlRecs || [];
  const readiness = recs.length ? Math.round(recs.filter(r => r.status === 'completed').length / recs.length * 100) : undefined;
  return <div className="app-shell">
    <LeftRail openApExceptionsCount={dashboard.data?.exceptions.openApExceptionsCount}/>
    <div className="app-main">
      <ContextHeader user={user} activePeriod={activePeriod} periods={periods} onPeriodChange={changeActivePeriod} onLogout={logout} entityName={entity?.name} readiness={readiness}/>
      <main className="app-content"><Outlet context={{ activePeriod, entity }}/></main>
    </div>
  </div>;
}
