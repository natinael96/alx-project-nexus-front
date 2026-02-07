import { useEffect, useState, ChangeEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import useApplicationsStore from '../stores/applicationsStore';
import Toast from './Toast';

function AdminApplications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { applications, loading, error, fetchApplications, pagination, updateApplicationStatus } = useApplicationsStore();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const params = {
      status: searchParams.get('status') || '',
      page: parseInt(searchParams.get('page') || '1'),
      page_size: 20,
    };
    fetchApplications(params);
  }, [searchParams]);

  const handleStatusChange = async (applicationId: string, status: 'reviewed' | 'accepted' | 'rejected') => {
    setUpdating(applicationId);
    try {
      await updateApplicationStatus(applicationId, status);
      setToast({ message: `Application ${status} successfully`, type: 'success' });
      // Refresh applications
      const params = {
        status: searchParams.get('status') || '',
        page: parseInt(searchParams.get('page') || '1'),
        page_size: 20,
      };
      fetchApplications(params);
    } catch (error: any) {
      setToast({ message: error.response?.data?.detail || 'Failed to update application', type: 'error' });
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
          <h1 className="text-3xl font-light text-neutral-900 mb-2">Application Management</h1>
          <p className="text-neutral-500">Review and manage job applications</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">Status</label>
              <select
                value={searchParams.get('status') || ''}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-900"></div>
            <p className="mt-4 text-sm text-neutral-500">Loading applications...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 p-4 mb-6">
            <p className="text-sm text-red-700">{typeof error === 'string' ? error : JSON.stringify(error)}</p>
          </div>
        )}

        {/* Applications Table */}
        {!loading && !error && (
          <>
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Job</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Applicant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Applied</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {applications.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-neutral-500">
                          No applications found
                        </td>
                      </tr>
                    ) : (
                      applications.map((application) => (
                        <tr key={application.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-6 py-4">
                            <Link to={`/jobs/${application.job.id}`} className="text-sm font-medium text-neutral-900 hover:text-neutral-700">
                              {application.job.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-neutral-900">{application.applicant.username}</p>
                            <p className="text-xs text-neutral-500">{application.applicant.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                              application.status === 'accepted' ? 'bg-green-50 text-green-700' :
                              application.status === 'rejected' ? 'bg-red-50 text-red-700' :
                              application.status === 'reviewed' ? 'bg-blue-50 text-blue-700' :
                              'bg-yellow-50 text-yellow-700'
                            }`}>
                              {application.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-500">
                            {new Date(application.applied_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {application.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(application.id, 'reviewed')}
                                    disabled={updating === application.id}
                                    className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                  >
                                    {updating === application.id ? '...' : 'Review'}
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(application.id, 'accepted')}
                                    disabled={updating === application.id}
                                    className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                                  >
                                    {updating === application.id ? '...' : 'Accept'}
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(application.id, 'rejected')}
                                    disabled={updating === application.id}
                                    className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                                  >
                                    {updating === application.id ? '...' : 'Reject'}
                                  </button>
                                </>
                              )}
                              {application.status === 'reviewed' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(application.id, 'accepted')}
                                    disabled={updating === application.id}
                                    className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                                  >
                                    {updating === application.id ? '...' : 'Accept'}
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(application.id, 'rejected')}
                                    disabled={updating === application.id}
                                    className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                                  >
                                    {updating === application.id ? '...' : 'Reject'}
                                  </button>
                                </>
                              )}
                              {application.resume && (
                                <a
                                  href={application.resume}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 rounded hover:bg-neutral-200 transition-colors"
                                >
                                  Resume
                                </a>
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

export default AdminApplications;
