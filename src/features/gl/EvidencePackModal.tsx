import { Modal } from '../../components/ui/Modal';
import { useResource } from '../../hooks/useResource';
import { exportEvidencePackApi } from '../../api/gl';
import { LoadState } from '../../components/ui/Desk';
export function EvidencePackModal({isOpen,onClose,periodId}:{isOpen:boolean;onClose:()=>void;periodId?:string}) {
  const resource=useResource(async()=>isOpen?exportEvidencePackApi(periodId):null,[isOpen,periodId]);
  const pack=resource.data;
  function download(){if(!pack)return;const url=URL.createObjectURL(new Blob([JSON.stringify(pack,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='Audit_Evidence_Pack_'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  return <Modal isOpen={isOpen} onClose={onClose} title="Audit evidence pack" subtitle="Export the reconciliation evidence returned by the backend."><LoadState loading={resource.loading} error={resource.error} retry={resource.refresh}/>{pack&&<><div className="summary-row"><span>Generated</span><b>{new Date(pack.generatedAt).toLocaleString('en-AU')}</b></div><div className="summary-row"><span>Control reconciliations</span><b>{pack.controlRecs.length}</b></div><div className="summary-row"><span>Bank reconciliation packs</span><b>{pack.bankRecPacks.length}</b></div><p className="chart-note section-spacer">The export contains the actual reconciliation records and summary. Review outstanding differences before signing off.</p><button className="desk-button primary section-spacer" onClick={download}>Download JSON evidence pack</button></>}</Modal>;
}
