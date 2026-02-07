import { useEffect, useState, ChangeEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import useJobsStore from '../stores/jobsStore';
import { jobsAPI } from '../lib/api';
import Toast from './Toast';

function AdminJobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobs, loading, error, fetchJobs, pagination } = useJobsStore();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const params = {
      approval_status: searchParams.get('approval_status') || '',
      status: searchParams.get('status') || '',
      page: parseInt(searchParams.get('page') || '1'),
      page_size: 20,
    };
    fetchJobs(params);
  }, [searchParams]);

  const handleApprovalChange = async (jobId: string, approvalStatus: 'approved' | 'rejected') => {
    setUpdating(jobId);
    try {
      await jobsAPI.updateJobApproval(jobId, approvalStatus);
      setToast({ message: `Job ${approvalStatus} successfully`, type: 'success' });
      // Refresh jobs
      const params = {
        approval_status: searchParams.get('approval_status') || '',
        status: searchParams.get('status') || '',
        page: parseInt(searchParams.get('page') || '1'),
        page_size: 20,
      };
      fetchJobs(params);
    } catch (error: any) {
      setToast({ message: error.response?.data?.detail || 'Failed to update job', type: 'error' });
    } finally {
      setUpdating(null);
    }
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-neutral-900 mb-2">Job Management</h1>
          <p className="text-neutral-500">Manage and approve job listings</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">Approval Status</label>
              <select
                value={searchParams.get('approval_status') || ''}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilterChange('approval_status', e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">Job Status</label>
              <select
                value={searchParams.get('status') || ''}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-900"></div>
            <p className="mt-4 text-sm text-neutral-500">Loading jobs...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 p-4 mb-6">
            <p className="text-sm text-red-700">{typeof error === 'string' ? error : JSON.stringify(error)}</p>
          </div>
        )}

        {/* Jobs Table */}
        {!loading && !error && (
          <>
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Employer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Approval</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {jobs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-500">
                          No jobs found
                        </td>
                      </tr>
                    ) : (
                      jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-6 py-4">
                            <Link to={`/jobs/${job.id}`} className="text-sm font-medium text-neutral-900 hover:text-neutral-700">
                              {job.title}
                            </Link>
                            <p className="text-xs text-neutral-500 mt-1">{job.location}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-600">
                            {job.employer?.username || 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                              job.status === 'active' ? 'bg-green-50 text-green-700' :
                              job.status === 'closed' ? 'bg-gray-50 text-gray-700' :
                              'bg-yellow-50 text-yellow-700'
                            }`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                              job.approval_status === 'approved' ? 'bg-green-50 text-green-700' :
                              job.approval_status === 'rejected' ? 'bg-red-50 text-red-700' :
                              'bg-yellow-50 text-yellow-700'
                            }`}>
                              {job.approval_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-500">
                            {new Date(job.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {job.approval_status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprovalChange(job.id, 'approved')}
                                    disabled={updating === job.id}
                                    className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                                  >
                                    {updating === job.id ? '...' : 'Approve'}
                                  </button>
                                  <button
                                    onClick={() => handleApprovalChange(job.id, 'rejected')}
                                    disabled={updating === job.id}
                                    className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                                  >
                                    {updating === job.id ? '...' : 'Reject'}
                                  </button>
                                </>
                              )}
                              {job.approval_status === 'rejected' && (
                                <button
                                  onClick={() => handleApprovalChange(job.id, 'approved')}
                                  disabled={updating === job.id}
                                  className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                  {updating === job.id ? '...' : 'Approve'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.count > 0 && (
              <div className="flex items-center justify-between border-t border-neutral-200 pt-6 mt-6">
                <div className="text-sm text-neutral-500">
                  Showing {((parseInt(searchParams.get('page') || '1')) - 1) * 20 + 1} to{' '}
                  {Math.min((parseInt(searchParams.get('page') || '1')) * 20, pagination.count)} of{' '}
                  {pagination.count} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange((parseInt(searchParams.get('page') || '1')) - 1)}
                    disabled={!pagination.previous}
                    className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange((parseInt(searchParams.get('page') || '1')) + 1)}
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
      </div>
    </>
  );
}

export default AdminJobs;
