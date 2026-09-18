import React, { useEffect, useState } from 'react';
import { History, Search, RefreshCw, Shield, ChevronDown, ChevronRight, User } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import { getAuditLogsApi } from '../../api/audit';
import { AuditLogEntry } from '../../types/audit';
import { formatDateTime } from '../../lib/dates';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [entityFilter, setEntityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await getAuditLogsApi({
        entityType: entityFilter === 'all' ? undefined : entityFilter,
        page,
        limit: 25,
      });
      setLogs(res.logs || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityFilter, page]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#252525] flex items-center gap-2">
            <History className="w-5 h-5 text-[#2936ff]" />
            <span>Immutable Audit Trail</span>
          </h1>
          <p className="text-xs text-[#858580] mt-1">
            Complete historical activity record. All journal postings, reversals, allocations, and approvals are append-only.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={fetchLogs} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Audit Trail</span>
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card variant="default" className="p-0 overflow-hidden">
        <div className="p-4 border-b border-[#deded9] flex items-center justify-between bg-[#f6f6f3]">
          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {['all', 'JournalEntry', 'BankTransaction', 'ApInvoice', 'Vehicle', 'DealJacket'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setEntityFilter(type);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-none capitalize font-medium transition-colors ${
                  entityFilter === type
                    ? 'bg-sky-600/20 text-[#2936ff] border border-sky-500/40'
                    : 'text-[#858580] hover:text-[#252525] hover:bg-[#f6f6f3]'
                }`}
              >
                {type === 'all' ? 'All Events' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target Entity</TableHead>
              <TableHead>User / Principal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-xs text-[#858580]">
                  Loading audit logs...
                </TableCell>
              </TableRow>
            ) : logs.length > 0 ? (
              logs.map((log) => {
                const isExpanded = expandedId === log._id;
                const userName =
                  typeof log.userId === 'object' ? (log.userId as any)?.name : 'System / Controller';

                return (
                  <React.Fragment key={log._id}>
                    <TableRow
                      onClick={() => toggleExpand(log._id)}
                      className="cursor-pointer hover:bg-[#f6f6f3]"
                    >
                      <TableCell className="w-8 pl-4">
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-[#2936ff]" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-[#858580]" />
                        )}
                      </TableCell>

                      <TableCell className="font-mono text-xs text-[#858580] whitespace-nowrap">
                        {formatDateTime(log.at)}
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-[#2936ff]">
                          {log.action}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="font-mono text-xs text-[#252525]">
                          {log.entityType}
                          {log.entityId && (
                            <span className="text-[10px] text-[#858580] ml-1.5">
                              ({log.entityId})
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-[#252525]">
                          <User className="w-3.5 h-3.5 text-[#858580]" />
                          <span>{userName}</span>
                        </div>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="bg-[#f6f6f3]">
                        <TableCell colSpan={5} className="p-4 space-y-3">
                          <div className="text-xs font-semibold text-[#858580] uppercase tracking-wider">
                            Payload Audit Inspection
                          </div>
                          <div className="grid grid-cols-2 gap-4 font-mono text-[11px]">
                            {log.before && (
                              <div className="space-y-1">
                                <span className="text-amber-700">Before State:</span>
                                <pre className="p-3 rounded-none bg-[#f6f6f3] border border-[#deded9] overflow-x-auto text-[#252525]">
                                  {JSON.stringify(log.before, null, 2)}
                                </pre>
                              </div>
                            )}

                            {log.after && (
                              <div className="space-y-1">
                                <span className="text-[#217454]">After State:</span>
                                <pre className="p-3 rounded-none bg-[#f6f6f3] border border-[#deded9] overflow-x-auto text-[#252525]">
                                  {JSON.stringify(log.after, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-xs text-[#858580]">
                  No audit trail events logged yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-[#deded9] flex items-center justify-between text-xs text-[#858580] bg-[#f6f6f3]">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="xs"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="xs"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
