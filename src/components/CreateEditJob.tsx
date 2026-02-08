import { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobsAPI, categoriesAPI } from '../lib/api';
import { sanitizeError } from '../utils/security';
import Toast from './Toast';
import type { Job, Category } from '../types';

function CreateEditJob() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    requirements: '',
    location: '',
    job_type: 'full-time' as Job['job_type'],
    salary_min: '',
    salary_max: '',
    application_deadline: '',
    status: 'draft' as Job['status'],
    is_featured: false,
  });

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadJob();
    }
  }, [id, isEdit]);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      setCategories(response.data);
    } catch (err: any) {
      setToast({ message: sanitizeError(err), type: 'error' });
    }
  };

  const loadJob = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await jobsAPI.getJob(id);
      const job = response.data;
      setFormData({
        title: job.title,
        category: job.category?.id || '',
        description: job.description,
        requirements: job.requirements || '',
        location: job.location,
        job_type: job.job_type,
        salary_min: job.salary_min || '',
        salary_max: job.salary_max || '',
        application_deadline: job.application_deadline || '',
        status: job.status,
        is_featured: job.is_featured,
      });
    } catch (err: any) {
      setToast({ message: sanitizeError(err), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData: any = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        requirements: formData.requirements,
        location: formData.location,
        job_type: formData.job_type,
        status: formData.status,
        is_featured: formData.is_featured,
      };

      if (formData.salary_min) submitData.salary_min = parseFloat(formData.salary_min);
      if (formData.salary_max) submitData.salary_max = parseFloat(formData.salary_max);
      if (formData.application_deadline) submitData.application_deadline = formData.application_deadline;

      if (isEdit && id) {
        await jobsAPI.updateJob(id, submitData);
        setToast({ message: 'Job updated successfully', type: 'success' });
      } else {
        await jobsAPI.createJob(submitData);
        setToast({ message: 'Job created successfully', type: 'success' });
      }

      setTimeout(() => {
        navigate('/employer/jobs');
      }, 1500);
    } catch (err: any) {
      setToast({ message: sanitizeError(err), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (isEdit && loading && !formData.title) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-900"></div>
        <p className="mt-4 text-sm text-neutral-500">Loading job...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-3xl font-light text-neutral-900 mb-2">{isEdit ? 'Edit Job' : 'Create New Job'}</h1>
        <p className="text-neutral-500">{isEdit ? 'Update job details' : 'Post a new job listing'}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={200}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            placeholder="e.g., Senior Python Developer"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={6}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
            placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Requirements <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={6}
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
            placeholder="List the required skills, experience, and qualifications..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="e.g., Remote, New York, NY"
            />
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Job Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.job_type}
              onChange={(e) => setFormData({ ...formData, job_type: e.target.value as Job['job_type'] })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>

          {/* Salary Min */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Salary Min (Optional)</label>
            <input
              type="number"
              min={0}
              value={formData.salary_min}
              onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="e.g., 80000"
            />
          </div>

          {/* Salary Max */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Salary Max (Optional)</label>
            <input
              type="number"
              min={0}
              value={formData.salary_max}
              onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="e.g., 120000"
            />
          </div>

          {/* Application Deadline */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Application Deadline (Optional)</label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={formData.application_deadline}
              onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Job['status'] })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>

        {/* Featured */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
            />
            <span className="text-sm text-neutral-700">Feature this job</span>
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4 border-t border-neutral-200">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Job' : formData.status === 'active' ? 'Publish Job' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/employer/jobs')}
            className="px-6 py-2.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEditJob;
