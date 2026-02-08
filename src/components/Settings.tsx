import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import useAuthStore from '../stores/authStore';
import { profileAPI } from '../lib/api';
import type { UserPreferences } from '../types';
import Toast from './Toast';
import { sanitizeError } from '../utils/security';

function Settings() {
  const { changePassword } = useAuthStore();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    new_password2: '',
  });

  // Preferences form
  const [preferencesForm, setPreferencesForm] = useState<Partial<UserPreferences>>({});

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const response = await profileAPI.getPreferences();
      setPreferences(response.data);
      setPreferencesForm({
        email_job_alerts: response.data.email_job_alerts ?? response.data.job_alerts ?? false,
        email_application_updates: response.data.email_application_updates ?? false,
        email_new_jobs: response.data.email_new_jobs ?? false,
        email_newsletter: response.data.email_newsletter ?? response.data.newsletter ?? false,
        alert_frequency: response.data.alert_frequency || 'weekly',
        profile_visibility: response.data.profile_visibility || 'public',
        show_email: response.data.show_email ?? false,
        show_phone: response.data.show_phone ?? false,
        show_location: response.data.show_location ?? false,
      });
    } catch (error: any) {
      setToast({ message: sanitizeError(error), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.new_password2) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    const result = await changePassword(
      passwordForm.old_password,
      passwordForm.new_password,
      passwordForm.new_password2
    );

    if (result.success) {
      setToast({ message: 'Password changed successfully', type: 'success' });
      setPasswordForm({ old_password: '', new_password: '', new_password2: '' });
    } else {
      setToast({ message: typeof result.error === 'string' ? result.error : 'Failed to change password', type: 'error' });
    }
  };

  const handlePreferencesUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!preferences?.id) {
      setToast({ message: 'Preferences not loaded', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      await profileAPI.updatePreferences(preferences.id, preferencesForm);
      setToast({ message: 'Preferences updated successfully', type: 'success' });
      loadPreferences();
    } catch (error: any) {
      setToast({ message: sanitizeError(error), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-900"></div>
        <p className="mt-4 text-sm text-neutral-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-3xl font-light text-neutral-900 mb-2">Settings</h1>
        <p className="text-neutral-500">Manage your account settings and preferences</p>
      </div>

      <div className="space-y-8">
        {/* Change Password Section */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={passwordForm.old_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordForm.new_password2}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password2: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800"
            >
              Change Password
            </button>
          </form>
        </div>

        {/* Notification Preferences Section */}
        {preferences && (
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-medium text-neutral-900 mb-4">Notification Preferences</h2>
            <form onSubmit={handlePreferencesUpdate} className="space-y-6">
              {/* Email Notifications */}
              <div>
                <h3 className="text-sm font-medium text-neutral-900 mb-3">Email Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-neutral-700">Email job alerts</span>
                      <p className="text-xs text-neutral-500">Get notified about new jobs matching your criteria</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferencesForm.email_job_alerts ?? false}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, email_job_alerts: e.target.checked })}
                      className="w-5 h-5 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-neutral-700">Application update emails</span>
                      <p className="text-xs text-neutral-500">Receive updates when your application status changes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferencesForm.email_application_updates ?? false}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, email_application_updates: e.target.checked })}
                      className="w-5 h-5 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-neutral-700">New jobs email</span>
                      <p className="text-xs text-neutral-500">Weekly digest of new job postings</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferencesForm.email_new_jobs ?? false}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, email_new_jobs: e.target.checked })}
                      className="w-5 h-5 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-neutral-700">Newsletter</span>
                      <p className="text-xs text-neutral-500">Monthly newsletter with tips and industry news</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferencesForm.email_newsletter ?? false}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, email_newsletter: e.target.checked })}
                      className="w-5 h-5 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                    />
                  </label>
                </div>
              </div>

              {/* Alert Frequency */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Alert Frequency</label>
                <select
                  value={preferencesForm.alert_frequency || 'weekly'}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setPreferencesForm({ ...preferencesForm, alert_frequency: e.target.value as 'daily' | 'weekly' | 'monthly' })
                  }
                  className="w-full sm:w-48 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Profile Visibility */}
              <div>
                <h3 className="text-sm font-medium text-neutral-900 mb-3">Profile Visibility</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Profile visibility</span>
                    <select
                      value={preferencesForm.profile_visibility || 'public'}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        setPreferencesForm({ ...preferencesForm, profile_visibility: e.target.value as 'public' | 'private' })
                      }
                      className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Show email</span>
                    <input
                      type="checkbox"
                      checked={preferencesForm.show_email ?? false}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, show_email: e.target.checked })}
                      className="w-5 h-5 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Show phone</span>
                    <input
                      type="checkbox"
                      checked={preferencesForm.show_phone ?? false}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, show_phone: e.target.checked })}
                      className="w-5 h-5 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Show location</span>
                    <input
                      type="checkbox"
                      checked={preferencesForm.show_location ?? false}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, show_location: e.target.checked })}
                      className="w-5 h-5 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
