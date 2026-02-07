import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import useJobsStore from '../stores/jobsStore';
import JobCard from './JobCard';
import { sanitizeString } from '../utils/validation';

function JobList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobs, loading, error, filters, pagination, fetchJobs, updateFilters, fetchCategories, categories } = useJobsStore();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = {
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || null,
      location: searchParams.get('location') || '',
      job_type: searchParams.get('job_type') || '',
      min_salary: searchParams.get('min_salary') || '',
      max_salary: searchParams.get('max_salary') || '',
      page: parseInt(searchParams.get('page') || '1'),
    };
    updateFilters(params);
    fetchJobs(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm) {
      // Sanitize search input
      const sanitized = sanitizeString(searchTerm, 200);
      newParams.set('search', sanitized);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      // Sanitize filter values (especially for text inputs like location)
      const sanitized = key === 'location' ? sanitizeString(value, 100) : value;
      newParams.set(key, sanitized);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-light text-neutral-900 mb-2">Find your next opportunity</h1>
        <p className="text-neutral-500">Discover jobs that match your skills and interests</p>
      </div>
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search jobs, companies, or keywords..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="flex-1 px-5 py-3 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            className="px-6 py-3 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 transition-all"
          >
            Search
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1.5">Category</label>
          <select
            value={searchParams.get('category') || ''}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilterChange('category', e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1.5">Location</label>
          <input
            type="text"
            placeholder="City or country"
            value={searchParams.get('location') || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('location', e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1.5">Job Type</label>
          <select
            value={searchParams.get('job_type') || ''}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilterChange('job_type', e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
          >
            <option value="">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1.5">Min Salary</label>
          <input
            type="number"
            placeholder="Minimum"
            value={searchParams.get('min_salary') || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('min_salary', e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-900"></div>
          <p className="mt-4 text-sm text-neutral-500">Loading jobs...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 p-4 mb-6">
          <p className="text-sm text-red-700">{typeof error === 'string' ? error : JSON.stringify(error)}</p>
        </div>
      )}

      {/* Jobs Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {jobs.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-neutral-500 text-lg mb-1">No jobs found</p>
                <p className="text-sm text-neutral-400">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              jobs.map((job) => <JobCard key={job.id} job={job} />)
            )}
          </div>

          {/* Pagination */}
          {pagination.count > 0 && (
            <div className="flex items-center justify-between border-t border-neutral-200 pt-6">
              <div className="text-sm text-neutral-500">
                Showing {((parseInt(searchParams.get('page') || '1')) - 1) * 20 + 1} to{' '}
                {Math.min((parseInt(searchParams.get('page') || '1')) * 20, pagination.count)} of{' '}
                {pagination.count} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange((parseInt(searchParams.get('page') || '1')) - 1)}
                  disabled={!pagination.previous}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange((parseInt(searchParams.get('page') || '1')) + 1)}
                  disabled={!pagination.next}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default JobList;
