import { useEffect, useMemo, useState } from 'react';
import { useResource } from '../../hooks/useResource';
import { allPages } from '../../api/pagination';
import { getVehiclesApi, getDealsApi, getInventoryStatsApi } from '../../api/inventory';
import { Vehicle, DealJacket } from '../../types/inventory';
import { PageHeading, Metrics, Eyebrow, Tabs, Tag, LoadState, compact, dollars } from '../../components/ui/Desk';
import { FacilityPanel } from './FacilityPanel';
import { VinCardModal } from './VinCardModal';
import { DealJacketModal } from './DealJacketModal';
import { AddCostLineModal } from './AddCostLineModal';
import { FloorplanModal } from './FloorplanModal';

const PAGE_SIZE = 15;

function PaginationControls({
  page,
  total,
  onPageChange,
  loading = false,
}: {
  page: number;
  total: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(page * PAGE_SIZE, total);

  if (total <= PAGE_SIZE) {
    return total ? (
      <div className="pagination">
        <span>
          Showing {start}-{end} of {total}
        </span>
      </div>
    ) : null;
  }

  return (
    <div className="pagination">
      <span>
        Showing {start}-{end} of {total} · Page {page} of {totalPages}
      </span>
      <button className="desk-button" disabled={loading || page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <button className="desk-button" disabled={loading || page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </div>
  );
}

export function InventoryPage() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [view, setView] = useState('vehicles');
  const [page, setPage] = useState(1);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [cost, setCost] = useState<Vehicle | null>(null);
  const [deal, setDeal] = useState<DealJacket | null>(null);
  const [floorplan, setFloorplan] = useState(false);

  const stats = useResource(getInventoryStatsApi);
  const { data, loading, error, refresh } = useResource(async () => {
    const result = await (view === 'vehicles' ? getVehiclesApi({ page, limit: 15, class: filter === 'all' ? undefined : filter, search: query }) : getDealsApi({ page, limit: 15 }));
    return { vehicles: 'vehicles' in result ? result.vehicles : [], deals: 'deals' in result ? result.deals : [], total: result.total };
  }, [page, filter, query, view]);

  const vehicles = data?.vehicles || [];
  const deals = data?.deals || [];
  const facility = stats.data?.facility;
  const stock = vehicles.filter((v) => v.status !== 'delivered');

  const age = (v: Vehicle) => {
    if (v.ageDays !== null && v.ageDays !== undefined) return v.ageDays;
    const date = v.createdAt;
    return date ? Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000)) : null;
  };

  const bands = [
    { label: '0-30 days', min: 0, max: 30 },
    { label: '31-60 days', min: 31, max: 60 },
    { label: '61-90 days', min: 61, max: 90 },
    { label: '91-120 days', min: 91, max: 120 },
    { label: '120+ days', min: 121, max: Infinity },
  ];

  const visible = vehicles;
  const rowCount = data?.total || 0;
  const showRegistration = filter === 'all' || filter === 'used';
  const showOdometer = showRegistration;
  const showDeal = filter !== 'used';
  const showYear = showRegistration;
  const pagedVehicles = loading ? [] : vehicles;
  const pagedDeals = loading ? [] : deals;
  const summary = stats.data?.summary;
  useEffect(() => {
    const updated = () => { stats.refresh(); };
    window.addEventListener('accounting-data-updated', updated);
    return () => window.removeEventListener('accounting-data-updated', updated);
  }, [stats.refresh]);

  return (
    <div className="desk-page">
      <PageHeading
        eyebrow="Vehicle inventory accounting & floorplan management"
        title="VIN-level costing and floorplan sub-ledger"
        description="Every vehicle is a unique inventory item under specific identification. Cost accumulates by VIN and cost of sale is exact at the moment of delivery. Floorplan liability is always reconcilable to both the inventory schedule and the financier statement."
        actions={
          <button className="desk-button" onClick={() => setFloorplan(true)}>
            View stocktake reconciliation
          </button>
        }
      />

      <LoadState loading={stats.loading} error={stats.error} retry={stats.refresh} />
      <Metrics
        items={[
          {
            label: 'Units in stock',
            value: summary ? summary.count : '-',
            note: 'Across new, used and demonstrator',
          },
          {
            label: 'Inventory at cost',
            value: summary ? compact(summary.cost) : '-',
            note: 'New, used and demonstrator',
          },
          {
            label: 'Floorplan drawn',
            value: facility ? compact(facility.totalDrawnCents) : '-',
            note: facility ? 'of ' + compact(facility.facilityLimitCents) + ' facility' : 'Facility balance',
          },
          {
            label: 'Facility utilisation',
            value:
              facility && facility.facilityLimitCents
                ? `${((facility.totalDrawnCents / facility.facilityLimitCents) * 100).toFixed(1)}%`
                : '-',
            note: facility ? compact(facility.headroomCents) + ' headroom' : 'Available credit',
            tone: 'amber',
          },
          {
            label: 'Stock over 90 days',
            value: summary ? summary.over90 : '-',
            note: 'Review aging stock',
            tone: 'amber',
          },
        ]}
      />

      <div className="section-heading">
        <Eyebrow>Days in stock</Eyebrow>
        <h2>Inventory aging heat map</h2>
        <p>
          The age supplied by the stock CSV determines each vehicle's aging band and highlights stock requiring review.
        </p>
      </div>

      <LoadState loading={loading} error={error} retry={refresh} />

      <div className="heatmap">
        {bands.map((band, index) => {
          const bucket = summary?.bands.find(b => b._id === band.min);
          return (
            <div key={band.label} style={{ background: `rgba(174, 45, 35, ${index * 0.023})` }}>
              <label>{band.label}</label>
              <strong>{summary ? bucket?.count || 0 : '-'}</strong>
              <small>units · {summary ? compact(bucket?.cost || 0) : '-'}</small>
              <div className="bar">
                <i style={{ width: `${summary?.count ? ((bucket?.count || 0) / summary.count) * 100 : 0}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="desk-columns">
        <div>
          <Tabs
            label="Class"
            values={['all', 'new', 'used', 'demo'].map((key) => ({ key, label: key }))}
            value={filter}
            onChange={value => { setPage(1); setFilter(value); }}
          />

          <div className="table-scroll">
            {view === 'vehicles' ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Stock no</th>
                    {showYear && <th>Year</th>}
                    <th>Carline</th>
                    <th>Description</th>
                    {showRegistration && <th>Reg no</th>}
                    {showOdometer && <th>Odometer</th>}
                    <th>Colour</th>
                    <th>Loc</th>
                    <th>Days</th>
                    <th>List price</th>
                    {showDeal && <th>Deal</th>}
                    <th>Status</th>
                    <th>Open RO/PO</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedVehicles.map((v) => {
                    const days = age(v);

                    return (
                      <tr key={v._id}>
                        <td>
                          <button className="text-link num" onClick={() => setVehicle(v)}>
                            {v.stockNumber}
                          </button>
                        </td>
                        {showYear && <td>{v.class === 'used' ? v.year : '-'}</td>}
                        <td>{v.model}</td>
                        <td>{v.csvDescription || v.variant || '-'}</td>
                        {showRegistration && <td className="num">{v.registrationNumber || '-'}</td>}
                        {showOdometer && <td className="num">{v.odometerKm !== null && v.odometerKm !== undefined ? v.odometerKm.toLocaleString() : '-'}</td>}
                        <td>{v.colour || '-'}</td>
                        <td>{v.location || '-'}</td>
                        <td>
                          <Tag tone={days !== null && days > 90 ? 'red' : 'gray'}>{days === null ? '-' : days + 'd'}</Tag>
                        </td>
                        <td className="num">{dollars(v.listPriceCents || 0, 2)}</td>
                        {showDeal && <td className="num">{v.deal || '-'}</td>}
                        <td><Tag tone={v.status === 'delivered' ? 'gray' : 'blue'}>{v.sourceStatus || '-'}</Tag></td>
                        <td>{v.openRoPo || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Deal</th>
                    <th>Delivery</th>
                    <th>Sale</th>
                    <th>Contribution</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedDeals.map((d) => (
                    <tr key={d._id}>
                      <td>
                        <button className="text-link" onClick={() => setDeal(d)}>
                          {d.dealNumber}
                        </button>
                      </td>
                      <td>{new Date(d.deliveryDate).toLocaleDateString('en-AU')}</td>
                      <td className="num">{dollars(d.sellingPriceCents)}</td>
                      <td className="num">{dollars(d.dealContributionCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <PaginationControls page={page} total={rowCount} onPageChange={setPage} loading={loading} />
          <LoadState loading={false} empty={!!data && (view === 'vehicles' ? !visible.length : !deals.length)} />

          <div className="toolbar section-spacer">
            <input
              className="search-input"
              aria-label="Search stock or VIN"
              placeholder="Search stock, VIN, registration, model, colour or deal..."
              value={query}
              onChange={(e) => { setPage(1); setQuery(e.target.value); }}
            />
            <button className="desk-button" onClick={() => { setPage(1); setView(view === 'vehicles' ? 'deals' : 'vehicles'); }}>
              {view === 'vehicles' ? 'Delivered deal jackets' : 'Vehicle register'}
            </button>
          </div>
          <p className="chart-note">
            Aging uses the CSV age value where supplied, otherwise the inventory creation date.
          </p>
        </div>
        <FacilityPanel data={facility || null} />
      </div>

      <VinCardModal
        isOpen={!!vehicle}
        onClose={() => setVehicle(null)}
        vehicle={vehicle}
        onOpenAddCostLine={(v) => {
          setVehicle(null);
          setCost(v);
        }}
      />
      <AddCostLineModal isOpen={!!cost} onClose={() => setCost(null)} vehicle={cost} onSuccess={refresh} />
      <DealJacketModal isOpen={!!deal} onClose={() => setDeal(null)} deal={deal} />
      <FloorplanModal isOpen={floorplan} onClose={() => setFloorplan(false)} />
    </div>
  );
}
