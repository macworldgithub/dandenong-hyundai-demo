import { useEffect, useState } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { ApInvoice } from '../../types/ap';
import { matchInvoiceApi,approveInvoiceApi } from '../../api/ap';
import { LoadState,Tag,dollars } from '../../components/ui/Desk';
export function ThreeWayMatchDrawer({isOpen,onClose,invoice,onSuccess,onOpenException}:{isOpen:boolean;onClose:()=>void;invoice:ApInvoice|null;onSuccess:()=>void;onOpenException:(i:ApInvoice)=>void}) {
  const [current,setCurrent]=useState(invoice);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [message,setMessage]=useState('');
  useEffect(()=>{setCurrent(invoice);setError('');setMessage('');},[invoice]);
  if(!current)return null;
  async function run(approve=false){if(!current)return;setBusy(true);setError('');try{if(approve){await approveInvoiceApi(current._id);onSuccess();onClose();}else{const r=await matchInvoiceApi(current._id,current.poId||'');setCurrent(r.invoice);onSuccess();if(r.invoice.status==='exception'){onClose();onOpenException(r.invoice);}else setMessage(r.matched?'Purchase order matched within tolerance.':'No matching purchase order was found. Review the invoice before approval.');}}catch(e:any){setError(e.response?.data?.error||e.message||'Unable to process invoice.');}finally{setBusy(false);}}
  return <Drawer isOpen={isOpen} onClose={onClose} title="Purchase order match & approval" subtitle={current.invoiceNumber}><div className="summary-row"><span>Invoice total</span><b>{dollars(current.grossCents,2)}</b><Tag>{current.status}</Tag></div><p className="chart-note section-spacer">The matching service searches purchase orders for this supplier and VIN, and compares the invoice subtotal with a 2% tolerance. Review the result before posting.</p><LoadState loading={false} error={error}/>{message&&<p className="section-spacer" role="status">{message}</p>}<div className="actions section-spacer"><button className="desk-button" disabled={busy} onClick={()=>run()}>Run PO match</button><button className="desk-button primary" disabled={busy||!['coded','matched'].includes(current.status)} onClick={()=>run(true)}>Approve & post invoice</button></div></Drawer>;
}
