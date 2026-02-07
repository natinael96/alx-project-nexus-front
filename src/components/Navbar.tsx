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
    <nav className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-light text-neutral-900 hover:text-neutral-700 transition-colors">
              JobBoard
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Jobs
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {authenticated ? (
              <>
                {user && (
                  <div className="flex items-center space-x-4">
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                      >
                        Admin
                      </Link>
                    )}
                    <Link
                      to="/applications"
                      className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      Applications
                    </Link>
                    <Link
                      to="/notifications"
                      className="relative text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      Notifications
                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-3 bg-neutral-900 text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/profile"
                      className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      {user.username}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
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
