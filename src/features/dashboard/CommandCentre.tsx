import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { getDashboardKPIsApi } from '../../api/dashboard';
import { getTrialBalanceApi, getAccountsApi, getJournalsApi } from '../../api/gl';
import { allPages } from '../../api/pagination';
import { useResource } from '../../hooks/useResource';
import { Period } from '../../types/period';
import { Entity } from '../../types/entity';
import { KpiTileData } from '../../types/kpi';
import { JournalEntry } from '../../types/journal';
import { PageHeading, Eyebrow, Tag, LoadState, dollars, compact } from '../../components/ui/Desk';
import { LineChart } from '../../components/ui/LineChart';
import { KpiDrillDrawer } from './KpiDrillDrawer';
export function CommandCentre() {
  const { activePeriod, entity } = useOutletContext<{ activePeriod: Period | null; entity: Entity | null }>();
  const kpis = useResource(() => getDashboardKPIsApi(activePeriod?._id), [activePeriod?._id]);
  const ledger = useResource(async () => { const [tb, accounts, journals] = await Promise.all([getTrialBalanceApi({ periodId: activePeriod?._id }), getAccountsApi(), allPages<JournalEntry>(async page => { const r = await getJournalsApi({ periodId: activePeriod?._id, page, limit: 100 }); return { rows: r.journals, totalPages: r.totalPages }; })]); return { tb, accounts: accounts.accounts, journals }; }, [activePeriod?._id]);
  const [selected, setSelected] = useState<KpiTileData | null>(null);
  const contributions = kpis.data?.departmentContributions || [];
  const totalRevenue = contributions.reduce((sum, row) => sum + row.revenue, 0);
  const totalCosts = contributions.reduce((sum, row) => sum + row.costs, 0);
  const strongest = [...contributions].sort((a, b) => b.net - a.net)[0];
  return <div className="desk-page"><PageHeading eyebrow={`${entity?.name || 'Dandenong Hyundai'} · ${activePeriod?.code || 'Active period'} · Management book`} title="CFO Command Centre" description="Board-ready intelligence that answers why as well as what. Every tile, row and figure on this page drills to the transaction, deal, repair order or VIN that produced it." actions={<><Tag>Live dealership KPIs</Tag><Link to="/ap"><Tag tone="amber">{kpis.data?.exceptions.openApExceptionsCount ?? '—'} exceptions to review</Tag></Link></>} />
    <Eyebrow>Dealership KPI instrumentation · Click any tile to drill</Eyebrow><LoadState loading={kpis.loading} error={kpis.error} retry={kpis.refresh} />{kpis.data && <div className="kpi-strip">{kpis.data.kpis.map(k => <button key={k.key} className="kpi-tile" onClick={() => setSelected(k)}><label title={k.label}>{k.label}</label><strong>{k.formattedValue}</strong><small>{k.trendPercentage !== undefined ? `${k.trendPercentage >= 0 ? '↗' : '↘'} ${Math.abs(k.trendPercentage).toFixed(1)}%` : '—'}</small></button>)}</div>}
    <div className="desk-columns"><div><div className="section-heading"><Eyebrow>Gross profit by department</Eyebrow><h2>Six-month gross trend</h2></div><LoadState loading={ledger.loading} error={ledger.error} retry={ledger.refresh} /><LineChart labels={kpis.data?.sixMonthGrossTrend?.labels || []} series={kpis.data?.sixMonthGrossTrend?.series || []} emptyMessage={!kpis.data?.sixMonthGrossTrend?.labels.length ? 'Department data unavailable' : undefined} /><p className="chart-note">Current-period revenue less department expenses, $000. Click a legend to isolate a department.</p><div className="section-heading section-spacer"><Eyebrow>Departmental profit & loss</Eyebrow><h2>Contribution by department</h2></div><table className="data-table"><thead><tr><th>Department</th><th>Revenue</th><th>Expenses</th><th>Contribution</th></tr></thead><tbody>{contributions.map(d => <tr key={d.name}><td><Link to="/gl" className="text-link">{d.name}</Link></td><td className="num">{dollars(d.revenue)}</td><td className="num">{dollars(d.costs)}</td><td className="num">{dollars(d.net)}</td></tr>)}</tbody></table></div>
      <aside><div className="insight-panel"><Eyebrow>Period summary</Eyebrow><h3>{kpis.data?.managementDataSource === 'demo' ? 'Demo management-book position' : 'Live management-book position'}</h3><p>Revenue of {dollars(totalRevenue)} less expenses of {dollars(totalCosts)} produces a net contribution of {dollars(totalRevenue - totalCosts)} for the selected period.</p><p>{strongest ? `${strongest.name} currently has the strongest departmental contribution at ${dollars(strongest.net)}.` : 'No departmental postings are available for this period.'} Inventory currently contains {kpis.data?.inventoryInStockCount ?? '—'} active units.</p><footer className="flex justify-between items-center"><span>{kpis.data?.managementDataSource === 'demo' ? 'Illustrative graph and contribution figures' : `Grounded in ${ledger.data?.journals.length.toLocaleString() ?? '—'} journal entries`}</span><span className="text-[#2936ff] font-medium">{kpis.data?.managementDataSource === 'demo' ? 'Demo data' : 'API-derived'}</span></footer></div><section className="side-section"><h3>Awaiting your approval</h3>{[{ name: 'Accounts payable exceptions', count: kpis.data?.exceptions.openApExceptionsCount, to: '/ap' }, { name: 'Unmatched bank transactions', count: kpis.data?.exceptions.unmatchedBankTxnsCount, to: '/bank' }, { name: 'Open control reconciliations', count: kpis.data?.exceptions.unreconciledControlRecsCount, to: '/gl' }].map(item => <article key={item.to}><Link className="toolbar text-link" to={item.to}><span>{item.name}</span><span className="num">{item.count ?? '—'} →</span></Link></article>)}</section></aside></div>
    <KpiDrillDrawer isOpen={!!selected} onClose={() => setSelected(null)} kpi={selected} periodId={activePeriod?._id} />
  </div>;
}
