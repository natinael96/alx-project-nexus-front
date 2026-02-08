import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { jobsAPI } from '../lib/api';
import { sanitizeError } from '../utils/security';
import Toast from './Toast';
import type { Job } from '../types';

function EmployerJobs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'closed'>('all');
  const [pagination, setPagination] = useState({ count: 0, next: null as string | null, previous: null as string | null });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam === 'active' || statusParam === 'draft' || statusParam === 'closed') {
      setFilter(statusParam);
    } else {
      setFilter('all');
    }
  }, [searchParams]);

  useEffect(() => {
    loadJobs();
  }, [filter, currentPage]);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        ordering: '-created_at',
        page: currentPage,
        page_size: 20,
      };
      if (filter !== 'all') {
        params.status = filter;
      }
      const response = await jobsAPI.getJobs(params);
      setJobs(response.data.results);
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (err: any) {
      setError(sanitizeError(err));
      setToast({ message: sanitizeError(err), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await jobsAPI.deleteJob(jobId);
      setToast({ message: 'Job deleted successfully', type: 'success' });
      loadJobs();
    } catch (err: any) {
      setToast({ message: sanitizeError(err), type: 'error' });
    }
  };

  const handleClose = async (jobId: string) => {
    try {
      await jobsAPI.updateJob(jobId, { status: 'closed' });
      setToast({ message: 'Job closed successfully', type: 'success' });
      loadJobs();
    } catch (err: any) {
      setToast({ message: sanitizeError(err), type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-neutral-900 mb-2">My Jobs</h1>
          <p className="text-neutral-500">Manage all your posted jobs</p>
        </div>
        <Link
          to="/employer/jobs/new"
          className="px-5 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          + Create New Job
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 border-b border-neutral-200">
        {(['all', 'active', 'draft', 'closed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setFilter(tab);
              setCurrentPage(1);
              navigate(`/employer/jobs${tab !== 'all' ? `?status=${tab}` : ''}`);
            }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
              filter === tab
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Jobs Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <p className="text-sm text-neutral-500 mb-4">No jobs found</p>
          <Link
            to="/employer/jobs/new"
            className="inline-block px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Create Your First Job
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Applications</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        <Link to={`/employer/jobs/${job.id}/applications`} className="text-sm font-medium text-neutral-900 hover:text-neutral-700">
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{job.category?.name || '—'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            job.status === 'active'
                              ? 'bg-green-50 text-green-700'
                              : job.status === 'draft'
                              ? 'bg-yellow-50 text-yellow-700'
                              : 'bg-neutral-50 text-neutral-700'
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{job.application_count || 0}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{job.views_count || 0}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{new Date(job.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/employer/jobs/${job.id}/edit`}
                            className="text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/jobs/${job.id}`}
                            className="text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
                          >
                            View
                          </Link>
                          {job.status !== 'closed' && (
                            <button
                              onClick={() => handleClose(job.id)}
                              className="text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
                            >
                              Close
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(job.id)}
                            className="text-xs text-red-600 hover:text-red-800 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.count > 20 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-neutral-500">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, pagination.count)} of {pagination.count} jobs
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={!pagination.previous}
                  className="px-3 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!pagination.next}
                  className="px-3 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default EmployerJobs;
