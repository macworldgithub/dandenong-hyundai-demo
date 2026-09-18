import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { getBankAccountsApi,getBankTransactionsApi } from '../../api/bank';
import { getFloorplanApi } from '../../api/inventory';
import { getInvoicesApi } from '../../api/ap';
import { allPages } from '../../api/pagination';
import { useResource } from '../../hooks/useResource';
import { BankTransaction } from '../../types/bank';
import { ApInvoice } from '../../types/ap';
import { Period } from '../../types/period';
import { PageHeading,Metrics,Eyebrow,Tag,LoadState,Confidence,compact,dollars } from '../../components/ui/Desk';
import { LineChart } from '../../components/ui/LineChart';
import { FacilityPanel } from '../inventory/FacilityPanel';
import { StatementUploadModal } from './StatementUploadModal';
import { MatchSuggestionDrawer } from './MatchSuggestionDrawer';
import { SplitAllocationModal } from './SplitAllocationModal';
import { RecPackModal } from './RecPackModal';
import { PaymentRunModal } from '../ap/PaymentRunModal';

export function BankPage() {
  const {activePeriod}=useOutletContext<{activePeriod:Period|null}>();
  const {data,loading,error,refresh}=useResource(async()=>{const [accounts,transactions,facility,invoices]=await Promise.all([getBankAccountsApi(),allPages<BankTransaction>(async page=>{const r=await getBankTransactionsApi({page,limit:100});return {rows:r.transactions,totalPages:r.totalPages};}),getFloorplanApi(),allPages<ApInvoice>(async page=>{const r=await getInvoicesApi({page,limit:100});return {rows:r.invoices,totalPages:r.totalPages};})]);return {accounts:accounts.accounts,transactions,facility,invoices};});
  const [scenario,setScenario]=useState('base'); const [accountId,setAccountId]=useState(''); const [filter,setFilter]=useState('all'); const [query,setQuery]=useState('');
  const [upload,setUpload]=useState(false); const [rec,setRec]=useState(false); const [payment,setPayment]=useState(false); const [match,setMatch]=useState<BankTransaction|null>(null); const [split,setSplit]=useState<BankTransaction|null>(null);
  const accounts=data?.accounts||[]; const transactions=data?.transactions||[];
  const selectedAccountId=accountId||accounts[0]?._id||'';
  const visible=transactions.filter(t=>(typeof t.bankAccountId==='object'?t.bankAccountId._id:t.bankAccountId)===selectedAccountId&&(filter==='all'||t.status===filter)&&t.description.toLowerCase().includes(query.toLowerCase()));
  const signed=(t:BankTransaction)=>t.direction==='debit'?-Math.abs(t.amountCents):Math.abs(t.amountCents);
  const cash=accounts.reduce((sum,a)=>sum+(a.currentBalanceCents??a.openingBalanceCents+transactions.filter(t=>(typeof t.bankAccountId==='object'?t.bankAccountId._id:t.bankAccountId)===a._id).reduce((s,t)=>s+signed(t),0)),0);
  const recent=transactions.filter(t=>{const age=Date.now()-new Date(t.date).getTime();return age>=0&&age<=56*86400000;});
  const receipts=recent.filter(t=>t.direction==='credit').reduce((s,t)=>s+Math.abs(t.amountCents),0)/8;
  const payments=recent.filter(t=>t.direction==='debit').reduce((s,t)=>s+Math.abs(t.amountCents),0)/8;
  const factor=scenario==='upside'?1.1:scenario==='downside'?.9:1;
  const forecast=Array.from({length:8},(_,i)=>cash+(i+1)*(receipts*factor-payments));
  const matched=transactions.filter(t=>t.status==='matched').length;
  const approved=data?.invoices.filter(i=>i.status==='approved')||[];
  return <div className="desk-page"><PageHeading eyebrow="Cash, bank & treasury" title="Reconciliation, forecasting and facility monitoring" description="Bank feeds arrive continuously through Open Banking. The reconciliation agent matches, splits fees and allocates multi-deal deposits, surfacing only what it cannot resolve. Cash forecasting runs off committed positions rather than a spreadsheet extrapolation." actions={<><Tag tone="amber">Auto-match target 75.0%</Tag><button className="desk-button primary" disabled={!approved.length} onClick={()=>setPayment(true)}><ShieldCheck/>Release payment run</button></>}/>
    <Metrics items={[{label:'Cash at bank',value:data?compact(cash):'—',note:'Opening balances plus imported transactions'},{label:'Forecast 8-week trough',value:data&&recent.length?compact(Math.min(...forecast)):'—',note:'Historical run-rate estimate',tone:'green'},{label:'Floorplan drawn',value:data?compact(data.facility.totalDrawnCents):'—',note:data&&data.facility.facilityLimitCents?`${(data.facility.totalDrawnCents/data.facility.facilityLimitCents*100).toFixed(1)}% of facility`:'Facility utilisation'},{label:'Available credit',value:data?compact(data.facility.headroomCents):'—',note:'Across all facilities',tone:'green'},{label:'Items in suspense',value:data?transactions.filter(t=>t.status==='parked').length:'—',note:'Awaiting human resolution',tone:'amber'}]}/>
    <LoadState loading={loading} error={error} retry={refresh}/>
    <div className="desk-columns"><div><div className="section-heading"><Eyebrow>Cash flow forecast · Scenario modelling</Eyebrow><h2>Eight-week rolling position, $000</h2></div><div className="toolbar"><div className="scenario-buttons">{['base','upside','downside'].map(s=><button key={s} className={scenario===s?'selected':''} onClick={()=>setScenario(s)}>{s==='base'?'Base case':s}</button>)}</div><p className="chart-note" style={{maxWidth:225}}>Receipts {scenario==='base'?'unchanged':scenario==='upside'?'+10%':'−10%'}, payments held at the historical weekly average.</p></div><LineChart area labels={Array.from({length:8},(_,i)=>'W'+(i+1))} series={[{name:scenario==='base'?'Base case forecast':scenario+' forecast',color:'#2936ff',values:forecast.map(v=>v/100000)}]} emptyMessage={!data||!recent.length?'No recent cash-flow history available':undefined}/><p className="chart-note">Estimate based on the last eight weeks of imported receipts and payments. The API does not provide committed-position forecasts.</p>
    <div className="section-heading section-spacer"><Eyebrow>Bank reconciliation</Eyebrow><h2>Continuous matching register</h2><p>The agent matches as transactions arrive, so reconciliation is a state rather than a task.</p></div><div className="toolbar"><select aria-label="Bank account" className="search-input" value={selectedAccountId} onChange={e=>setAccountId(e.target.value)}>{accounts.map(a=><option key={a._id} value={a._id}>{a.name}</option>)}</select><select aria-label="Transaction status" className="search-input" value={filter} onChange={e=>setFilter(e.target.value)}>{['all','unmatched','suggested','matched','parked','split'].map(s=><option key={s}>{s}</option>)}</select></div><div className="table-scroll section-spacer"><table className="data-table"><thead><tr><th>Date / description</th><th>Amount</th><th>Confidence</th><th>State</th></tr></thead><tbody>{visible.map(t=><tr key={t._id}><td><button className="text-link" onClick={()=>setMatch(t)}>{t.description}</button><small>{new Date(t.date).toLocaleDateString('en-AU')}</small></td><td className="num">{dollars(signed(t),2)}</td><td><Confidence value={t.matchConfidence}/></td><td><Tag tone={t.status==='matched'?'green':t.status==='unmatched'?'amber':'blue'}>{t.status}</Tag></td></tr>)}</tbody></table></div><LoadState loading={false} empty={!!data&&!visible.length}/><div className="actions section-spacer"><button className="desk-button" disabled={!selectedAccountId} onClick={()=>setUpload(true)}>Import statement</button><button className="desk-button" disabled={!selectedAccountId} onClick={()=>setRec(true)}>Generate rec pack</button></div><input className="search-input section-spacer" aria-label="Search transactions" placeholder="Search transactions…" value={query} onChange={e=>setQuery(e.target.value)}/></div>
    <aside><div className="insight-panel"><Eyebrow>Bank reconciliation agent</Eyebrow><h3>Reconciliation state</h3>{[['Transactions imported',transactions.length],['Matched',matched],['Suggested matches',transactions.filter(t=>t.status==='suggested').length],['Multi-deal deposits split',transactions.filter(t=>t.status==='split').length],['Left for a human',transactions.filter(t=>['unmatched','parked'].includes(t.status)).length]].map(([label,value])=><div className="summary-row" key={label}><span>{label}</span><b>{data?Number(value).toLocaleString():'—'}</b></div>)}<p style={{marginTop:15}}>Review matching suggestions and the residual transactions the agent could not resolve. Each allocation links back to the original statement.</p></div><div className="section-spacer"><FacilityPanel data={data?.facility||null}/></div></aside></div>
    {selectedAccountId&&<><StatementUploadModal isOpen={upload} onClose={()=>setUpload(false)} bankAccountId={selectedAccountId} onSuccess={refresh}/><RecPackModal isOpen={rec} onClose={()=>setRec(false)} bankAccountId={selectedAccountId} periodId={activePeriod?._id}/></>}
    <MatchSuggestionDrawer isOpen={!!match} onClose={()=>setMatch(null)} transaction={match} onSuccess={refresh} onOpenSplit={t=>{setMatch(null);setSplit(t);}}/>
    <SplitAllocationModal isOpen={!!split} onClose={()=>setSplit(null)} transaction={split} onSuccess={refresh}/>
    {payment&&<PaymentRunModal isOpen onClose={()=>setPayment(false)} approvedInvoices={approved} onSuccess={refresh}/>}
  </div>;
}
