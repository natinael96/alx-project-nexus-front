import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { profileAPI } from '../lib/api';
import type { SavedJob } from '../types';
import SaveJobButton from './SaveJobButton';
import { sanitizeError } from '../utils/security';

function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await profileAPI.getSavedJobs({ page_size: 100 });
        setSavedJobs(response.data.results);
      } catch (err: any) {
        setError(sanitizeError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, []);

  const handleUnsave = (savedJobId: string) => {
    setSavedJobs(savedJobs.filter((sj) => sj.id !== savedJobId));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-900"></div>
        <p className="mt-4 text-sm text-neutral-500">Loading saved jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-neutral-900 mb-2">Saved Jobs</h1>
        <p className="text-neutral-500">Jobs you've bookmarked for later</p>
      </div>

      {savedJobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <p className="text-neutral-500 text-lg mb-2">No saved jobs yet</p>
          <p className="text-sm text-neutral-400 mb-4">Start browsing jobs and save the ones you're interested in</p>
          <Link
            to="/"
            className="inline-block px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedJobs.map((savedJob) => (
            <div key={savedJob.id} className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <Link to={`/jobs/${savedJob.job.id}`} className="flex-1">
                  <h3 className="text-lg font-medium text-neutral-900 hover:text-neutral-700 mb-1">
                    {savedJob.job.title}
                  </h3>
                  <p className="text-sm text-neutral-500">{savedJob.job.employer?.username}</p>
                </Link>
                <div onClick={(e) => e.preventDefault()} className="relative z-10">
                  <SaveJobButton
                    jobId={savedJob.job.id}
                    savedJobId={savedJob.id}
                    onSaveChange={() => handleUnsave(savedJob.id)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {savedJob.job.location}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {savedJob.job.job_type?.replace('-', ' ')}
                </span>
              </div>

              {savedJob.notes && (
                <div className="mb-3 p-2 bg-neutral-50 rounded text-xs text-neutral-600">
                  <strong>Note:</strong> {savedJob.notes}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                <span className="text-xs text-neutral-400">
                  Saved {new Date(savedJob.created_at).toLocaleDateString()}
                </span>
                <Link
                  to={`/jobs/${savedJob.job.id}`}
                  className="text-xs font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedJobs;
