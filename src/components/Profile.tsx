import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import useAuthStore from '../stores/authStore';
import { profileAPI, UpdateProfileData } from '../lib/api';
import type { UserProfile, Skill, Education, WorkHistory, SocialLink, Portfolio } from '../types';
import Toast from './Toast';
import { sanitizeError, validateFile } from '../utils/security';

type TabType = 'basic' | 'skills' | 'education' | 'work' | 'portfolio' | 'social';

function Profile() {
  const { user, updateProfile, getCurrentUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [editingBasic, setEditingBasic] = useState(false);
  const [basicForm, setBasicForm] = useState<UpdateProfileData>({});
  
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [skillForm, setSkillForm] = useState<Omit<Skill, 'id'>>({
    name: '',
    level: 'beginner',
    years_of_experience: 0,
  });

  const [showEducationForm, setShowEducationForm] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [educationForm, setEducationForm] = useState<Omit<Education, 'id'>>({
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    is_current: false,
  });

  const [showWorkForm, setShowWorkForm] = useState(false);
  const [editingWork, setEditingWork] = useState<WorkHistory | null>(null);
  const [workForm, setWorkForm] = useState<Omit<WorkHistory, 'id'>>({
    company: '',
    position: '',
    start_date: '',
    end_date: null,
    is_current: false,
    description: '',
    location: '',
  });

  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [portfolioForm, setPortfolioForm] = useState<Omit<Portfolio, 'id'>>({
    title: '',
    description: '',
    url: '',
  });

  const [showSocialForm, setShowSocialForm] = useState(false);
  const [editingSocial, setEditingSocial] = useState<SocialLink | null>(null);
  const [socialForm, setSocialForm] = useState<Omit<SocialLink, 'id'>>({
    platform: '',
    url: '',
    is_public: true,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await profileAPI.getProfile();
      // Normalize the profile data - ensure arrays are always arrays
      const normalizedProfile = {
        ...response.data,
        skills: response.data.skills || [],
        education: response.data.education || [],
        work_history: response.data.work_history || [],
        portfolio: response.data.portfolio || [],
        social_links: response.data.social_links || [],
      };
      setProfile(normalizedProfile);
      setBasicForm({
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        phone_number: response.data.phone_number,
        bio: response.data.bio,
      });
    } catch (error: any) {
      setToast({ message: sanitizeError(error), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Basic Info
  const handleBasicUpdate = async (e: FormEvent) => {
    e.preventDefault();
    const result = await updateProfile(basicForm);
    if (result.success) {
      setToast({ message: 'Profile updated successfully', type: 'success' });
      setEditingBasic(false);
      await getCurrentUser();
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
      await getCurrentUser();
      loadProfile();
    }
  };

  // Skills
  const handleSkillSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingSkill) {
        await profileAPI.updateSkill(editingSkill.id!, skillForm);
        setToast({ message: 'Skill updated', type: 'success' });
      } else {
        await profileAPI.addSkill(skillForm);
        setToast({ message: 'Skill added', type: 'success' });
      }
      setShowSkillForm(false);
      setEditingSkill(null);
      setSkillForm({ name: '', level: 'beginner', years_of_experience: 0 });
      loadProfile();
    } catch (error: any) {
      setToast({ message: sanitizeError(error), type: 'error' });
    }
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setSkillForm({ name: skill.name, level: skill.level, years_of_experience: skill.years_of_experience });
    setShowSkillForm(true);
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await profileAPI.deleteSkill(skillId);
      setToast({ message: 'Skill removed', type: 'success' });
      loadProfile();
    } catch (error: any) {
      setToast({ message: sanitizeError(error), type: 'error' });
    }
  };

  // Education
  const handleEducationSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingEducation) {
        await profileAPI.updateEducation(editingEducation.id!, educationForm);
        setToast({ message: 'Education updated', type: 'success' });
      } else {
        await profileAPI.addEducation(educationForm);
        setToast({ message: 'Education added', type: 'success' });
      }
      setShowEducationForm(false);
      setEditingEducation(null);
      setEducationForm({ institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', is_current: false });
      loadProfile();
    } catch (error: any) {
      setToast({ message: sanitizeError(error), type: 'error' });
    }
  };

  const handleEditEducation = (edu: Education) => {
    setEditingEducation(edu);
    setEducationForm({
      institution: edu.institution,
      degree: edu.degree,
      field_of_study: edu.field_of_study,
      start_date: edu.start_date,
      end_date: edu.end_date || '',
      is_current: edu.is_current,
    });
    setShowEducationForm(true);
  };

  const handleDeleteEducation = async (eduId: string) => {
    if (!window.confirm('Delete this education entry?')) return;
    try {
      await profileAPI.deleteEducation(eduId);
      setToast({ message: 'Education removed', type: 'success' });
      loadProfile();
    } catch (error: any) {
      setToast({ message: sanitizeError(error), type: 'error' });
    }
  };

  // Work History
  const handleWorkSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingWork) {
        await profileAPI.updateWorkHistory(editingWork.id!, workForm);
        setToast({ message: 'Work history updated', type: 'success' });
      } else {
        await profileAPI.addWorkHistory(workForm);
        setToast({ message: 'Work history added', type: 'success' });
      }
      setShowWorkForm(false);
      setEditingWork(null);
      setWorkForm({ company: '', position: '', start_date: '', end_date: null, is_current: false, description: '', location: '' });
      loadProfile();
    } catch (error: any) {
      setToast({ message: sanitizeError(error), type: 'error' });
    }
  };

  const handleEditWork = (work: WorkHistory) => {
    setEditingWork(work);
    setWorkForm({
      company: work.company,
      position: work.position,
      start_date: work.start_date,
      end_date: work.end_date || null,
      is_current: work.is_current,
      description: work.description || '',
      location: work.location || '',
    });
    setShowWorkForm(true);
  };

  const handleDeleteWork = async (workId: string) => {
    if (!window.confirm('Delete this work history entry?')) return;
    try {
      await profileAPI.deleteWorkHistory(workId);
      setToast({ message: 'Work history removed', type: 'success' });
      loadProfile();
    } catch (error: any) {
      setToast({ message: sanitizeError(error), type: 'error' });
    }
  };

  // Portfolio
  const handlePortfolioSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingPortfolio) {
        await profileAPI.updatePortfolio(editingPortfolio.id!, portfolioForm);
        setToast({ message: 'Portfolio updated', type: 'success' });
      } else {
        await profileAPI.addPortfolio(portfolioForm);
        setToast({ message: 'Portfolio added', type: 'success' });
      }
      setShowPortfolioForm(false);
      setEditingPortfolio(null);
      setPortfolioForm({ title: '', description: '', url: '' });
      loadProfile();
    } catch (error: any) {
      setToast({ message: sanitizeError(error), type: 'error' });
    }
  };

  const handleEditPortfolio = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
    setPortfolioForm({
      title: portfolio.title,
      description: portfolio.description || '',
      url: portfolio.url,
    });
    setShowPortfolioForm(true);
  };

  const handleDeletePortfolio = async (portfolioId: string) => {
    if (!window.confirm('Delete this portfolio item?')) return;
    try {
      await profileAPI.deletePortfolio(portfolioId);
      setToast({ message: 'Portfolio removed', type: 'success' });
      loadProfile();
    } catch (error: any) {
      setToast({ message: sanitizeError(error), type: 'error' });
    }
  };

  // Social Links
  const handleSocialSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingSocial) {
        await profileAPI.updateSocialLink(editingSocial.id!, socialForm);
        setToast({ message: 'Social link updated', type: 'success' });
      } else {
        await profileAPI.addSocialLink(socialForm);
        setToast({ message: 'Social link added', type: 'success' });
      }
      setShowSocialForm(false);
      setEditingSocial(null);
      setSocialForm({ platform: '', url: '', is_public: true });
      loadProfile();
    } catch (error: any) {
      setToast({ message: sanitizeError(error), type: 'error' });
    }
  };

  const handleEditSocial = (link: SocialLink) => {
    setEditingSocial(link);
    setSocialForm({
      platform: link.platform,
      url: link.url,
      is_public: link.is_public,
    });
    setShowSocialForm(true);
  };

  const handleDeleteSocial = async (linkId: string) => {
    if (!window.confirm('Delete this social link?')) return;
    try {
      await profileAPI.deleteSocialLink(linkId);
      setToast({ message: 'Social link removed', type: 'success' });
      loadProfile();
    } catch (error: any) {
      setToast({ message: sanitizeError(error), type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-900"></div>
        <p className="mt-4 text-sm text-neutral-500">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">Failed to load profile</p>
      </div>
    );
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'skills', label: 'Skills' },
    { key: 'education', label: 'Education' },
    { key: 'work', label: 'Work History' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'social', label: 'Social Links' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-3xl font-light text-neutral-900 mb-2">My Profile</h1>
        <p className="text-neutral-500">Manage your profile information</p>
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

      {/* Tab 1: Basic Info */}
      {activeTab === 'basic' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-neutral-900">Basic Information</h2>
            {!editingBasic && (
              <button
                onClick={() => {
                  setEditingBasic(true);
                  setBasicForm({
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    phone_number: profile.phone_number,
                    bio: profile.bio,
                  });
                }}
                className="text-sm font-medium text-neutral-900 hover:underline"
              >
                Edit
              </button>
            )}
          </div>

          {editingBasic ? (
            <form onSubmit={handleBasicUpdate} className="space-y-4">
              <div className="flex items-center gap-6 mb-4">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center text-2xl font-light text-neutral-500">
                    {profile.profile_picture ? (
                      <img src={profile.profile_picture} alt="" className="w-full h-full object-cover" />
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
                  <p className="text-sm text-neutral-500">Profile Picture</p>
                  <p className="text-xs text-neutral-400">Click to upload (JPG, PNG, max 2MB)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={basicForm.first_name || ''}
                    onChange={(e) => setBasicForm({ ...basicForm, first_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={basicForm.last_name || ''}
                    onChange={(e) => setBasicForm({ ...basicForm, last_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-500"
                  />
                  <p className="text-xs text-neutral-400 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={basicForm.phone_number || ''}
                    onChange={(e) => setBasicForm({ ...basicForm, phone_number: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Bio</label>
                <textarea
                  rows={4}
                  value={basicForm.bio || ''}
                  onChange={(e) => setBasicForm({ ...basicForm, bio: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBasic(false)}
                  className="px-5 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-neutral-500 mb-1">First Name</dt>
                <dd className="font-medium text-neutral-900">{profile.first_name || '—'}</dd>
              </div>
              <div>
                <dt className="text-neutral-500 mb-1">Last Name</dt>
                <dd className="font-medium text-neutral-900">{profile.last_name || '—'}</dd>
              </div>
              <div>
                <dt className="text-neutral-500 mb-1">Email</dt>
                <dd className="font-medium text-neutral-900">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-neutral-500 mb-1">Phone Number</dt>
                <dd className="font-medium text-neutral-900">{profile.phone_number || '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-neutral-500 mb-1">Bio</dt>
                <dd className="font-medium text-neutral-900">{profile.bio || '—'}</dd>
              </div>
            </dl>
          )}
        </div>
      )}

      {/* Tab 2: Skills */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-neutral-900">Skills</h2>
            <button
              onClick={() => {
                setShowSkillForm(!showSkillForm);
                setEditingSkill(null);
                setSkillForm({ name: '', level: 'beginner', years_of_experience: 0 });
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800"
            >
              + Add Skill
            </button>
          </div>

          {showSkillForm && (
            <form onSubmit={handleSkillSubmit} className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
              <h3 className="text-md font-medium text-neutral-900">{editingSkill ? 'Edit Skill' : 'Add Skill'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Skill Name</label>
                  <input
                    type="text"
                    required
                    value={skillForm.name}
                    onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Level</label>
                  <select
                    value={skillForm.level}
                    onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value as Skill['level'] })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Years of Experience</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    required
                    value={skillForm.years_of_experience}
                    onChange={(e) => setSkillForm({ ...skillForm, years_of_experience: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800">
                  {editingSkill ? 'Update Skill' : 'Add Skill'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSkillForm(false);
                    setEditingSkill(null);
                  }}
                  className="px-5 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {(!profile.skills || profile.skills.length === 0) ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <p className="text-sm text-neutral-500">No skills added yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {profile.skills.map((skill) => (
                <div key={skill.id} className="bg-white rounded-lg border border-neutral-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 text-sm mb-1">{skill.name}</p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${
                            skill.level === 'expert'
                              ? 'bg-purple-50 text-purple-700'
                              : skill.level === 'advanced'
                              ? 'bg-blue-50 text-blue-700'
                              : skill.level === 'intermediate'
                              ? 'bg-yellow-50 text-yellow-700'
                              : 'bg-neutral-50 text-neutral-700'
                          }`}
                        >
                          {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                        </span>
                        <span className="text-xs text-neutral-500">{skill.years_of_experience}y exp</span>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleEditSkill(skill)}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(skill.id!)}
                        className="text-neutral-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Education */}
      {activeTab === 'education' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-neutral-900">Education</h2>
            <button
              onClick={() => {
                setShowEducationForm(!showEducationForm);
                setEditingEducation(null);
                setEducationForm({ institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', is_current: false });
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800"
            >
              + Add Education
            </button>
          </div>

          {showEducationForm && (
            <form onSubmit={handleEducationSubmit} className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
              <h3 className="text-md font-medium text-neutral-900">{editingEducation ? 'Edit Education' : 'Add Education'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Institution</label>
                  <input
                    type="text"
                    required
                    value={educationForm.institution}
                    onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Degree</label>
                  <input
                    type="text"
                    required
                    value={educationForm.degree}
                    onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Field of Study</label>
                  <input
                    type="text"
                    required
                    value={educationForm.field_of_study}
                    onChange={(e) => setEducationForm({ ...educationForm, field_of_study: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={educationForm.start_date}
                    onChange={(e) => setEducationForm({ ...educationForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={educationForm.end_date}
                    onChange={(e) => setEducationForm({ ...educationForm, end_date: e.target.value, is_current: false })}
                    disabled={educationForm.is_current}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:bg-neutral-50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={educationForm.is_current}
                      onChange={(e) => setEducationForm({ ...educationForm, is_current: e.target.checked, end_date: '' })}
                      className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                    />
                    <span className="text-sm text-neutral-700">Currently studying here</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800">
                  {editingEducation ? 'Update Education' : 'Add Education'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEducationForm(false);
                    setEditingEducation(null);
                  }}
                  className="px-5 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {(!profile.education || profile.education.length === 0) ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <p className="text-sm text-neutral-500">No education entries yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.education.map((edu) => (
                <div key={edu.id} className="bg-white rounded-xl border border-neutral-200 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-900">{edu.degree} in {edu.field_of_study}</h3>
                      <p className="text-sm text-neutral-600 mt-1">{edu.institution}</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {edu.start_date} — {edu.is_current ? 'Present' : edu.end_date}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditEducation(edu)}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteEducation(edu.id!)}
                        className="text-neutral-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Work History */}
      {activeTab === 'work' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-neutral-900">Work History</h2>
            <button
              onClick={() => {
                setShowWorkForm(!showWorkForm);
                setEditingWork(null);
                setWorkForm({ company: '', position: '', start_date: '', end_date: null, is_current: false, description: '', location: '' });
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800"
            >
              + Add Experience
            </button>
          </div>

          {showWorkForm && (
            <form onSubmit={handleWorkSubmit} className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
              <h3 className="text-md font-medium text-neutral-900">{editingWork ? 'Edit Work History' : 'Add Work History'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Company</label>
                  <input
                    type="text"
                    required
                    value={workForm.company}
                    onChange={(e) => setWorkForm({ ...workForm, company: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Position</label>
                  <input
                    type="text"
                    required
                    value={workForm.position}
                    onChange={(e) => setWorkForm({ ...workForm, position: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Location</label>
                  <input
                    type="text"
                    value={workForm.location}
                    onChange={(e) => setWorkForm({ ...workForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={workForm.start_date}
                    onChange={(e) => setWorkForm({ ...workForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={workForm.end_date || ''}
                    onChange={(e) => setWorkForm({ ...workForm, end_date: e.target.value || null, is_current: false })}
                    disabled={workForm.is_current}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:bg-neutral-50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={workForm.is_current}
                      onChange={(e) => setWorkForm({ ...workForm, is_current: e.target.checked, end_date: null })}
                      className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                    />
                    <span className="text-sm text-neutral-700">I currently work here</span>
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={workForm.description}
                    onChange={(e) => setWorkForm({ ...workForm, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800">
                  {editingWork ? 'Update Work History' : 'Add Work History'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowWorkForm(false);
                    setEditingWork(null);
                  }}
                  className="px-5 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {(!profile.work_history || profile.work_history.length === 0) ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <p className="text-sm text-neutral-500">No work history entries yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.work_history.map((work) => (
                <div key={work.id} className="bg-white rounded-xl border border-neutral-200 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-900">{work.position}</h3>
                      <p className="text-sm text-neutral-600 mt-1">
                        {work.company}{work.location ? ` • ${work.location}` : ''}
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {work.start_date} — {work.is_current ? 'Present' : work.end_date || 'N/A'}
                      </p>
                      {work.description && (
                        <p className="text-sm text-neutral-500 mt-2">{work.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditWork(work)}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteWork(work.id!)}
                        className="text-neutral-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Portfolio */}
      {activeTab === 'portfolio' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-neutral-900">Portfolio</h2>
            <button
              onClick={() => {
                setShowPortfolioForm(!showPortfolioForm);
                setEditingPortfolio(null);
                setPortfolioForm({ title: '', description: '', url: '' });
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800"
            >
              + Add Project
            </button>
          </div>

          {showPortfolioForm && (
            <form onSubmit={handlePortfolioSubmit} className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
              <h3 className="text-md font-medium text-neutral-900">{editingPortfolio ? 'Edit Portfolio' : 'Add Portfolio'}</h3>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">URL</label>
                <input
                  type="url"
                  required
                  value={portfolioForm.url}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, url: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
                <textarea
                  rows={4}
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800">
                  {editingPortfolio ? 'Update Portfolio' : 'Add Portfolio'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPortfolioForm(false);
                    setEditingPortfolio(null);
                  }}
                  className="px-5 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {(!profile.portfolio || profile.portfolio.length === 0) ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <p className="text-sm text-neutral-500">No portfolio items yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.portfolio.map((item: Portfolio) => (
                <div key={item.id} className="bg-white rounded-xl border border-neutral-200 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-900 mb-1">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-neutral-600 mb-2">{item.description}</p>
                      )}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        View Project
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditPortfolio(item)}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeletePortfolio(item.id!)}
                        className="text-neutral-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Social Links */}
      {activeTab === 'social' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-neutral-900">Social Links</h2>
            <button
              onClick={() => {
                setShowSocialForm(!showSocialForm);
                setEditingSocial(null);
                setSocialForm({ platform: '', url: '', is_public: true });
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800"
            >
              + Add Link
            </button>
          </div>

          {showSocialForm && (
            <form onSubmit={handleSocialSubmit} className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
              <h3 className="text-md font-medium text-neutral-900">{editingSocial ? 'Edit Social Link' : 'Add Social Link'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Platform</label>
                  <select
                    required
                    value={socialForm.platform}
                    onChange={(e) => setSocialForm({ ...socialForm, platform: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    <option value="">Select platform</option>
                    <option value="github">GitHub</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter</option>
                    <option value="website">Website</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">URL</label>
                  <input
                    type="url"
                    required
                    value={socialForm.url}
                    onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    placeholder="https://..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={socialForm.is_public}
                      onChange={(e) => setSocialForm({ ...socialForm, is_public: e.target.checked })}
                      className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                    />
                    <span className="text-sm text-neutral-700">Make this link public</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800">
                  {editingSocial ? 'Update Link' : 'Add Link'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSocialForm(false);
                    setEditingSocial(null);
                  }}
                  className="px-5 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {(!profile.social_links || profile.social_links.length === 0) ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <p className="text-sm text-neutral-500">No social links yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.social_links.map((link) => (
                <div key={link.id} className="bg-white rounded-lg border border-neutral-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 text-sm capitalize mb-1">{link.platform}</p>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {link.url}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded ${link.is_public ? 'bg-green-50 text-green-700' : 'bg-neutral-50 text-neutral-700'}`}>
                        {link.is_public ? 'Public' : 'Private'}
                      </span>
                      <button
                        onClick={() => handleEditSocial(link)}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteSocial(link.id!)}
                        className="text-neutral-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;
