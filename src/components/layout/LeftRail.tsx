import { NavLink } from 'react-router-dom';
import { Activity, BookOpen, Boxes, Building2, CalendarDays, FileText, Gauge, Landmark, MessageSquare, Receipt, ScrollText, ShieldCheck, Wrench, type LucideIcon } from 'lucide-react';
export function BrandMark() {
  return <svg viewBox="0 0 42 42" fill="none" aria-hidden="true"><path d="M34 6H19L8 17v11l8-8h12l-6 7H10l-6 8h19l12-13V12L23 24h-8l8-9h8l7-9ZM12 31l-4-4M19 10l-7 8v5M29 28l-7 7H11" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>;
}
type Item = { label: string; icon: LucideIcon; to?: string; count?: number };
export function LeftRail({ openApExceptionsCount = 0 }: { unmatchedBankCount?: number; openApExceptionsCount?: number; openControlRecsCount?: number }) {
  const groups: { title: string; items: Item[] }[] = [
    { title: 'Command', items: [{ label: 'CFO Command Centre', icon: Gauge, to: '/' }, { label: 'Natural Language Query', icon: MessageSquare }] },
    { title: 'Ledgers', items: [{ label: 'General Ledger', icon: BookOpen, to: '/gl' }, { label: 'Accounts Payable', icon: Receipt, to: '/ap', count: openApExceptionsCount }, { label: 'Accounts Receivable', icon: FileText }, { label: 'Inventory & Floorplan', icon: Boxes, to: '/inventory' }, { label: 'Parts & Service', icon: Wrench }] },
    { title: 'Group', items: [{ label: 'Consolidation', icon: Building2 }, { label: 'Cash & Treasury', icon: Landmark, to: '/bank' }] },
    { title: 'Intelligence', items: [{ label: 'AI Automation Layer', icon: Activity }, { label: 'Continuous Close', icon: CalendarDays }, { label: 'Reports & Analytics', icon: ScrollText }] },
    { title: 'Control', items: [{ label: 'Compliance & Audit', icon: ShieldCheck }] },
  ];
  return <aside className="left-rail"><div className="brand"><BrandMark /><div><strong>GOOD<br />SHOWROOM</strong><small>ACCOUNTING SUITE</small></div></div><nav aria-label="Main navigation">{groups.map(group => <section key={group.title}><h2>{group.title}</h2>{group.items.map(({ label, icon: Icon, to, count }) => to ? <NavLink key={label} to={to} end={to === '/'} className={({ isActive }) => `rail-link ${isActive ? 'active' : ''}`}><Icon /><span>{label}</span>{!!count && <b className="rail-count">{count}</b>}</NavLink> : <span key={label} className="rail-link unavailable" title="Not available in this demo"><Icon /><span>{label}</span></span>)}</section>)}</nav><footer><BrandMark /><span>DEMO ENVIRONMENT<br />ILLUSTRATIVE DATA</span></footer></aside>;
}
