import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import useAuthStore from '../stores/authStore';
import { profileAPI } from '../lib/api';
import type { UserProfile, Skill } from '../types';
import { UpdateProfileData } from '../lib/api';
import Toast from './Toast';
import { sanitizeError, validateFile } from '../utils/security';

function Profile() {
  const { user, updateProfile, changePassword, loading } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'education' | 'work' | 'social' | 'settings'>('overview');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Edit states
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<UpdateProfileData>({});
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Skill form
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [skillForm, setSkillForm] = useState<Omit<Skill, 'id'>>({
    name: '',
    level: 'beginner',
    years_of_experience: 0,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setProfileLoading(true);
    try {
      const response = await profileAPI.getProfile();
      setProfile(response.data);
    } catch (error: any) {
      setToast({ message: sanitizeError(error), type: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  // --- Profile update ---
  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    const result = await updateProfile(profileForm);
    if (result.success) {
      setToast({ message: 'Profile updated successfully', type: 'success' });
      setEditingProfile(false);
      loadProfile();
    } else {
      setToast({ message: typeof result.error === 'string' ? result.error : 'Update failed', type: 'error' });
    }
  };

  const handleProfilePicture = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file, {
      maxSize: 2 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
      allowedExtensions: ['jpg', 'jpeg', 'png'],
    });

    if (!validation.isValid) {
      setToast({ message: validation.error || 'Invalid file', type: 'error' });
      return;
    }

    const result = await updateProfile({ profile_picture: file });
    if (result.success) {
      setToast({ message: 'Profile picture updated', type: 'success' });
      loadProfile();
    }
  };

  // --- Password change ---
  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }
    const result = await changePassword(
      passwordForm.old_password,
      passwordForm.new_password,
      passwordForm.confirm_password
    );
    if (result.success) {
      setToast({ message: 'Password changed successfully', type: 'success' });
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } else {
      setToast({ message: typeof result.error === 'string' ? result.error : 'Failed', type: 'error' });
    }
  };

  // --- Skills CRUD ---
  const handleAddSkill = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await profileAPI.addSkill(skillForm);
      setToast({ message: 'Skill added', type: 'success' });
      setShowSkillForm(false);
      setSkillForm({ name: '', level: 'beginner', years_of_experience: 0 });
      loadProfile();
    } catch (error: any) {
      setToast({ message: sanitizeError(error), type: 'error' });
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      await profileAPI.deleteSkill(skillId);
      setToast({ message: 'Skill removed', type: 'success' });
      loadProfile();
    } catch (error: any) {
      setToast({ message: sanitizeError(error), type: 'error' });
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900" />
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'skills', label: 'Skills' },
    { key: 'education', label: 'Education' },
    { key: 'work', label: 'Work History' },
    { key: 'social', label: 'Social Links' },
    { key: 'settings', label: 'Settings' },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center gap-6 mb-10">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center text-2xl font-light text-neutral-500">
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.username?.charAt(0).toUpperCase() || '?'
            )}
          </div>
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input type="file" className="hidden" accept="image/jpeg,image/png" onChange={handleProfilePicture} />
          </label>
        </div>
        <div>
          <h1 className="text-2xl font-light text-neutral-900">
            {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username}
          </h1>
          <p className="text-neutral-500 text-sm">{user?.email}</p>
          <span className="inline-block mt-1 text-xs font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200 mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all -mb-px ${
              activeTab === tab.key
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {!editingProfile ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-neutral-900">Personal Information</h2>
                <button onClick={() => { setEditingProfile(true); setProfileForm({ first_name: user?.first_name, last_name: user?.last_name, phone_number: user?.phone_number, bio: user?.bio }); }} className="text-sm font-medium text-neutral-900 hover:underline">
                  Edit
                </button>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><dt className="text-neutral-500">First name</dt><dd className="font-medium text-neutral-900">{user?.first_name || '—'}</dd></div>
                <div><dt className="text-neutral-500">Last name</dt><dd className="font-medium text-neutral-900">{user?.last_name || '—'}</dd></div>
                <div><dt className="text-neutral-500">Email</dt><dd className="font-medium text-neutral-900">{user?.email}</dd></div>
                <div><dt className="text-neutral-500">Phone</dt><dd className="font-medium text-neutral-900">{user?.phone_number || '—'}</dd></div>
                <div className="sm:col-span-2"><dt className="text-neutral-500">Bio</dt><dd className="font-medium text-neutral-900">{user?.bio || '—'}</dd></div>
              </dl>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
              <h2 className="text-lg font-medium text-neutral-900 mb-2">Edit Profile</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">First name</label>
                  <input type="text" value={profileForm.first_name || ''} onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Last name</label>
                  <input type="text" value={profileForm.last_name || ''} onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                  <input type="tel" value={profileForm.phone_number || ''} onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Bio</label>
                <textarea rows={3} value={profileForm.bio || ''} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50">Save</button>
                <button type="button" onClick={() => setEditingProfile(false)} className="px-5 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50">Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-neutral-900">Skills</h2>
            <button onClick={() => setShowSkillForm(!showSkillForm)} className="text-sm font-medium text-neutral-900 hover:underline">
              {showSkillForm ? 'Cancel' : '+ Add Skill'}
            </button>
          </div>

          {showSkillForm && (
            <form onSubmit={handleAddSkill} className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Skill name</label>
                  <input type="text" required value={skillForm.name} onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Level</label>
                  <select value={skillForm.level} onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value as Skill['level'] })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Years of experience</label>
                  <input type="number" min={0} max={50} value={skillForm.years_of_experience} onChange={(e) => setSkillForm({ ...skillForm, years_of_experience: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                </div>
              </div>
              <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800">Add Skill</button>
            </form>
          )}

          {profile?.skills && profile.skills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between bg-white rounded-lg border border-neutral-200 p-4">
                  <div>
                    <p className="font-medium text-neutral-900 text-sm">{skill.name}</p>
                    <p className="text-xs text-neutral-500 capitalize">{skill.level} • {skill.years_of_experience}y exp</p>
                  </div>
                  <button onClick={() => handleDeleteSkill(skill.id)} className="text-neutral-400 hover:text-red-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 py-8 text-center">No skills added yet</p>
          )}
        </div>
      )}

      {/* Education Tab */}
      {activeTab === 'education' && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-neutral-900">Education</h2>
          {profile?.education && profile.education.length > 0 ? (
            <div className="space-y-3">
              {profile.education.map((edu) => (
                <div key={edu.id} className="bg-white rounded-xl border border-neutral-200 p-5">
                  <h3 className="font-medium text-neutral-900">{edu.degree} in {edu.field_of_study}</h3>
                  <p className="text-sm text-neutral-600 mt-1">{edu.institution}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {edu.start_date} — {edu.is_current ? 'Present' : edu.end_date}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 py-8 text-center">No education entries yet</p>
          )}
        </div>
      )}

      {/* Work History Tab */}
      {activeTab === 'work' && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-neutral-900">Work History</h2>
          {profile?.work_history && profile.work_history.length > 0 ? (
            <div className="space-y-3">
              {profile.work_history.map((work) => (
                <div key={work.id} className="bg-white rounded-xl border border-neutral-200 p-5">
                  <h3 className="font-medium text-neutral-900">{work.position}</h3>
                  <p className="text-sm text-neutral-600 mt-1">{work.company}{work.location ? ` • ${work.location}` : ''}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {work.start_date} — {work.is_current ? 'Present' : work.end_date}
                  </p>
                  {work.description && <p className="text-sm text-neutral-500 mt-2">{work.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 py-8 text-center">No work history entries yet</p>
          )}
        </div>
      )}

      {/* Social Links Tab */}
      {activeTab === 'social' && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-neutral-900">Social Links</h2>
          {profile?.social_links && profile.social_links.length > 0 ? (
            <div className="space-y-3">
              {profile.social_links.map((link) => (
                <div key={link.id} className="flex items-center justify-between bg-white rounded-lg border border-neutral-200 p-4">
                  <div>
                    <p className="font-medium text-neutral-900 text-sm capitalize">{link.platform}</p>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">{link.url}</a>
                  </div>
                  <span className="text-xs text-neutral-400">{link.is_public ? 'Public' : 'Private'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 py-8 text-center">No social links yet</p>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <form onSubmit={handlePasswordChange} className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
            <h2 className="text-lg font-medium text-neutral-900">Change Password</h2>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Current password</label>
              <input type="password" required value={passwordForm.old_password} onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900" autoComplete="current-password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">New password</label>
              <input type="password" required value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900" autoComplete="new-password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Confirm new password</label>
              <input type="password" required value={passwordForm.confirm_password} onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900" autoComplete="new-password" />
            </div>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50">
              Change Password
            </button>
          </form>

          {profile?.preferences && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-medium text-neutral-900 mb-4">Preferences</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-neutral-500">Email notifications</span><span className="font-medium">{profile.preferences.email_notifications ? 'On' : 'Off'}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Job alerts</span><span className="font-medium">{profile.preferences.job_alerts ? 'On' : 'Off'}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Newsletter</span><span className="font-medium">{profile.preferences.newsletter ? 'On' : 'Off'}</span></div>
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;
