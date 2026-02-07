import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useJobsStore from '../stores/jobsStore';
import useApplicationsStore from '../stores/applicationsStore';
import useAuthStore from '../stores/authStore';
import Toast from './Toast';
import SaveJobButton from './SaveJobButton';
import { validateApplication } from '../utils/validation';
import { validateFile } from '../utils/security';

function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { job, loading, error, fetchJob } = useJobsStore();
  const { createApplication, loading: applying } = useApplicationsStore();
  const { isAuthenticated } = useAuthStore();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [applicationError, setApplicationError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (id) {
      fetchJob(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleApplicationSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApplicationError('');

    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (!resume || !id) {
      setApplicationError('Please upload your resume');
      return;
    }

    // Validate application data
    const validation = validateApplication({
      cover_letter: coverLetter,
      resume: resume,
    });

    if (!validation.isValid) {
      const errorMessages = Object.entries(validation.errors)
        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
        .join('\n');
      setApplicationError(errorMessages);
      return;
    }

    // Validate file
    const fileValidation = validateFile(resume, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      allowedExtensions: ['pdf', 'doc', 'docx'],
    });

    if (!fileValidation.isValid) {
      setApplicationError(fileValidation.error || 'Invalid file');
      return;
    }

    const result = await createApplication(id, coverLetter, resume);
    
    if (result.success) {
      setShowApplicationForm(false);
      setCoverLetter('');
      setResume(null);
      setToast({ message: 'Application submitted successfully!', type: 'success' });
    } else {
      const errorMsg = typeof result.error === 'string' 
        ? result.error 
        : (result.error as any)?.detail || 'Failed to submit application';
      setApplicationError(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-900"></div>
        <p className="mt-4 text-sm text-neutral-500">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="rounded-lg bg-red-50 border border-red-100 p-4 mb-4">
          <p className="text-sm text-red-700">{typeof error === 'string' ? error : 'Job not found'}</p>
        </div>
        <Link to="/" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
          ← Back to Jobs
        </Link>
      </div>
    );
  }

  const formatSalary = (min?: string, max?: string) => {
    if (!min && !max) return null;
    if (min && max) return `$${parseFloat(min).toLocaleString()} - $${parseFloat(max).toLocaleString()}`;
    if (min) return `From $${parseFloat(min).toLocaleString()}`;
    return `Up to $${parseFloat(max!).toLocaleString()}`;
  };

  const salary = formatSalary(job.salary_min, job.salary_max);

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors mb-6 inline-block">
          ← Back to Jobs
        </Link>

      <div className="bg-white rounded-2xl border border-neutral-200 p-8 md:p-10">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-light text-neutral-900 mb-3">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {job.job_type?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                {job.category && (
                  <span className="px-2.5 py-1 text-xs font-medium text-neutral-600 bg-neutral-50 rounded-md">
                    {job.category.name}
                  </span>
                )}
                {job.is_featured && (
                  <span className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-md">
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>

          {salary && (
            <div className="inline-block px-4 py-2 bg-neutral-50 rounded-lg mb-6">
              <div className="text-lg font-medium text-neutral-900">{salary}</div>
              {job.application_deadline && (
                <div className="text-xs text-neutral-500 mt-1">
                  Application deadline: {new Date(job.application_deadline).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-8 mb-10">
          <div>
            <h2 className="text-xl font-medium text-neutral-900 mb-3">Description</h2>
            <div className="prose prose-sm max-w-none text-neutral-600 whitespace-pre-wrap leading-relaxed">
              {job.description}
            </div>
          </div>

          {job.requirements && (
            <div>
              <h2 className="text-xl font-medium text-neutral-900 mb-3">Requirements</h2>
              <div className="prose prose-sm max-w-none text-neutral-600 whitespace-pre-wrap leading-relaxed">
                {job.requirements}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-neutral-200">
            <h2 className="text-xl font-medium text-neutral-900 mb-3">Employer</h2>
            <div className="text-neutral-600">
              <p className="font-medium text-neutral-900">{job.employer?.username || 'N/A'}</p>
              {job.employer?.email && (
                <p className="text-sm text-neutral-500 mt-1">{job.employer.email}</p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-200">
          {!showApplicationForm ? (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!isAuthenticated()) {
                    navigate('/login');
                  } else {
                    setShowApplicationForm(true);
                  }
                }}
                className="px-8 py-3 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 transition-all"
              >
                Apply Now
              </button>
              {isAuthenticated() && (
                <SaveJobButton jobId={job.id} />
              )}
            </div>
          ) : (
            <form onSubmit={handleApplicationSubmit} className="space-y-5">
              <h3 className="text-lg font-medium text-neutral-900">Submit Application</h3>
              
              {applicationError && (
                <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                  <p className="text-sm text-red-700">{applicationError}</p>
                </div>
              )}

              <div>
                <label htmlFor="cover_letter" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Cover Letter
                </label>
                <textarea
                  id="cover_letter"
                  rows={6}
                  value={coverLetter}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCoverLetter(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all resize-none"
                  placeholder="Write your cover letter here..."
                />
              </div>

              <div>
                <label htmlFor="resume" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Resume (PDF, DOC, DOCX - Max 5MB)
                </label>
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setResume(e.target.files?.[0] || null)}
                  required
                  className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-neutral-900 file:text-white hover:file:bg-neutral-800"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={applying}
                  className="px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowApplicationForm(false);
                    setCoverLetter('');
                    setResume(null);
                    setApplicationError('');
                  }}
                  className="px-6 py-2.5 bg-white text-neutral-700 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default JobDetails;
