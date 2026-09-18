import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { ApInvoice } from '../../types/ap';
import { createPaymentRunApi, approvePaymentRunApi } from '../../api/ap';
import { dollars, LoadState, Tag } from '../../components/ui/Desk';

export function PaymentRunModal({ isOpen, onClose, approvedInvoices, onSuccess }: { isOpen: boolean; onClose: () => void; approvedInvoices: ApInvoice[]; onSuccess: () => void }) {
  const [selected, setSelected] = useState(approvedInvoices.map(i=>i._id));
  const [runId, setRunId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit() {
    setBusy(true); setError('');
    try {
      if (!runId) { const r = await createPaymentRunApi(selected); setRunId(r.paymentRun._id); }
      else { await approvePaymentRunApi(runId); setDone(true); onSuccess(); }
    } catch(e:any) { setError(e.response?.data?.error || e.message || 'Payment run failed.'); }
    finally { setBusy(false); }
  }
  const total = approvedInvoices.filter(i=>selected.includes(i._id)).reduce((sum,i)=>sum+i.grossCents,0);
  return <Modal isOpen={isOpen} onClose={onClose} title={done ? 'Payment run approved' : 'Prepare payment run'} subtitle="Review approved supplier invoices before creating and approving a payment run.">
    {done ? <><Tag tone="green">Approved</Tag><p className="section-spacer">The backend has marked the selected invoices as paid. Bank file export is not available from this API.</p></> : <><p className="mb-4">Selected total: <strong className="num">{dollars(total,2)}</strong></p>{approvedInvoices.map(i=><label key={i._id} className="summary-row"><span><input type="checkbox" disabled={!!runId || busy} checked={selected.includes(i._id)} onChange={()=>setSelected(ids=>ids.includes(i._id)?ids.filter(id=>id!==i._id):[...ids,i._id])}/> {i.invoiceNumber}</span><b>{dollars(i.grossCents,2)}</b></label>)}<LoadState loading={false} error={error}/><div className="actions section-spacer"><button className="desk-button" onClick={onClose}>Close</button><button className="desk-button primary" disabled={busy || !selected.length} onClick={submit}>{busy?'Processing…':runId?'Approve payment run':'Create draft run'}</button></div></>}
  </Modal>;
}
