import { useState } from 'react';
import { employerAPI, jobsAPI } from '../lib/api';
import { sanitizeError } from '../utils/security';
import Toast from './Toast';
import type { Job } from '../types';

function ExportData() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');

  const handleExportJobs = async (format: 'csv' | 'json') => {
    setLoading(true);
    try {
      const response = await employerAPI.exportJobs(format);
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jobs-export.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      setToast({ message: `Jobs exported as ${format.toUpperCase()}`, type: 'success' });
    } catch (err: any) {
      setToast({ message: sanitizeError(err), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportApplications = async (format: 'csv' | 'json') => {
    setLoading(true);
    try {
      const response = await employerAPI.exportApplications(format, selectedJob || undefined);
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applications-export.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      setToast({ message: `Applications exported as ${format.toUpperCase()}`, type: 'success' });
    } catch (err: any) {
      setToast({ message: sanitizeError(err), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const response = await jobsAPI.getJobs({ page_size: 100 });
      setJobs(response.data.results);
    } catch (err: any) {
      setToast({ message: sanitizeError(err), type: 'error' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-3xl font-light text-neutral-900 mb-2">Export Data</h1>
        <p className="text-neutral-500">Download your jobs and applications data</p>
      </div>

      <div className="space-y-6">
        {/* Export Jobs */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Export Jobs</h2>
          <div className="flex items-center gap-3">
            <select
              onChange={(e) => handleExportJobs(e.target.value as 'csv' | 'json')}
              disabled={loading}
              className="px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="">Select format...</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
            <button
              onClick={() => {
                const format = (document.querySelector('select') as HTMLSelectElement)?.value as 'csv' | 'json';
                if (format) handleExportJobs(format);
              }}
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50"
            >
              {loading ? 'Exporting...' : 'Download'}
            </button>
          </div>
        </div>

        {/* Export Applications */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Export Applications</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Filter by Job (Optional)</label>
              <select
                value={selectedJob}
                onChange={(e) => {
                  setSelectedJob(e.target.value);
                  if (e.target.value && jobs.length === 0) loadJobs();
                }}
                onFocus={() => {
                  if (jobs.length === 0) loadJobs();
                }}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="">All Jobs</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <select
                onChange={(e) => handleExportApplications(e.target.value as 'csv' | 'json')}
                disabled={loading}
                className="px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="">Select format...</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
              <button
                onClick={() => {
                  const format = (document.querySelectorAll('select')[1] as HTMLSelectElement)?.value as 'csv' | 'json';
                  if (format) handleExportApplications(format);
                }}
                disabled={loading}
                className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50"
              >
                {loading ? 'Exporting...' : 'Download'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExportData;
