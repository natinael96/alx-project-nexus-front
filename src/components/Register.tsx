import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { RegisterData } from '../lib/api';
import { validateRegistration, sanitizeString } from '../utils/validation';
import { validatePasswordStrength } from '../utils/security';

function Register() {
  const [formData, setFormData] = useState<Omit<RegisterData, 'password2'> & { confirmPassword: string }>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validate input
    const validation = validateRegistration({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      password2: formData.confirmPassword,
      first_name: formData.first_name,
      last_name: formData.last_name,
    });

    if (!validation.isValid) {
      const errorMessages = Object.entries(validation.errors)
        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
        .join('\n');
      setError(errorMessages);
      return;
    }

    // Check password strength
    const passwordCheck = validatePasswordStrength(formData.password);
    if (!passwordCheck.isValid) {
      setError(`Password requirements:\n${passwordCheck.errors.join('\n')}`);
      return;
    }

    // Sanitize inputs
    const sanitizedData = {
      username: sanitizeString(formData.username),
      email: sanitizeString(formData.email).toLowerCase(),
      password: formData.password, // Don't sanitize password
      password2: formData.confirmPassword,
      first_name: formData.first_name ? sanitizeString(formData.first_name) : undefined,
      last_name: formData.last_name ? sanitizeString(formData.last_name) : undefined,
      role: formData.role,
    };

    const result = await register(sanitizedData);
    
    if (result.success) {
      navigate('/login');
    } else {
      const errorMsg = typeof result.error === 'string' 
        ? result.error 
        : (typeof result.error === 'object' ? JSON.stringify(result.error) : 'Registration failed');
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light text-neutral-900 mb-2">Create account</h1>
          <p className="text-sm text-neutral-500">
            Already have an account?{' '}
            <Link to="/login" className="text-neutral-900 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                <p className="text-sm text-red-700 whitespace-pre-wrap">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">Job Seeker</option>
                <option value="employer">Employer</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
