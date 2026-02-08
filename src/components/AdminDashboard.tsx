import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../lib/api';
import { sanitizeError } from '../utils/security';
import Toast from './Toast';

interface PlatformStats {
  users: {
    total: number;
    employers: number;
    job_seekers: number;
    active_today: number;
  };
  jobs: {
    total: number;
    active: number;
    pending_approval: number;
  };
  applications: {
    total: number;
    pending_review: number;
  };
}

function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const [, userStatsRes, jobStatsRes, appStatsRes] = await Promise.all([
        adminAPI.getStatistics(),
        adminAPI.getUserStatistics(),
        adminAPI.getJobStatistics(),
        adminAPI.getApplicationStatistics(),
      ]);

      setStats({
        users: {
          total: userStatsRes.data.total || 0,
          employers: userStatsRes.data.employers || 0,
          job_seekers: userStatsRes.data.job_seekers || 0,
          active_today: userStatsRes.data.active_today || 0,
        },
        jobs: {
          total: jobStatsRes.data.total || 0,
          active: jobStatsRes.data.active || 0,
          pending_approval: jobStatsRes.data.pending_approval || 0,
        },
        applications: {
          total: appStatsRes.data.total || 0,
          pending_review: appStatsRes.data.pending_review || 0,
        },
      });
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

  if (error || !stats) {
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
        <h1 className="text-3xl font-light text-neutral-900 mb-2">Admin Dashboard</h1>
        <p className="text-neutral-500">Platform-wide overview</p>
      </div>

      {/* Platform Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Total Users</p>
          <p className="text-2xl font-light text-neutral-900">{stats.users.total.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Employers</p>
          <p className="text-2xl font-light text-neutral-900">{stats.users.employers.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Job Seekers</p>
          <p className="text-2xl font-light text-neutral-900">{stats.users.job_seekers.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Active Today</p>
          <p className="text-2xl font-light text-neutral-900">{stats.users.active_today.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Total Jobs</p>
          <p className="text-2xl font-light text-neutral-900">{stats.jobs.total.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Active Jobs</p>
          <p className="text-2xl font-light text-neutral-900">{stats.jobs.active.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <Link to="/admin-panel/jobs?approval_status=pending" className="block">
            <p className="text-sm font-medium text-neutral-500 mb-1">Pending Approval</p>
            <p className="text-2xl font-light text-neutral-900">{stats.jobs.pending_approval.toLocaleString()}</p>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Total Applications</p>
          <p className="text-2xl font-light text-neutral-900">{stats.applications.total.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Pending Review</p>
          <p className="text-2xl font-light text-neutral-900">{stats.applications.pending_review.toLocaleString()}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/admin-panel/jobs?approval_status=pending"
            className="px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-center"
          >
            <p className="text-sm font-medium text-neutral-900">Approve Pending Jobs</p>
          </Link>
          <Link
            to="/admin-panel/users"
            className="px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-center"
          >
            <p className="text-sm font-medium text-neutral-900">Review Flagged Users</p>
          </Link>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">New Users Over Time</h2>
          <div className="h-64 flex items-center justify-center text-neutral-400">
            <p className="text-sm">Chart placeholder - integrate charting library</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Jobs Posted Over Time</h2>
          <div className="h-64 flex items-center justify-center text-neutral-400">
            <p className="text-sm">Chart placeholder - integrate charting library</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Applications by Status</h2>
        <div className="h-64 flex items-center justify-center text-neutral-400">
          <p className="text-sm">Chart placeholder - integrate charting library</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
