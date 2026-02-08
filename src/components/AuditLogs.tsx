import { useEffect, useState } from 'react';
import { adminAPI } from '../lib/api';
import { sanitizeError } from '../utils/security';
import Toast from './Toast';

interface AuditLog {
  id: string;
  user: string | null; // UUID string, not object
  user_name: string | null;
  action: string;
  action_display: string;
  content_type: string | null;
  content_type_name: string | null;
  object_id: string | null;
  object_repr: string | null;
  changes: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  request_path: string | null;
  request_method: string | null;
  metadata: {
    status_code?: number;
    content_type?: string;
  } | null;
  created_at: string;
}

function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filters, setFilters] = useState({
    user: '',
    action: '',
    content_type: '',
    date_from: '',
    date_to: '',
  });
  const [selectedObject, setSelectedObject] = useState<{ type: string; id: string } | null>(null);
  const [changeHistory, setChangeHistory] = useState<any[]>([]);

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.user) params.user_id = filters.user; // API expects user_id, not user
      if (filters.action) params.action = filters.action;
      if (filters.content_type) params.content_type = filters.content_type;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;
      const response = await adminAPI.getAuditLogs(params);
      setLogs(response.data.results);
    } catch (err: any) {
      setError(sanitizeError(err));
      setToast({ message: sanitizeError(err), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadChangeHistory = async (contentType: string, objectId: string) => {
    try {
      const response = await adminAPI.getObjectHistory(contentType, objectId);
      setChangeHistory(response.data);
      setSelectedObject({ type: contentType, id: objectId });
    } catch (err: any) {
      setToast({ message: sanitizeError(err), type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-3xl font-light text-neutral-900 mb-2">Audit Logs</h1>
        <p className="text-neutral-500">View all system activity</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">User</label>
            <input
              type="text"
              value={filters.user}
              onChange={(e) => setFilters({ ...filters, user: e.target.value })}
              placeholder="User ID or username"
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Action</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="view">View</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="password_change">Password Change</option>
              <option value="permission_change">Permission Change</option>
              <option value="status_change">Status Change</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Content Type</label>
            <select
              value={filters.content_type}
              onChange={(e) => setFilters({ ...filters, content_type: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="">All Types</option>
              <option value="job">Job</option>
              <option value="application">Application</option>
              <option value="user">User</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Date From</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Date To</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Object</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Request</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 text-sm text-neutral-600 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {log.user_name || (log.user ? `User ${log.user.substring(0, 8)}...` : 'System')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700">
                        {log.action_display || log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {log.object_repr || log.content_type_name || log.content_type || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      <span className="font-mono text-xs">
                        {log.request_method} {log.request_path || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600 font-mono text-xs">
                      {log.ip_address || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {log.object_id && log.content_type ? (
                        <button
                          onClick={() => loadChangeHistory(log.content_type!, log.object_id!)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          View History
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Change History Modal */}
      {selectedObject && changeHistory.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-neutral-900">Change History</h2>
              <button
                onClick={() => {
                  setSelectedObject(null);
                  setChangeHistory([]);
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {changeHistory.map((change, index) => (
                <div key={index} className="border border-neutral-200 rounded-lg p-4">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-500">Field</p>
                      <p className="font-medium text-neutral-900">{change.field_name}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Old Value</p>
                      <p className="font-medium text-neutral-900">{String(change.old_value || '—')}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">New Value</p>
                      <p className="font-medium text-neutral-900">{String(change.new_value || '—')}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Changed By</p>
                      <p className="font-medium text-neutral-900">{change.changed_by?.username || 'System'}</p>
                      <p className="text-xs text-neutral-400">{new Date(change.changed_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;
