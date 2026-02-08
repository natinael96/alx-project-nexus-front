import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { employerAPI, jobsAPI } from '../lib/api';
import { sanitizeError } from '../utils/security';
import Toast from './Toast';
import type { Job } from '../types';

interface ScreeningQuestion {
  id: string;
  job: string;
  question_text: string;
  question_type: 'text' | 'multiple_choice' | 'yes_no';
  is_required: boolean;
  order: number;
}

function ScreeningQuestions() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [questions, setQuestions] = useState<ScreeningQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'text' as 'text' | 'multiple_choice' | 'yes_no',
    is_required: false,
    order: 1,
  });

  useEffect(() => {
    if (id) {
      loadJob();
      loadQuestions();
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

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const response = await employerAPI.getScreeningQuestions(id!);
      setQuestions(response.data.sort((a, b) => a.order - b.order));
    } catch (err: any) {
      setError(sanitizeError(err));
      setToast({ message: sanitizeError(err), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await employerAPI.createScreeningQuestion({
        job: id,
        ...formData,
        order: questions.length + 1,
      });
      setToast({ message: 'Question added successfully', type: 'success' });
      setShowForm(false);
      setFormData({ question_text: '', question_type: 'text', is_required: false, order: 1 });
      loadQuestions();
    } catch (err: any) {
      setToast({ message: sanitizeError(err), type: 'error' });
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await employerAPI.deleteScreeningQuestion(questionId);
      setToast({ message: 'Question deleted', type: 'success' });
      loadQuestions();
    } catch (err: any) {
      setToast({ message: sanitizeError(err), type: 'error' });
    }
  };

  if (loading && !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-900"></div>
        <p className="mt-4 text-sm text-neutral-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Job Header */}
      {job && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light text-neutral-900 mb-2">{job.title}</h1>
              <p className="text-sm text-neutral-500">Screening Questions</p>
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

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-neutral-900">Screening Questions</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800"
        >
          {showForm ? 'Cancel' : '+ Add Question'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-neutral-200 p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Question Text</label>
            <textarea
              required
              rows={3}
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Question Type</label>
              <select
                value={formData.question_type}
                onChange={(e) => setFormData({ ...formData, question_type: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="text">Text</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="yes_no">Yes/No</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_required}
                  onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                  className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                />
                <span className="text-sm text-neutral-700">Required</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800"
          >
            Add Question
          </button>
        </form>
      )}

      {questions.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <p className="text-sm text-neutral-500">No screening questions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question) => (
            <div key={question.id} className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-neutral-500">#{question.order}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      question.is_required ? 'bg-red-50 text-red-700' : 'bg-neutral-50 text-neutral-700'
                    }`}>
                      {question.is_required ? 'Required' : 'Optional'}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                      {question.question_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-900">{question.question_text}</p>
                </div>
                <button
                  onClick={() => handleDelete(question.id)}
                  className="text-neutral-400 hover:text-red-500 transition-colors ml-4"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ScreeningQuestions;
