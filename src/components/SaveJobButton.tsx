import { useState } from 'react';
import { profileAPI } from '../lib/api';
import useAuthStore from '../stores/authStore';
import Toast from './Toast';

interface SaveJobButtonProps {
  jobId: string;
  savedJobId?: string | null;
  onSaveChange?: () => void;
}

function SaveJobButton({ jobId, savedJobId, onSaveChange }: SaveJobButtonProps) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { isAuthenticated } = useAuthStore();
  const isSaved = !!savedJobId;

  const handleSave = async () => {
    if (!isAuthenticated()) {
      setToast({ message: 'Please login to save jobs', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      if (isSaved && savedJobId) {
        await profileAPI.unsaveJob(savedJobId);
        setToast({ message: 'Job removed from saved jobs', type: 'success' });
      } else {
        await profileAPI.saveJob(jobId);
        setToast({ message: 'Job saved successfully', type: 'success' });
      }
      onSaveChange?.();
    } catch (error: any) {
      setToast({ 
        message: error.response?.data?.detail || 'Failed to save job', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <button
        onClick={handleSave}
        disabled={loading}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
          isSaved
            ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            : 'bg-neutral-900 text-white hover:bg-neutral-800'
        } disabled:opacity-50`}
        title={isSaved ? 'Remove from saved jobs' : 'Save job'}
      >
        {loading ? (
          '...'
        ) : isSaved ? (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            Saved
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Save
          </span>
        )}
      </button>
    </>
  );
}

export default SaveJobButton;
