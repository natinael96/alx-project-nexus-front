import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useApplicationsStore from '../stores/applicationsStore';
import type { ApplicationFilters } from '../types';
import Toast from './Toast';

function MyApplications() {
  const { applications, loading, error, pagination, fetchApplications, withdrawApplication } =
    useApplicationsStore();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const params: ApplicationFilters = { ordering: '-applied_at' };
    if (statusFilter) params.status = statusFilter;
    fetchApplications(params);
  }, [statusFilter, fetchApplications]);

  const handleWithdraw = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    const result = await withdrawApplication(applicationId);
    if (result.success) {
      setToast({ message: 'Application withdrawn successfully', type: 'success' });
      fetchApplications({ ordering: '-applied_at', status: statusFilter || undefined });
    } else {
      setToast({ message: typeof result.error === 'string' ? result.error : 'Failed to withdraw', type: 'error' });
    }
  };

  const handlePageChange = (page: number) => {
    const params: ApplicationFilters = { page, ordering: '-applied_at' };
    if (statusFilter) params.status = statusFilter;
    fetchApplications(params);
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
    accepted: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-3xl font-light text-neutral-900 mb-2">My Applications</h1>
        <p className="text-neutral-500">Track and manage your job applications</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {['', 'pending', 'reviewed', 'accepted', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 text-sm rounded-lg border transition-all ${
              statusFilter === status
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
            }`}
          >
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 border border-red-100 p-4">
          <p className="text-sm text-red-700">{typeof error === 'string' ? error : 'An error occurred'}</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-12 h-12 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-neutral-500 mb-4">No applications yet</p>
          <Link to="/" className="text-sm font-medium text-neutral-900 hover:underline">
            Browse jobs →
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/jobs/${app.job.id}`}
                      className="text-lg font-medium text-neutral-900 hover:underline"
                    >
                      {app.job.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-neutral-500">
                      <span>Applied {formatDate(app.applied_at)}</span>
                      {app.reviewed_at && <span>• Reviewed {formatDate(app.reviewed_at)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${
                        statusColors[app.status] || 'bg-neutral-50 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                    {app.status === 'pending' && (
                      <button
                        onClick={() => handleWithdraw(app.id)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
                {app.cover_letter && (
                  <p className="mt-3 text-sm text-neutral-600 line-clamp-2">
                    {app.cover_letter}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.count > 20 && (
            <div className="mt-8 flex justify-center gap-2">
              {pagination.previous && (
                <button
                  onClick={() => handlePageChange(Math.max(1, (pagination as any).currentPage - 1))}
                  className="px-4 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50"
                >
                  Previous
                </button>
              )}
              <span className="px-4 py-2 text-sm text-neutral-500">
                {applications.length} of {pagination.count} applications
              </span>
              {pagination.next && (
                <button
                  onClick={() => handlePageChange(((pagination as any).currentPage || 1) + 1)}
                  className="px-4 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MyApplications;
