import { compact, dollars } from '../../components/ui/Desk';
import { getFloorplanApi } from '../../api/inventory';
export type FacilityData = Awaited<ReturnType<typeof getFloorplanApi>>;
export function FacilityPanel({ data }: { data: FacilityData | null }) {
  const financiers = data?.financiers || [];
  return <section className="side-section" style={{marginTop:0}}><h3>Floorplan facilities</h3>{data ? <>{financiers.map(f=>{ const name=f._id; const total=f.drawn; return <article key={name}><div className="toolbar"><strong>{name}</strong><span className="num">{compact(total)}</span></div><div className="meter" style={{width:'100%',margin:'10px 0 8px'}}><i style={{width:`${data.totalDrawnCents ? total/data.totalDrawnCents*100 : 0}%`,background:'#957700'}}/></div><p>{f.count} vehicles · {dollars(f.interest)} accrued interest</p></article>})}<article><div className="toolbar"><span>Available credit</span><strong className="num">{compact(data.headroomCents)}</strong></div><p>Across a {compact(data.facilityLimitCents)} facility. Bars show each financier’s share of total drawings.</p></article></> : <p className="chart-note">Facility information unavailable.</p>}</section>;
}
