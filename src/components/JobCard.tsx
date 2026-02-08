import { Link } from 'react-router-dom';
import type { Job } from '../types';
import SaveJobButton from './SaveJobButton';
import useAuthStore from '../stores/authStore';
import { useSavedJobs } from '../hooks/useSavedJobs';

interface JobCardProps {
  job: Job;
}

function JobCard({ job }: JobCardProps) {
  const { isAuthenticated } = useAuthStore();
  const { getSavedJobId, updateSavedJob } = useSavedJobs();
  const savedJobId = getSavedJobId(job.id);

  const handleSaveChange = (newSavedJobId?: string | null) => {
    updateSavedJob(job.id, newSavedJobId || null);
  };

  const formatSalary = (min?: string, max?: string) => {
    if (!min && !max) return null;
    if (min && max) return `$${parseFloat(min).toLocaleString()} - $${parseFloat(max).toLocaleString()}`;
    if (min) return `From $${parseFloat(min).toLocaleString()}`;
    return `Up to $${parseFloat(max!).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const salary = formatSalary(job.salary_min, job.salary_max);

  return (
    <Link to={`/jobs/${job.id}`}>
      <div className="group bg-white rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-md transition-all duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-neutral-900 group-hover:text-neutral-700 mb-2 line-clamp-2">
              {job.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {job.job_type?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
          </div>
          {job.is_featured && (
            <span className="ml-2 px-2 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-md shrink-0">
              Featured
            </span>
          )}
        </div>

        {job.description && (
          <p className="text-sm text-neutral-600 line-clamp-2 mb-4">
            {job.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-3 flex-wrap">
            {salary && (
              <span className="text-sm font-medium text-neutral-900">{salary}</span>
            )}
            {job.category && (
              <span className="px-2.5 py-1 text-xs font-medium text-neutral-600 bg-neutral-50 rounded-md">
                {job.category.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">
              {formatDate(job.created_at)}
            </span>
            {isAuthenticated() && (
              <div onClick={(e) => e.preventDefault()} className="relative z-10">
                <SaveJobButton 
                  jobId={job.id} 
                  savedJobId={savedJobId}
                  onSaveChange={handleSaveChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default JobCard;
