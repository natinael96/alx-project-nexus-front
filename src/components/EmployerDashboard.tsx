import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { employerAPI } from '../lib/api';
import { sanitizeError } from '../utils/security';
import Toast from './Toast';
import type { Job, Application } from '../types';

interface DashboardData {
  statistics: {
    jobs: {
      total: number;
      active: number;
      draft: number;
      closed: number;
      pending_approval: number;
    };
    applications: {
      total: number;
      pending: number;
      accepted: number;
      rejected: number;
    };
    views: {
      total: number;
      unique: number;
    };
  };
  recent_jobs: Job[];
  recent_applications: Application[];
  top_jobs: Job[];
}

function EmployerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await employerAPI.getDashboard();
      setData(response.data);
    } catch (err: any) {
      setError(sanitizeError(err));
      setToast({ message: sanitizeError(err), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-900"></div>
        <p className="mt-4 text-sm text-neutral-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">Error: {error || 'Failed to load dashboard'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-3xl font-light text-neutral-900 mb-2">Employer Dashboard</h1>
        <p className="text-neutral-500">Overview of your hiring pipeline</p>
      </div>

      {/* Stats Cards - Row 1: Jobs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Link
          to="/employer/jobs?status=active"
          className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">Active Jobs</p>
              <p className="text-2xl font-light text-neutral-900">{data.statistics.jobs.active}</p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          to="/employer/jobs?status=draft"
          className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">Draft Jobs</p>
              <p className="text-2xl font-light text-neutral-900">{data.statistics.jobs.draft}</p>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          to="/employer/jobs?status=closed"
          className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">Closed Jobs</p>
              <p className="text-2xl font-light text-neutral-900">{data.statistics.jobs.closed}</p>
            </div>
            <div className="p-3 bg-neutral-50 text-neutral-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          to="/employer/jobs?status=pending_approval"
          className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">Pending Approval</p>
              <p className="text-2xl font-light text-neutral-900">{data.statistics.jobs.pending_approval}</p>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Cards - Row 2: Applications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">Total Applications</p>
              <p className="text-2xl font-light text-neutral-900">{data.statistics.applications.total}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <Link
          to="/employer/applications?status=pending"
          className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">Pending</p>
              <p className="text-2xl font-light text-neutral-900">{data.statistics.applications.pending}</p>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">Accepted</p>
              <p className="text-2xl font-light text-neutral-900">{data.statistics.applications.accepted}</p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">Rejected</p>
              <p className="text-2xl font-light text-neutral-900">{data.statistics.applications.rejected}</p>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Views Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Total Views</p>
          <p className="text-2xl font-light text-neutral-900">{data.statistics.views.total.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Unique Views</p>
          <p className="text-2xl font-light text-neutral-900">{data.statistics.views.unique.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Jobs */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-neutral-900">Recent Jobs</h2>
            <Link to="/employer/jobs" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
              View all →
            </Link>
          </div>
          {data.recent_jobs.length === 0 ? (
            <p className="text-sm text-neutral-500">No jobs yet</p>
          ) : (
            <div className="space-y-3">
              {data.recent_jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div className="flex-1">
                    <Link to={`/employer/jobs/${job.id}/applications`} className="text-sm font-medium text-neutral-900 hover:text-neutral-700">
                      {job.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        job.status === 'active' ? 'bg-green-50 text-green-700' :
                        job.status === 'draft' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-neutral-50 text-neutral-700'
                      }`}>
                        {job.status}
                      </span>
                      <span className="text-xs text-neutral-500">{(job as any).application_count || 0} applications</span>
                      <span className="text-xs text-neutral-500">{job.view_count || 0} views</span>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-400 ml-4">
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-neutral-900">Recent Applications</h2>
            <Link to="/employer/applications" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
              View all →
            </Link>
          </div>
          {data.recent_applications.length === 0 ? (
            <p className="text-sm text-neutral-500">No applications yet</p>
          ) : (
            <div className="space-y-3">
              {data.recent_applications.slice(0, 5).map((app) => (
                <div key={app.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">
                      {app.applicant?.username || 'Unknown'}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {app.job?.title || 'Unknown Job'} • {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-md ${
                      app.status === 'accepted'
                        ? 'bg-green-50 text-green-700'
                        : app.status === 'rejected'
                        ? 'bg-red-50 text-red-700'
                        : app.status === 'reviewed'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-yellow-50 text-yellow-700'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Performing Jobs */}
      {data.top_jobs.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Top Performing Jobs</h2>
          <div className="space-y-3">
            {data.top_jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <div className="flex-1">
                  <Link to={`/employer/jobs/${job.id}/applications`} className="text-sm font-medium text-neutral-900 hover:text-neutral-700">
                    {job.title}
                  </Link>
                  <p className="text-xs text-neutral-500 mt-1">{job.view_count || 0} views</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span>{(job as any).application_count || 0} applications</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployerDashboard;
