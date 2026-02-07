import { useEffect, useState } from 'react';
import useNotificationsStore from '../stores/notificationsStore';
import type { NotificationFilters } from '../types';
import Toast from './Toast';

function Notifications() {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationsStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const params: NotificationFilters = {};
    if (filter === 'unread') params.is_read = false;
    if (filter === 'read') params.is_read = true;
    fetchNotifications(params);
  }, [filter, fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    const result = await markAsRead(notificationId);
    if (result.success) {
      const params: NotificationFilters = {};
      if (filter === 'unread') params.is_read = false;
      if (filter === 'read') params.is_read = true;
      fetchNotifications(params);
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllAsRead();
    if (result.success) {
      setToast({ message: 'All notifications marked as read', type: 'success' });
      fetchNotifications(filter === 'unread' ? { is_read: false } : {});
    } else {
      setToast({ message: 'Failed to mark all as read', type: 'error' });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const priorityDot: Record<string, string> = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-neutral-400',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-neutral-900 mb-2">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-neutral-500">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm font-medium text-neutral-900 hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2 border-b border-neutral-200">
        {(['all', 'unread', 'read'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
              filter === tab
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 border border-red-100 p-4">
          <p className="text-sm text-red-700">{typeof error === 'string' ? error : 'An error occurred'}</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-12 h-12 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-neutral-500">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 p-4 rounded-lg transition-all cursor-pointer ${
                notification.is_read
                  ? 'bg-white hover:bg-neutral-50'
                  : 'bg-neutral-50 hover:bg-neutral-100'
              }`}
              onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
            >
              <div className="mt-1.5 shrink-0">
                <span className={`block w-2 h-2 rounded-full ${priorityDot[notification.priority] || priorityDot.low}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className={`text-sm ${
                      notification.is_read ? 'text-neutral-600' : 'font-medium text-neutral-900'
                    }`}
                  >
                    {notification.title}
                  </h3>
                  <span className="text-xs text-neutral-400 shrink-0">
                    {formatDate(notification.created_at)}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 mt-0.5">{notification.message}</p>
                <span className="inline-block mt-1.5 text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                  {notification.notification_type.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
