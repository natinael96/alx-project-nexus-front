import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useJobsStore from '../stores/jobsStore';
import useApplicationsStore from '../stores/applicationsStore';

function EmployerDashboard() {
  const { user } = useAuthStore();
  const { jobs, fetchJobs } = useJobsStore();
  const { applications, fetchApplications } = useApplicationsStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchJobs({ page_size: 100 });
        await fetchApplications({ page_size: 100 });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, fetchJobs, fetchApplications]);

  const activeJobs = jobs.filter(job => job.status === 'active' && job.approval_status === 'approved').length;
  const draftJobs = jobs.filter(job => job.status === 'draft').length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const totalViews = jobs.reduce((sum, job) => sum + (job.view_count || 0), 0);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-900"></div>
        <p className="mt-4 text-sm text-neutral-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-neutral-900 mb-2">Employer Dashboard</h1>
        <p className="text-neutral-500">Welcome back, {user?.username}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          to="/employer/jobs?status=active"
          className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">Active Jobs</p>
              <p className="text-2xl font-light text-neutral-900">{activeJobs}</p>
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
              <p className="text-2xl font-light text-neutral-900">{draftJobs}</p>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          to="/employer/applications?status=pending"
          className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">Pending Applications</p>
              <p className="text-2xl font-light text-neutral-900">{pendingApplications}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">Total Views</p>
              <p className="text-2xl font-light text-neutral-900">{totalViews}</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/employer/jobs/new"
            className="px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-center"
          >
            <p className="text-sm font-medium text-neutral-900">Post New Job</p>
          </Link>
          <Link
            to="/employer/applications"
            className="px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-center"
          >
            <p className="text-sm font-medium text-neutral-900">Review Applications</p>
          </Link>
          <Link
            to="/employer/jobs"
            className="px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-center"
          >
            <p className="text-sm font-medium text-neutral-900">Manage Jobs</p>
          </Link>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-neutral-900">Recent Applications</h2>
          <Link to="/employer/applications" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            View all →
          </Link>
        </div>
        {applications.slice(0, 5).length === 0 ? (
          <p className="text-sm text-neutral-500">No applications yet</p>
        ) : (
          <div className="space-y-3">
            {applications.slice(0, 5).map((app) => (
              <div key={app.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <div className="flex-1">
                  <Link to={`/jobs/${app.job.id}`} className="text-sm font-medium text-neutral-900 hover:text-neutral-700">
                    {app.job.title}
                  </Link>
                  <p className="text-xs text-neutral-500 mt-1">
                    {app.applicant.username} • Applied {new Date(app.applied_at).toLocaleDateString()}
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
  );
}

export default EmployerDashboard;
