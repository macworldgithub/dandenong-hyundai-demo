import { LogOut } from "lucide-react";
import { User } from "../../types/user";
import { Period } from "../../types/period";
export function ContextHeader({
  user,
  activePeriod,
  periods,
  onPeriodChange,
  onLogout,
  entityName,
  readiness,
}: {
  user: User | null;
  activePeriod: Period | null;
  periods: Period[];
  onPeriodChange?: (id: string) => void;
  onLogout: () => void;
  entityName?: string;
  readiness?: number;
}) {
  return (
    <header className="context-header">
      <div className="context-field">
        <label>Entity</label>
        <strong>{entityName || "Dandenong Hyundai"}</strong>
      </div>
      <div className="context-field">
        <label htmlFor="period">Period</label>
        <select
          id="period"
          value={activePeriod?._id || ""}
          onChange={(e) => onPeriodChange?.(e.target.value)}
          disabled={periods.length < 2}
        >
          {periods.length ? (
            periods.map((p) => (
              <option key={p._id} value={p._id}>
                {p.code}
              </option>
            ))
          ) : (
            <option value="">{activePeriod?.code || "Loading…"}</option>
          )}
        </select>
      </div>
      <div className="context-field">
        <label>Book</label>
        <strong>Management</strong>
      </div>
      <div className="context-field acting">
        <label>Acting as</label>
        <strong>
          {user?.name || "Loading…"} · {user?.role?.replace("_", " ")}
        </strong>
      </div>
      <div className="readiness">
        <label>Close readiness</label>
        <div>
          <span className="meter">
            <i style={{ width: `${readiness ?? 0}%` }} />
          </span>
          <b>{readiness === undefined ? "—" : `${readiness}%`}</b>
        </div>
      </div>
      <div className="entity-set">
        <i>/</i>
        <span>
          GST 10% · AUD
          <br />
          AUSTRALIAN ENTITY SET
        </span>
      </div>
      <button
        className="logout"
        title="Sign out"
        aria-label="Sign out"
        onClick={onLogout}
      >
        <LogOut size={12} />
      </button>
    </header>
  );
}
