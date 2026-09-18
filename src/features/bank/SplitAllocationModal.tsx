import { useEffect,useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { BankTransaction } from '../../types/bank';
import { splitBankTransactionApi } from '../../api/bank';
import { getAccountsApi } from '../../api/gl';
import { useResource } from '../../hooks/useResource';
import { LoadState,dollars } from '../../components/ui/Desk';
type Row={amount:string;accountId:string;note:string};
export function SplitAllocationModal({isOpen,onClose,transaction,onSuccess}:{isOpen:boolean;onClose:()=>void;transaction:BankTransaction|null;onSuccess:()=>void}) {
  const empty=():Row=>({amount:'',accountId:'',note:''});
  const [rows,setRows]=useState<Row[]>([empty(),empty()]);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  const accounts=useResource(async()=>isOpen?(await getAccountsApi()).accounts:[],[isOpen]);
  useEffect(()=>{setRows([empty(),empty()]);setError('');},[transaction?._id]);
  if(!transaction)return null;
  const txn=transaction;
  const cents=(r:Row)=>Math.round(Number(r.amount)*100);
  const total=rows.reduce((s,r)=>s+cents(r),0);const remainder=Math.abs(txn.amountCents)-total;
  const valid=rows.length>=2&&remainder===0&&rows.every(r=>Number.isFinite(cents(r))&&cents(r)>0&&r.accountId);
  function update(index:number,field:keyof Row,value:string){setRows(old=>old.map((r,i)=>i===index?{...r,[field]:value}:r));}
  async function submit(){setBusy(true);setError('');try{await splitBankTransactionApi(txn._id,{splits:rows.map(r=>({amountCents:cents(r),accountId:r.accountId,note:r.note}))});onSuccess();onClose();}catch(e:any){setError(e.response?.data?.error||e.message);}finally{setBusy(false);}}
  return <Modal isOpen={isOpen} onClose={onClose} title="Split bank transaction" subtitle={txn.description} maxWidth="2xl"><div className="summary-row"><span>Total to allocate</span><b>{dollars(Math.abs(txn.amountCents),2)}</b></div><div className="summary-row"><span>Unallocated remainder</span><b>{dollars(remainder,2)}</b></div><LoadState loading={accounts.loading} error={accounts.error||error} retry={accounts.refresh}/><div className="form-fields">{rows.map((r,index)=><div key={index}><div className="split-row"><input aria-label={'Amount '+(index+1)} type="number" min=".01" step=".01" placeholder="Amount $" value={r.amount} onChange={e=>update(index,'amount',e.target.value)}/><select aria-label={'GL account '+(index+1)} value={r.accountId} onChange={e=>update(index,'accountId',e.target.value)}><option value="">Select account</option>{accounts.data?.map(a=><option key={a._id} value={a._id}>{a.code} · {a.name}</option>)}</select><button className="desk-button" aria-label={'Remove allocation '+(index+1)} disabled={rows.length<=2||busy} onClick={()=>setRows(old=>old.filter((_,i)=>i!==index))}>×</button></div><input aria-label={'Reference '+(index+1)} value={r.note} onChange={e=>update(index,'note',e.target.value)} placeholder="Deal or document reference (optional)"/></div>)}</div><div className="actions section-spacer"><button className="desk-button" disabled={busy} onClick={()=>setRows(old=>[...old,empty()])}>Add allocation</button><button className="desk-button primary" disabled={busy||!valid} onClick={submit}>{busy?'Posting…':'Post split allocation'}</button></div></Modal>;
}
