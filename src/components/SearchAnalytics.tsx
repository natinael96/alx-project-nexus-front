import { useEffect, useState } from 'react';
import { adminAPI } from '../lib/api';
import { sanitizeError } from '../utils/security';
import Toast from './Toast';

function SearchAnalytics() {
  const [statistics, setStatistics] = useState<any>(null);
  const [popularTerms, setPopularTerms] = useState<Array<{ term: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, termsRes] = await Promise.all([
        adminAPI.getSearchStatistics(days),
        adminAPI.getPopularSearchTerms(20, days),
      ]);
      setStatistics(statsRes.data);
      setPopularTerms(termsRes.data.results || []);
    } catch (err: any) {
      setError(sanitizeError(err));
      setToast({ message: sanitizeError(err), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-900"></div>
        <p className="mt-4 text-sm text-neutral-500">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-neutral-900 mb-2">Search Analytics</h1>
          <p className="text-neutral-500">View what users are searching for</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Stats Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <p className="text-sm font-medium text-neutral-500 mb-1">Total Searches</p>
            <p className="text-2xl font-light text-neutral-900">{statistics.total_searches?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <p className="text-sm font-medium text-neutral-500 mb-1">Unique Searches</p>
            <p className="text-2xl font-light text-neutral-900">{statistics.unique_searches?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <p className="text-sm font-medium text-neutral-500 mb-1">Zero Results</p>
            <p className="text-2xl font-light text-neutral-900">{statistics.zero_result_searches?.toLocaleString() || 0}</p>
          </div>
        </div>
      )}

      {/* Popular Search Terms */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Popular Search Terms</h2>
        {popularTerms.length === 0 ? (
          <p className="text-sm text-neutral-500">No search data available</p>
        ) : (
          <div className="space-y-2">
            {popularTerms.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <span className="text-sm font-medium text-neutral-900">{item.term}</span>
                <span className="text-sm text-neutral-500">{item.count} searches</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Search Volume Over Time</h2>
          <div className="h-64 flex items-center justify-center text-neutral-400">
            <p className="text-sm">Chart placeholder - integrate charting library</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Zero-Result Searches</h2>
          <div className="h-64 flex items-center justify-center text-neutral-400">
            <p className="text-sm">Chart placeholder - integrate charting library</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchAnalytics;
