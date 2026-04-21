import { useState, useEffect } from 'react';
import { FileSearch, RefreshCw, X } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import type { AuditLog, User, Mission, CalendarEvent } from '@/types';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchLogs();
    fetchUsers();
    fetchMissions();
    fetchEvents();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<AuditLog[]>('/admin/audit-logs');
      if (response.success && response.data) {
        setLogs(response.data);
      } else {
        setLogs([]);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get<User[]>('/admin/users');
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch {
      // non-blocking
    }
  };

  const fetchMissions = async () => {
    try {
      const response = await api.get<Mission[]>('/admin/missions');
      if (response.success && response.data) {
        setMissions(response.data);
      }
    } catch {
      // non-blocking
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await api.get<CalendarEvent[]>('/admin/calendar-events');
      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch {
      // non-blocking
    }
  };

  const getUserName = (userId: string): string => {
    const user = users.find((u) => u.userId === userId);
    if (user) return `${user.firstName} ${user.lastName}`.trim() || user.email || userId;
    return userId;
  };

  const getActionTypeLabel = (action: string): string => {
    if (!action) return '—';
    if (action === 'USER_LOGIN') return 'Log In';
    if (action === 'USER_LOGOUT') return 'Log Out';
    if (action.startsWith('POST ')) return 'Create';
    if (action.startsWith('PUT ') || action.startsWith('PATCH ')) return 'Update';
    if (action.startsWith('DELETE ')) return 'Delete';
    return action;
  };

  const getNameFromChanges = (changes: Record<string, unknown> | undefined): string => {
    if (!changes || typeof changes !== 'object') return '';
    if (changes.title && String(changes.title).trim()) return String(changes.title).trim();
    if (changes.name && String(changes.name).trim()) return String(changes.name).trim();
    if (changes.subject && String(changes.subject).trim()) return String(changes.subject).trim();
    const firstLast = [changes.firstName, changes.lastName].filter(Boolean).map(String).join(' ').trim();
    if (firstLast) return firstLast;
    if (changes.originalFileName && String(changes.originalFileName).trim()) return String(changes.originalFileName).trim();
    if (changes.fileName && String(changes.fileName).trim()) return String(changes.fileName).trim();
    if (changes.teamName && String(changes.teamName).trim()) return String(changes.teamName).trim();
    if (changes.email && String(changes.email).trim()) return String(changes.email).trim();
    if (changes.headline && String(changes.headline).trim()) return String(changes.headline).trim();
    return '';
  };

  const getEntityDisplayName = (log: AuditLog): string => {
    const { action, entity, entityId, changes } = log;
    const fromChanges = getNameFromChanges(changes);

    if (action === 'USER_LOGIN' || action === 'USER_LOGOUT') return 'System';

    if (entity === 'users') {
      const name = getUserName(entityId);
      return name || fromChanges || entityId || '—';
    }

    if (entity === 'missions') {
      const mission = missions.find((m) => m.missionId === entityId);
      return mission?.title ?? (fromChanges || entityId || '—');
    }

    if (entity === 'calendar-events') {
      const event = events.find((e) => e.eventId === entityId);
      return event?.title ?? (fromChanges || entityId || '—');
    }

    const sectionLabels: Record<string, string> = {
      'homepage-hero': 'Homepage hero',
      'mission-commander': 'Mission Director',
      'homepage-about': 'About Us',
      'homepage-mission': 'Mission',
      'homepage-vision': 'Vision',
      'featured-videos': 'Featured Videos',
      'join-mission-agreement-financial': 'Agreements: Financial',
      'join-mission-agreement-photograph': 'Agreements: Photograph',
      'join-mission-agreement-liability': 'Agreements: Liability',
    };
    if (sectionLabels[entity] || sectionLabels[entityId] || entity === 'site-content') {
      return sectionLabels[entity] ?? sectionLabels[entityId] ?? (fromChanges || 'Homepage / Site content');
    }

    if (entity === 'applications') return fromChanges || 'Application';
    if (entity === 'contact-messages') return fromChanges || 'Contact message';
    if (entity === 'board-members') return fromChanges || 'Board member';
    if (entity === 'files') return fromChanges || 'File';
    if (entity === 'gallery') return fromChanges || 'Gallery image';
    if (entity === 'artifacts') return fromChanges || 'Artifact';
    if (entity === 'audit-logs') return 'Audit log';

    return fromChanges || entityId || '—';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileSearch className="h-8 w-8" />
            Audit Logs
          </h1>
          <p className="text-gray-600 mt-1">View system activity and admin actions</p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="btn-outline flex items-center gap-2"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="card flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          <p className="ml-4 text-gray-600">Loading audit logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="card text-center py-16">
          <FileSearch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No audit logs yet</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Audit entries will appear here when admins log in or perform actions (e.g. user changes, mission updates).
          </p>
          <button onClick={fetchLogs} className="btn-outline mt-4">
            Refresh
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Entity</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">IP</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.logId} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800">
                        {getActionTypeLabel(log.action)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{log.entity}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 truncate max-w-[180px]" title={getEntityDisplayName(log)}>
                      {getEntityDisplayName(log)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700" title={log.userId}>
                      {getUserName(log.userId)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{log.ipAddress}</td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="btn-outline text-sm py-1.5 px-3"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
            Showing {logs.length} log{logs.length !== 1 ? 's' : ''} (most recent first)
          </div>
        </div>
      )}

      {/* Details popup */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Audit Log Details</h2>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-500 block">Log ID</span>
                <span className="font-mono text-gray-900">{selectedLog.logId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500 block">Time</span>
                <span className="text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500 block">Type</span>
                <span className="text-gray-900">{getActionTypeLabel(selectedLog.action)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500 block">Action (raw)</span>
                <span className="font-mono text-gray-700 text-xs break-all">{selectedLog.action}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500 block">Entity</span>
                <span className="text-gray-900">{selectedLog.entity}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500 block">Name</span>
                <span className="text-gray-900">{getEntityDisplayName(selectedLog)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500 block">Entity ID (raw)</span>
                <span className="font-mono text-gray-700 text-xs break-all">{selectedLog.entityId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500 block">User</span>
                <span className="text-gray-900">{getUserName(selectedLog.userId)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500 block">User ID</span>
                <span className="font-mono text-gray-900 break-all">{selectedLog.userId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500 block">IP Address</span>
                <span className="text-gray-900">{selectedLog.ipAddress}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500 block">User Agent</span>
                <span className="text-gray-900 break-all text-xs">{selectedLog.userAgent || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500 block">Changes</span>
                <pre className="mt-1 p-3 bg-gray-50 rounded text-xs overflow-x-auto max-h-40 overflow-y-auto">
                  {Object.keys(selectedLog.changes || {}).length > 0
                    ? JSON.stringify(selectedLog.changes, null, 2)
                    : '—'}
                </pre>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="btn-primary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
