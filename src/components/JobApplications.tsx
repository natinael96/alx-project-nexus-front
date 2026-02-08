import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applicationsAPI, jobsAPI, filesAPI } from '../lib/api';
import { sanitizeError } from '../utils/security';
import Toast from './Toast';
import type { Application, Job } from '../types';

function JobApplications() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  useEffect(() => {
    if (id) {
      loadJob();
      loadApplications();
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

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await applicationsAPI.getApplications({ job: id, page_size: 100 });
      setApplications(response.data.results);
    } catch (err: any) {
      setError(sanitizeError(err));
      setToast({ message: sanitizeError(err), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: Application['status']) => {
    try {
      await applicationsAPI.updateApplicationStatus(applicationId, newStatus);
      setToast({ message: 'Application status updated', type: 'success' });
      loadApplications();
    } catch (err: any) {
      setToast({ message: sanitizeError(err), type: 'error' });
    }
  };

  const handleDownloadResume = async (applicationId: string) => {
    try {
      const response = await filesAPI.downloadResume(applicationId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume-${applicationId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setToast({ message: sanitizeError(err), type: 'error' });
    }
  };

  const getApplicationsByStatus = (status: Application['status']) => {
    return applications.filter(app => app.status === status);
  };

  const statusColumns: Array<{ key: Application['status']; label: string; color: string }> = [
    { key: 'pending', label: 'Pending', color: 'bg-yellow-50 border-yellow-200' },
    { key: 'reviewed', label: 'Reviewed', color: 'bg-blue-50 border-blue-200' },
    { key: 'accepted', label: 'Accepted', color: 'bg-green-50 border-green-200' },
    { key: 'rejected', label: 'Rejected', color: 'bg-red-50 border-red-200' },
  ];

  if (loading && !job) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-900"></div>
        <p className="mt-4 text-sm text-neutral-500">Loading...</p>
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
              <div className="flex items-center gap-4 text-sm text-neutral-500">
                <span>Status: <span className="font-medium text-neutral-900">{job.status}</span></span>
                {job.application_deadline && (
                  <span>Deadline: <span className="font-medium text-neutral-900">{new Date(job.application_deadline).toLocaleDateString()}</span></span>
                )}
              </div>
            </div>
            <Link
              to={`/employer/jobs/${job.id}/analytics`}
              className="px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50"
            >
              View Analytics
            </Link>
          </div>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-neutral-900">Applications ({applications.length})</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              viewMode === 'kanban'
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              viewMode === 'table'
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusColumns.map((column) => {
            const columnApps = getApplicationsByStatus(column.key);
            return (
              <div key={column.key} className={`rounded-lg border-2 p-4 ${column.color}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-neutral-900">{column.label}</h3>
                  <span className="text-sm text-neutral-600 bg-white px-2 py-0.5 rounded">{columnApps.length}</span>
                </div>
                <div className="space-y-3">
                  {columnApps.map((app) => (
                    <div key={app.id} className="bg-white rounded-lg p-3 border border-neutral-200">
                      <p className="text-sm font-medium text-neutral-900 mb-1">{app.applicant?.username || 'Unknown'}</p>
                      <p className="text-xs text-neutral-500 mb-2">{app.applicant?.email || ''}</p>
                      <p className="text-xs text-neutral-400 mb-3">{new Date(app.applied_at).toLocaleDateString()}</p>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleDownloadResume(app.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 text-left"
                        >
                          Download Resume
                        </button>
                        {column.key === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(app.id, 'reviewed')}
                              className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleStatusChange(app.id, 'accepted')}
                              className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusChange(app.id, 'rejected')}
                              className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {column.key === 'reviewed' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(app.id, 'accepted')}
                              className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusChange(app.id, 'rejected')}
                              className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {columnApps.length === 0 && (
                    <p className="text-xs text-neutral-400 text-center py-4">No applications</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Applied Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Resume</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{app.applicant?.username || 'Unknown'}</p>
                        <p className="text-xs text-neutral-500">{app.applicant?.email || ''}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{new Date(app.applied_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
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
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDownloadResume(app.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Download
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(app.id, 'reviewed')}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleStatusChange(app.id, 'accepted')}
                              className="text-xs text-green-600 hover:text-green-800"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusChange(app.id, 'rejected')}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {app.status === 'reviewed' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(app.id, 'accepted')}
                              className="text-xs text-green-600 hover:text-green-800"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusChange(app.id, 'rejected')}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobApplications;
