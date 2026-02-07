import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useJobsStore from '../stores/jobsStore';
import useAuthStore from '../stores/authStore';

function AdminDashboard() {
  const { jobs, pagination, fetchJobs } = useJobsStore();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    pendingJobs: 0,
    rejectedJobs: 0,
  });

  useEffect(() => {
    fetchJobs({ page_size: 100 });
  }, []);

  useEffect(() => {
    const activeJobs = jobs.filter(job => job.approval_status === 'approved').length;
    const pendingJobs = jobs.filter(job => job.approval_status === 'pending').length;
    const rejectedJobs = jobs.filter(job => job.approval_status === 'rejected').length;
    setStats({
      totalJobs: pagination.count || jobs.length,
      activeJobs,
      pendingJobs,
      rejectedJobs,
    });
  }, [jobs, pagination.count]);

  const statCards = [
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      link: '/admin/jobs',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      link: '/admin/jobs?approval_status=approved',
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Pending Approval',
      value: stats.pendingJobs,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      link: '/admin/jobs?approval_status=pending',
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      title: 'Rejected Jobs',
      value: stats.rejectedJobs,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      link: '/admin/jobs?approval_status=rejected',
      color: 'bg-red-50 text-red-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-neutral-900 mb-2">Admin Dashboard</h1>
        <p className="text-neutral-500">Welcome back, {user?.username}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 mb-1">{stat.title}</p>
                <p className="text-2xl font-light text-neutral-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/jobs?approval_status=pending"
            className="px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-center"
          >
            <p className="text-sm font-medium text-neutral-900">Review Pending Jobs</p>
          </Link>
          <Link
            to="/admin/jobs"
            className="px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-center"
          >
            <p className="text-sm font-medium text-neutral-900">Manage All Jobs</p>
          </Link>
          <Link
            to="/admin/applications"
            className="px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-center"
          >
            <p className="text-sm font-medium text-neutral-900">View Applications</p>
          </Link>
        </div>
      </div>

      {/* Recent Jobs Posted */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-neutral-900">Recent Jobs Posted</h2>
          <Link to="/admin/jobs" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {jobs.slice(0, 10).map((job) => (
            <div key={job.id} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
              <div className="flex-1 min-w-0">
                <Link to={`/jobs/${job.id}`} className="text-sm font-medium text-neutral-900 hover:text-neutral-700 truncate block">
                  {job.title}
                </Link>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-neutral-500">{job.employer?.username}</span>
                  <span className="text-xs text-neutral-400">•</span>
                  <span className="text-xs text-neutral-500">{job.location}</span>
                  <span className="text-xs text-neutral-400">•</span>
                  <span className="text-xs text-neutral-500 capitalize">{job.job_type?.replace('-', ' ')}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4 shrink-0">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                  job.approval_status === 'approved' ? 'bg-green-50 text-green-700' :
                  job.approval_status === 'rejected' ? 'bg-red-50 text-red-700' :
                  'bg-yellow-50 text-yellow-700'
                }`}>
                  {job.approval_status}
                </span>
                <span className="text-xs text-neutral-400">
                  {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {jobs.length === 0 && (
            <p className="text-sm text-neutral-500">No jobs posted yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
