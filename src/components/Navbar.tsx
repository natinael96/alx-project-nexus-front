import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useNotificationsStore from '../stores/notificationsStore';
import { useEffect } from 'react';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationsStore();

  const authenticated = isAuthenticated();

  useEffect(() => {
    if (authenticated) {
      fetchNotifications({ is_read: false, page_size: 1 });
    }
  }, [authenticated, fetchNotifications]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-[100] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-light text-neutral-900 hover:text-neutral-700 transition-colors">
              JobBoard
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/jobs"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Jobs
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {authenticated ? (
              <>
                <div className="flex items-center space-x-4">
                  {user?.role === 'admin' ? (
                      <>
                        <Link
                          to="/admin-panel/dashboard"
                          className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/admin-panel/users"
                          className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                          Users
                        </Link>
                        <Link
                          to="/"
                          className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                          Jobs
                        </Link>
                        <Link
                          to="/notifications"
                          className="relative text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          {unreadCount > 0 && (
                            <span className="absolute -top-1.5 -right-3 bg-neutral-900 text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </Link>
                        <div className="relative group">
                          <button className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-500">
                              {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="py-1">
                              <Link to="/admin-panel/dashboard" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Statistics</Link>
                              <Link to="/admin-panel/audit" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Audit Logs</Link>
                              <Link to="/employer/export" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Export</Link>
                              <Link to="/settings" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Settings</Link>
                              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Logout</button>
                            </div>
                          </div>
                        </div>
                      </>
                  ) : user?.role === 'employer' ? (
                      <>
                        <Link
                          to="/employer/dashboard"
                          className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/employer/jobs"
                          className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                          My Jobs
                        </Link>
                        <Link
                          to="/employer/jobs/new"
                          className="px-4 py-1.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
                        >
                          Post Job
                        </Link>
                        <Link
                          to="/notifications"
                          className="relative text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          {unreadCount > 0 && (
                            <span className="absolute -top-1.5 -right-3 bg-neutral-900 text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </Link>
                        <div className="relative group">
                          <button className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-500">
                              {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="py-1">
                              <Link to="/profile" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Profile</Link>
                              <Link to="/employer/export" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Export</Link>
                              <Link to="/settings" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Settings</Link>
                              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Logout</button>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/dashboard"
                          className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/applications"
                          className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                          My Applications
                        </Link>
                        <Link
                          to="/notifications"
                          className="relative text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          {unreadCount > 0 && (
                            <span className="absolute -top-1.5 -right-3 bg-neutral-900 text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </Link>
                        <div className="relative group">
                          <button className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-500">
                              {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="py-1">
                              <Link to="/profile" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Profile</Link>
                              <Link to="/saved-jobs" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Saved Jobs</Link>
                              <Link to="/settings" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Settings</Link>
                              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Logout</button>
                            </div>
                          </div>
                        </div>
                  </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
