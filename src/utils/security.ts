/**
 * Security utilities for the application
 */

// Token storage with security measures
export const tokenStorage = {
  set: (key: string, value: string): void => {
    try {
      // In production, consider using httpOnly cookies instead
      // For now, use sessionStorage for access tokens (cleared on tab close)
      // and localStorage for refresh tokens
      if (key === 'access_token') {
        sessionStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  },

  get: (key: string): string | null => {
    try {
      if (key === 'access_token') {
        return sessionStorage.getItem(key);
      }
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  },

  remove: (key: string): void => {
    try {
      if (key === 'access_token') {
        sessionStorage.removeItem(key);
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  },

  clear: (): void => {
    try {
      sessionStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('access_token'); // Fallback cleanup
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  },
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// File validation
export const validateFile = (
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  }
): { isValid: boolean; error?: string } => {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
    };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: `File extension .${extension} is not allowed`,
      };
    }
  }

  // Check for potentially dangerous file names
  const dangerousPatterns = /[<>:"|?*\x00-\x1f]/;
  if (dangerousPatterns.test(file.name)) {
    return {
      isValid: false,
      error: 'File name contains invalid characters',
    };
  }

  return { isValid: true };
};

// Sanitize error messages (don't expose sensitive information)
export const sanitizeError = (error: any): string => {
  // Timeout / network errors (no response from server)
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return 'The server took too long to respond. It may be starting up — please try again in a moment.';
  }

  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
    return 'Unable to reach the server. Please check your connection and try again.';
  }

  // Don't expose internal error details
  if (error?.response?.status === 500) {
    return 'An internal server error occurred. Please try again later.';
  }

  if (error?.response?.status === 401) {
    return 'Authentication failed. Please check your credentials.';
  }

  if (error?.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }

  if (error?.response?.status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  // Return user-friendly error message
  if (error?.response?.data?.detail) {
    return String(error.response.data.detail);
  }

  if (error?.response?.data) {
    // Handle validation errors
    const data = error.response.data;
    if (typeof data === 'object') {
      const messages: string[] = [];
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          messages.push(`${key}: ${value.join(', ')}`);
        } else if (typeof value === 'string') {
          messages.push(value);
        }
      });
      return messages.join('\n') || 'Validation error occurred';
    }
  }

  if (error?.message) {
    // Don't expose technical error messages in production
    if (import.meta.env.PROD) {
      return 'An error occurred. Please try again.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

// Rate limiting helper (client-side awareness)
// Tracks 429 responses from the server rather than blocking outgoing requests
export const rateLimitHandler = {
  retryAfter: 0, // Timestamp after which requests are allowed again

  /**
   * Check if we should hold off on making a request
   * (only blocks if the server previously told us to back off via 429)
   */
  canMakeRequest: (): boolean => {
    return Date.now() >= rateLimitHandler.retryAfter;
  },

  /**
   * Called when the server responds with 429 Too Many Requests.
   * @param retryAfterSeconds - seconds to wait (from Retry-After header, default 60)
   */
  onRateLimited: (retryAfterSeconds: number = 60): void => {
    rateLimitHandler.retryAfter = Date.now() + retryAfterSeconds * 1000;
  },
};

// XSS Protection: Escape HTML
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// CSRF Token helper (if backend provides CSRF tokens)
export const getCsrfToken = (): string | null => {
  // Get CSRF token from meta tag or cookie if backend provides it
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag ? metaTag.getAttribute('content') : null;
};

// Secure redirect (prevents open redirect vulnerabilities)
export const secureRedirect = (url: string, fallback: string = '/'): void => {
  // Only allow relative URLs or same origin
  try {
    const urlObj = new URL(url, window.location.origin);
    if (urlObj.origin === window.location.origin) {
      window.location.href = url;
    } else {
      window.location.href = fallback;
    }
  } catch {
    // If URL parsing fails, use fallback
    window.location.href = fallback;
  }
};
