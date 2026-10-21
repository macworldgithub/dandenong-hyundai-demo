import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { LeftRail } from "./LeftRail";
import { ContextHeader } from "./ContextHeader";
import { useAuth } from "../../hooks/useAuth";
import { useEntity } from "../../hooks/useEntity";
import { useResource } from "../../hooks/useResource";
import { getInvoicesApi } from "../../api/ap";
import { getBankTransactionsApi } from "../../api/bank";
import { getVehiclesApi } from "../../api/inventory";
import { getAccountsApi, getControlRecsApi } from "../../api/gl";
import { getAuditLogsApi } from "../../api/audit";

export function AppShell() {
  const { user, logout } = useAuth();
  const { entity, activePeriod, periods, changeActivePeriod } = useEntity();
  const counts = useResource(async () => {
    const results = await Promise.allSettled([
      getInvoicesApi({ page: 1, limit: 1 }),
      getBankTransactionsApi({ page: 1, limit: 1 }),
      getVehiclesApi({ page: 1, limit: 1 }),
      getAccountsApi(),
      getAuditLogsApi({ page: 1, limit: 1 }),
    ]);
    return {
      invoices: results[0].status === 'fulfilled' ? results[0].value.total : undefined,
      transactions: results[1].status === 'fulfilled' ? results[1].value.total : undefined,
      vehicles: results[2].status === 'fulfilled' ? results[2].value.total : undefined,
      accounts: results[3].status === 'fulfilled' ? results[3].value.accounts.length : undefined,
      auditEvents: results[4].status === 'fulfilled' ? results[4].value.total : undefined,
    };
  }, [activePeriod?._id]);
  const controls = useResource(
    () => getControlRecsApi(activePeriod?._id),
    [activePeriod?._id],
  );
  useEffect(() => {
    const updated = () => {
      counts.refresh();
      controls.refresh();
    };
    window.addEventListener("accounting-data-updated", updated);
    return () => window.removeEventListener("accounting-data-updated", updated);
  }, [counts.refresh, controls.refresh]);
  const recs = controls.data?.controlRecs || [];
  const readiness = recs.length
    ? Math.round(
        (recs.filter((r) => r.status === "completed").length / recs.length) *
          100,
      )
    : undefined;
  return (
    <div className="app-shell">
      <LeftRail
        invoiceCount={counts.data?.invoices}
        bankTransactionCount={counts.data?.transactions}
        accountCount={counts.data?.accounts}
        auditEventCount={counts.data?.auditEvents}
        vehicleCount={counts.data?.vehicles}
      />
      <div className="app-main">
        <ContextHeader
          user={user}
          activePeriod={activePeriod}
          periods={periods}
          onPeriodChange={changeActivePeriod}
          onLogout={logout}
          entityName={entity?.name}
          readiness={readiness}
        />
        <main className="app-content">
          <Outlet context={{ activePeriod, entity }} />
        </main>
      </div>
    </div>
  );
}
