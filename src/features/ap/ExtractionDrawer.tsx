import { useEffect, useState } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { ApInvoice } from '../../types/ap';
import { getAccountsApi } from '../../api/gl';
import { getSuppliersApi, updateExtractionApi, codeInvoiceApi } from '../../api/ap';
import { useResource } from '../../hooks/useResource';
import { LoadState,Confidence,dollars } from '../../components/ui/Desk';
export function ExtractionDrawer({isOpen,onClose,invoice,onSuccess,onOpenThreeWayMatch}:{isOpen:boolean;onClose:()=>void;invoice:ApInvoice|null;onSuccess:()=>void;onOpenThreeWayMatch:(i:ApInvoice)=>void}) {
  const [number,setNumber]=useState('');const [vin,setVin]=useState('');const [account,setAccount]=useState('');const [supplier,setSupplier]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  const options=useResource(async()=>{if(!isOpen)return {accounts:[],suppliers:[]};const [a,s]=await Promise.all([getAccountsApi(),getSuppliersApi()]);return {accounts:a.accounts,suppliers:s.suppliers};},[isOpen]);
  useEffect(()=>{if(invoice){setNumber(invoice.invoiceNumber);setVin(invoice.vin||'');const a=invoice.lines[0]?.accountId;setAccount(typeof a==='object'?a._id:a||'');setSupplier(typeof invoice.supplierId==='object'?invoice.supplierId?._id||'':invoice.supplierId||'');setError('');}},[invoice]);
  if(!invoice)return null;
  async function save(code=false) {
    if(!invoice)return;
    setBusy(true);setError('');
    try {
      const saved=await updateExtractionApi(invoice._id,{invoiceNumber:number,vin,supplierId:supplier||undefined});
      if(code){const result=await codeInvoiceApi(invoice._id,{vin,lines:invoice.lines.map(l=>({...l,accountId:account}))});onSuccess();onClose();onOpenThreeWayMatch(result.invoice);}
      else {onSuccess();onClose();}
    }catch(e:any){setError(e.response?.data?.error||e.message||'Unable to save invoice.');}
    finally {setBusy(false);}
  }
  return <Drawer isOpen={isOpen} onClose={onClose} title="Document extraction review" subtitle={invoice.invoiceNumber} width="lg"><div className="summary-row"><strong>Invoice total</strong><b>{dollars(invoice.grossCents,2)}</b><Confidence value={invoice.extraction?.confidence}/></div><LoadState loading={options.loading} error={options.error||error} retry={options.refresh}/><div className="form-fields"><label>Invoice number<input value={number} onChange={e=>setNumber(e.target.value)}/></label><label>Supplier<select value={supplier} onChange={e=>setSupplier(e.target.value)}><option value="">Select supplier</option>{options.data?.suppliers.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}</select></label><label>VIN (optional)<input value={vin} onChange={e=>setVin(e.target.value)}/></label><label>General ledger account<select value={account} onChange={e=>setAccount(e.target.value)}><option value="">Select account</option>{options.data?.accounts.map(a=><option key={a._id} value={a._id}>{a.code} · {a.name}</option>)}</select></label></div><table className="data-table section-spacer"><thead><tr><th>Description</th><th>Quantity</th><th>Amount</th></tr></thead><tbody>{invoice.lines.map((l,i)=><tr key={i}><td>{l.description}</td><td>{l.quantity}</td><td className="num">{dollars(l.totalCents,2)}</td></tr>)}</tbody></table><div className="actions section-spacer"><button className="desk-button" disabled={busy||!number.trim()} onClick={()=>save()}>Save corrections</button><button className="desk-button primary" disabled={busy||!account||!supplier||!number.trim()||!['captured','exception'].includes(invoice.status)} onClick={()=>save(true)}>{busy?'Saving…':'Code & review match'}</button></div></Drawer>;
}
