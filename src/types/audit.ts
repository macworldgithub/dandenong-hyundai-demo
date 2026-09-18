import { User } from './user';

export interface AuditLogEntry {
  _id: string;
  userId?: string | User;
  action: string;
  entityType: string;
  entityId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  at: string;
}
