import { useState } from 'react';
import { ArrowRight, Upload } from 'lucide-react';
import { PageHeading, Metrics, Tabs, Tag, Confidence, LoadState, dollars } from '../../components/ui/Desk';
import { useResource } from '../../hooks/useResource';
import { allPages } from '../../api/pagination';
import { getInvoicesApi } from '../../api/ap';
import { ApInvoice } from '../../types/ap';
import { formatDate } from '../../lib/dates';
import { InvoiceUploadModal } from './InvoiceUploadModal';
import { ExtractionDrawer } from './ExtractionDrawer';
import { ExceptionDrawer } from './ExceptionDrawer';
import { ThreeWayMatchDrawer } from './ThreeWayMatchDrawer';
import { PaymentRunModal } from './PaymentRunModal';
import { AgeingViewModal } from './AgeingViewModal';

const supplier = (invoice: ApInvoice) => typeof invoice.supplierId === 'object' ? invoice.supplierId?.name || 'Unassigned supplier' : 'Unassigned supplier';
const states: Record<string, { label: string; tone: string }> = { captured: { label: 'Captured', tone: 'gray' }, coded: { label: 'Ready to post', tone: 'blue' }, matched: { label: 'Awaiting approval', tone: 'amber' }, exception: { label: 'Exception', tone: 'red' }, approved: { label: 'Posted', tone: 'green' }, paid: { label: 'Paid', tone: 'green' } };
export function ApPage() {
  const { data, loading, error, refresh } = useResource(() => allPages<ApInvoice>(async page => { const r = await getInvoicesApi({ page, limit: 100 }); return { rows: r.invoices, totalPages: r.totalPages }; }));
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [upload, setUpload] = useState(false);
  const [payment, setPayment] = useState(false);
  const [ageing, setAgeing] = useState(false);
  const [edit, setEdit] = useState<ApInvoice | null>(null);
  const [match, setMatch] = useState<ApInvoice | null>(null);
  const [exception, setException] = useState<ApInvoice | null>(null);
  const invoices = data || [];
  const visible = invoices.filter(i => (filter === 'all' || i.status === filter) && (supplier(i) + i.invoiceNumber).toLowerCase().includes(query.toLowerCase()));
  const selected = visible.find(i => i._id === selectedId) || visible.find(i => i.status === 'exception') || visible[0];
  const approved = invoices.filter(i => i.status === 'approved');
  return <div className="desk-page">
    <PageHeading eyebrow="Accounts payable · AI capture inbox" title="Supplier invoice processing" description="Documents arrive from the AP inbox, supplier portals and direct upload. The Document Capture Agent extracts fields with page-level provenance; the Coding & Matching Agent proposes GL treatment from this dealership’s own history. Only true exceptions reach a human." actions={<><button className="desk-button" onClick={() => setUpload(true)}><Upload/>Upload document</button><button className="desk-button primary" onClick={() => setPayment(true)} disabled={!approved.length}>Prepare payment run <ArrowRight/></button></>}/>
    <Metrics items={[{ label: 'In queue', value: data ? invoices.length.toLocaleString() : '—', note: 'Documents ingested from all channels' }, { label: 'Matched invoices', value: data ? invoices.filter(i => i.status === 'matched').length : '—', note: 'Ready for approval', tone: 'blue' }, { label: 'Open exceptions', value: data ? invoices.filter(i => i.status === 'exception').length : '—', note: 'Routed with suggested resolution attached', tone: 'amber' }, { label: 'Ready for payment', value: data ? approved.length : '—', note: 'Approved and posted invoices' }]}/>
    <Tabs label="Filter" value={filter} onChange={setFilter} values={[{key:'all',label:'All'},{key:'coded',label:'Ready to post'},{key:'exception',label:'Exception'},{key:'matched',label:'Awaiting approval'},{key:'approved',label:'Posted'},{key:'paid',label:'Paid'}]}/>
    <LoadState loading={loading} error={error} retry={refresh}/>
    {!loading && !error && <div className="desk-columns ap-columns"><div><div className="table-scroll"><table className="data-table"><thead><tr><th>Supplier / invoice</th><th>Total</th><th>Match</th><th>Confidence</th><th>State</th></tr></thead><tbody>{visible.map(inv => <tr key={inv._id} className={selected?._id === inv._id ? 'selected' : ''} onClick={() => setSelectedId(inv._id)}><td><button className="text-link" onClick={() => setSelectedId(inv._id)}>{supplier(inv)}</button><small className="num">{inv.invoiceNumber} · {formatDate(inv.invoiceDate)}</small></td><td className="num">{dollars(inv.grossCents,2)}</td><td style={{fontSize:10,color:'#858580'}}>{inv.status === 'exception' ? 'Price variance' : inv.poId ? '3-way matched' : 'No PO'}</td><td><Confidence value={inv.extraction?.confidence}/></td><td><Tag tone={states[inv.status]?.tone}>{states[inv.status]?.label || inv.status}</Tag></td></tr>)}</tbody></table></div><LoadState loading={false} empty={!visible.length}/><div className="toolbar section-spacer"><input aria-label="Search invoice or supplier" className="search-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search invoice or supplier…"/><button className="desk-button" onClick={()=>setAgeing(true)}>Ageing schedule</button></div></div>
    <aside className="extraction-panel">{selected ? <><div className="extraction-header"><div className="toolbar"><div className="eyebrow"><i>/</i> AP · Extraction</div><Tag tone={states[selected.status]?.tone}>{states[selected.status]?.label}</Tag></div><h3>{supplier(selected)}</h3><small className="num" style={{color:'#858580'}}>{selected.invoiceNumber} · due {formatDate(selected.dueDate)}</small></div><div className="extraction-body"><Metrics items={[{label:'Invoice total',value:dollars(selected.grossCents,2),note:'GST '+dollars(selected.gstCents,2)},{label:'Overall confidence',value:selected.extraction ? `${Math.round(selected.extraction.confidence <= 1 ? selected.extraction.confidence*100 : selected.extraction.confidence)}%` : '—',note:selected.status === 'exception' ? 'Review required' : 'Document extraction',tone:'blue'}]}/>{selected.exceptions.filter(e=>e.status==='open').map((e,index)=><div key={e._id || index} className="exception-box"><label>Exception raised</label>{e.description}</div>)}<div className="side-section"><h3>Extracted fields</h3>{selected.extraction?.fields.map((field,index)=><div className="summary-row" key={field.name+index}><span>{field.name.replace(/([A-Z])/g,' $1')}</span><b>{String(field.value)}</b><Confidence value={field.confidence}/></div>)}</div><div className="actions section-spacer"><button className="desk-button" onClick={()=>setEdit(selected)}>Review extraction</button>{selected.status==='exception' ? <button className="desk-button primary" onClick={()=>setException(selected)}>Resolve</button> : ['coded','matched'].includes(selected.status) && <button className="desk-button primary" onClick={()=>setMatch(selected)}>Match & approve</button>}</div></div></> : <LoadState loading={false} empty/>}</aside></div>}
    <InvoiceUploadModal isOpen={upload} onClose={()=>setUpload(false)} onSuccess={inv=>{ refresh(); setSelectedId(inv._id); setEdit(inv); }}/>
    <ExtractionDrawer isOpen={!!edit} onClose={()=>setEdit(null)} invoice={edit} onSuccess={refresh} onOpenThreeWayMatch={inv=>{setEdit(null);setMatch(inv);}}/>
    <ThreeWayMatchDrawer isOpen={!!match} onClose={()=>setMatch(null)} invoice={match} onSuccess={refresh} onOpenException={inv=>{setMatch(null);setException(inv);}}/>
    <ExceptionDrawer isOpen={!!exception} onClose={()=>setException(null)} invoice={exception} onSuccess={refresh}/>
    {payment && <PaymentRunModal isOpen onClose={()=>setPayment(false)} approvedInvoices={approved} onSuccess={refresh}/>}
    <AgeingViewModal isOpen={ageing} onClose={()=>setAgeing(false)}/>
  </div>;
}
