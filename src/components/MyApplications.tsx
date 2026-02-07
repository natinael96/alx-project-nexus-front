import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useApplicationsStore from '../stores/applicationsStore';
import type { ApplicationFilters } from '../types';
import Toast from './Toast';
import WithdrawModal from './WithdrawModal';

function MyApplications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { applications, loading, error, pagination, fetchApplications, withdrawApplication } =
    useApplicationsStore();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [withdrawModal, setWithdrawModal] = useState<{ app: any; isOpen: boolean }>({
    app: null,
    isOpen: false,
  });

  const statusFilter = searchParams.get('status') || '';

  useEffect(() => {
    const params: ApplicationFilters = { ordering: '-applied_at' };
    if (statusFilter) params.status = statusFilter;
    const page = parseInt(searchParams.get('page') || '1');
    if (page > 1) params.page = page;
    fetchApplications(params);
  }, [statusFilter, searchParams, fetchApplications]);

  const handleWithdraw = async (application: any, reason: string) => {
    const result = await withdrawApplication(application.id, reason);
    if (result.success) {
      setToast({ message: 'Application withdrawn successfully', type: 'success' });
      setWithdrawModal({ app: null, isOpen: false });
      // Refresh applications
      const params: ApplicationFilters = { ordering: '-applied_at' };
      if (statusFilter) params.status = statusFilter;
      fetchApplications(params);
    } else {
      setToast({
        message: typeof result.error === 'string' ? result.error : 'Failed to withdraw application',
        type: 'error',
      });
    }
  };

  const handleFilterChange = (status: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (status) {
      newParams.set('status', status);
    } else {
      newParams.delete('status');
    }
    newParams.delete('page'); // Reset to page 1
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
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

  const canWithdraw = (status: string) => status === 'pending' || status === 'reviewed';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-3xl font-light text-neutral-900 mb-2">My Applications</h1>
        <p className="text-neutral-500">Track and manage your job applications</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 flex-wrap border-b border-neutral-200">
        {[
          { value: '', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'reviewed', label: 'Reviewed' },
          { value: 'accepted', label: 'Accepted' },
          { value: 'rejected', label: 'Rejected' },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleFilterChange(filter.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === filter.value
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            {filter.label}
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
          <p className="text-neutral-500 mb-4">No applications found</p>
          <Link to="/" className="text-sm font-medium text-neutral-900 hover:underline">
            Browse jobs →
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Job Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Applied Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          to={`/jobs/${app.job.id}`}
                          className="text-sm font-medium text-neutral-900 hover:text-neutral-700"
                        >
                          {app.job.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        N/A
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">
                        {formatDate(app.applied_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-md border ${
                            statusColors[app.status] || 'bg-neutral-50 text-neutral-700 border-neutral-200'
                          }`}
                        >
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/jobs/${app.job.id}`}
                            className="text-xs font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
                          >
                            View
                          </Link>
                          {canWithdraw(app.status) && (
                            <button
                              onClick={() => setWithdrawModal({ app, isOpen: true })}
                              className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors"
                            >
                              Withdraw
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.count > 0 && (
            <div className="flex items-center justify-between border-t border-neutral-200 pt-6 mt-6">
              <div className="text-sm text-neutral-500">
                Showing {((parseInt(searchParams.get('page') || '1')) - 1) * 20 + 1} to{' '}
                {Math.min(parseInt(searchParams.get('page') || '1') * 20, pagination.count)} of{' '}
                {pagination.count} applications
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, parseInt(searchParams.get('page') || '1') - 1))}
                  disabled={!pagination.previous}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(parseInt(searchParams.get('page') || '1') + 1)}
                  disabled={!pagination.next}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Withdraw Modal */}
      {withdrawModal.app && (
        <WithdrawModal
          isOpen={withdrawModal.isOpen}
          onClose={() => setWithdrawModal({ app: null, isOpen: false })}
          onConfirm={(reason) => handleWithdraw(withdrawModal.app, reason)}
          jobTitle={withdrawModal.app.job.title}
          loading={loading}
        />
      )}
    </div>
  );
}

export default MyApplications;
