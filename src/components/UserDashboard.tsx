import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useNotificationsStore from '../stores/notificationsStore';
import { profileAPI, jobsAPI } from '../lib/api';
import type { Application, SavedJob, Job } from '../types';
import JobCard from './JobCard';
import { sanitizeError } from '../utils/security';

interface DashboardData {
  statistics: {
    total_applications: number;
    pending_applications: number;
    accepted_applications: number;
    rejected_applications: number;
    saved_jobs_count: number;
    applications_last_30_days: number;
  };
  recent_applications: Application[];
  recent_saved_jobs: SavedJob[];
  profile_completion: number;
}

function UserDashboard() {
  const { user } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationsStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [regularJobs, setRegularJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch dashboard data (all stats in one call)
        const dashboardResponse = await profileAPI.getDashboard();
        setDashboardData(dashboardResponse.data);
        
        // Fetch recommended jobs (if available)
        try {
          const recommendationsResponse = await jobsAPI.getRecommendations(4);
          const recommendations = recommendationsResponse.data.results;
          setRecommendedJobs(recommendations || []);
        } catch (err) {
          console.error('Failed to load recommendations:', err);
          setRecommendedJobs([]);
        }
        
        // Always fetch regular jobs to show below recommendations
        try {
          const jobsResponse = await jobsAPI.getJobs({ status: 'active', ordering: '-created_at', page_size: 8 });
          setRegularJobs(jobsResponse.data.results || []);
        } catch (err) {
          console.error('Failed to load jobs:', err);
          setRegularJobs([]);
        }
        
        // Fetch notifications count
        await fetchNotifications({ is_read: false, page_size: 1 });
      } catch (err: any) {
        setError(sanitizeError(err));
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, fetchNotifications]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-900"></div>
        <p className="mt-4 text-sm text-neutral-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">Error: {error || 'Failed to load dashboard'}</p>
      </div>
    );
  }

  const { statistics, recent_applications, recent_saved_jobs, profile_completion } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-neutral-900 mb-2">
          Welcome back, {user?.first_name || user?.username}!
        </h1>
        <p className="text-neutral-500">Here's what's happening with your job search</p>
      </div>

      {/* Profile Completion Bar */}
      {profile_completion < 100 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-medium text-neutral-900 mb-1">Profile Completion</h3>
              <p className="text-xs text-neutral-500">Complete your profile to stand out!</p>
            </div>
            <span className="text-2xl font-light text-neutral-900">{profile_completion}%</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-2 mb-3">
            <div
              className="bg-neutral-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${profile_completion}%` }}
            />
          </div>
          <Link
            to="/profile"
            className="text-sm font-medium text-neutral-900 hover:text-neutral-700 transition-colors"
          >
            Complete Profile →
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          to="/applications"
          className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">Total Applications</p>
              <p className="text-2xl font-light text-neutral-900">{statistics.total_applications}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          to="/applications?status=pending"
          className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">Pending Applications</p>
              <p className="text-2xl font-light text-neutral-900">{statistics.pending_applications}</p>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          to="/applications?status=accepted"
          className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">Accepted Applications</p>
              <p className="text-2xl font-light text-neutral-900">{statistics.accepted_applications}</p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          to="/saved-jobs"
          className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">Saved Jobs</p>
              <p className="text-2xl font-light text-neutral-900">{statistics.saved_jobs_count}</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Applications */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-neutral-900">Recent Applications</h2>
            <Link to="/applications" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
              View all →
            </Link>
          </div>
          {recent_applications.length === 0 ? (
            <p className="text-sm text-neutral-500">You haven't submitted any applications yet.</p>
          ) : (
            <div className="space-y-3">
              {recent_applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <Link to={`/jobs/${app.job.id}`} className="text-sm font-medium text-neutral-900 hover:text-neutral-700 truncate block">
                      {app.job.title}
                    </Link>
                    <p className="text-xs text-neutral-500 mt-1">
                      Applied {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-md ml-3 shrink-0 ${
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

        {/* Recent Saved Jobs */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-neutral-900">Recent Saved Jobs</h2>
            <Link to="/saved-jobs" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
              View all →
            </Link>
          </div>
          {recent_saved_jobs.length === 0 ? (
            <p className="text-sm text-neutral-500">No saved jobs yet.</p>
          ) : (
            <div className="space-y-3">
              {recent_saved_jobs
                .filter((savedJob) => savedJob.job_detail) // Filter out saved jobs without job data
                .map((savedJob) => (
                  <div key={savedJob.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                    <div className="flex-1 min-w-0">
                      <Link to={`/jobs/${savedJob.job_detail.id}`} className="text-sm font-medium text-neutral-900 hover:text-neutral-700 truncate block">
                        {savedJob.job_detail.title}
                      </Link>
                      <p className="text-xs text-neutral-500 mt-1">
                        Saved {new Date(savedJob.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to={`/jobs/${savedJob.job_detail.id}`}
                      className="text-xs font-medium text-neutral-700 hover:text-neutral-900 transition-colors ml-3 shrink-0"
                    >
                      View →
                    </Link>
                  </div>
                ))}
              {recent_saved_jobs.filter((savedJob) => !savedJob.job_detail).length > 0 && (
                <p className="text-xs text-neutral-400 italic">
                  {recent_saved_jobs.filter((savedJob) => !savedJob.job_detail).length} saved job(s) unavailable
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Jobs */}
      {recommendedJobs.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-neutral-900">Recommended for You</h2>
            <Link to="/jobs" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
              Browse all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}

      {/* Latest Jobs */}
      {regularJobs.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-neutral-900">Latest Jobs</h2>
            <Link to="/jobs" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
              Browse all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {regularJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mt-8">
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/"
            className="px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-center"
          >
            <p className="text-sm font-medium text-neutral-900">Browse Jobs</p>
          </Link>
          <Link
            to="/profile"
            className="px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-center"
          >
            <p className="text-sm font-medium text-neutral-900">Edit Profile</p>
          </Link>
          <Link
            to="/notifications"
            className="px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-center relative"
          >
            <p className="text-sm font-medium text-neutral-900">Notifications</p>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 bg-neutral-900 text-white text-[10px] font-medium rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
