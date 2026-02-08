import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { employerAPI, jobsAPI } from '../lib/api';
import { sanitizeError } from '../utils/security';
import Toast from './Toast';
import type { Job } from '../types';

function JobAnalytics() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (id) {
      loadJob();
      loadAnalytics();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      const response = await jobsAPI.getJob(id!);
      setJob(response.data);
    } catch (err: any) {
      setError(sanitizeError(err));
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await employerAPI.getJobAnalytics(id!);
      setAnalytics(response.data);
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
        <p className="mt-4 text-sm text-neutral-500">Loading analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">Error: {error || 'Failed to load analytics'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Job Header */}
      {job && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light text-neutral-900 mb-2">{job.title}</h1>
              <p className="text-sm text-neutral-500">Job Analytics</p>
            </div>
            <Link
              to={`/employer/jobs/${job.id}/applications`}
              className="px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50"
            >
              View Applications
            </Link>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Total Views</p>
          <p className="text-2xl font-light text-neutral-900">{analytics.total_views.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Unique Views</p>
          <p className="text-2xl font-light text-neutral-900">{analytics.unique_views.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Applications</p>
          <p className="text-2xl font-light text-neutral-900">{analytics.applications}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Shares</p>
          <p className="text-2xl font-light text-neutral-900">{analytics.shares || 0}</p>
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Conversion Rate</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-4 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-neutral-900 transition-all"
                style={{ width: `${analytics.conversion_rate}%` }}
              />
            </div>
          </div>
          <span className="text-2xl font-light text-neutral-900">{analytics.conversion_rate.toFixed(1)}%</span>
        </div>
        <p className="text-sm text-neutral-500 mt-2">Views to Applications</p>
      </div>

      {/* Views Over Time */}
      {analytics.views_over_time && analytics.views_over_time.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Views Over Time</h2>
          <div className="space-y-2">
            {analytics.views_over_time.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-sm text-neutral-600 w-24">{new Date(item.date).toLocaleDateString()}</span>
                <div className="flex-1 bg-neutral-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 transition-all"
                    style={{ width: `${(item.views / Math.max(...analytics.views_over_time.map((v: any) => v.views))) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-neutral-900 w-16 text-right">{item.views}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application Sources */}
      {analytics.application_sources && analytics.application_sources.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Application Sources</h2>
          <div className="space-y-3">
            {analytics.application_sources.map((source: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">{source.source || 'Unknown'}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-neutral-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-neutral-900 transition-all"
                      style={{ width: `${(source.count / analytics.applications) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-neutral-900 w-12 text-right">{source.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default JobAnalytics;
