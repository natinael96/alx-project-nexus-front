import { useEffect, useState } from 'react';
import { profileAPI } from '../lib/api';
import useAuthStore from '../stores/authStore';
import type { SavedJob } from '../types';

/**
 * Hook to fetch and cache saved jobs
 * Returns a map of jobId -> savedJobId for quick lookups
 */
export function useSavedJobs() {
  const { isAuthenticated } = useAuthStore();
  const [savedJobsMap, setSavedJobsMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!isAuthenticated()) {
        setSavedJobsMap(new Map());
        return;
      }

      setLoading(true);
      try {
        const response = await profileAPI.getSavedJobs({ page_size: 100 });
        const map = new Map<string, string>();
        
        if (response.data.results) {
          response.data.results.forEach((savedJob: SavedJob) => {
            if (savedJob.job_detail?.id) {
              map.set(savedJob.job_detail.id, savedJob.id);
            }
          });
        }
        
        setSavedJobsMap(map);
      } catch (err) {
        console.error('Failed to fetch saved jobs:', err);
        setSavedJobsMap(new Map());
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, [isAuthenticated]);

  const getSavedJobId = (jobId: string): string | null => {
    return savedJobsMap.get(jobId) || null;
  };

  const updateSavedJob = (jobId: string, savedJobId: string | null) => {
    setSavedJobsMap((prev) => {
      const newMap = new Map(prev);
      if (savedJobId) {
        newMap.set(jobId, savedJobId);
      } else {
        newMap.delete(jobId);
      }
      return newMap;
    });
  };

  return { getSavedJobId, updateSavedJob, loading };
}
