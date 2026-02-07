/**
 * Input validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

// Validate registration data
export const validateRegistration = (data: {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}): ValidationResult => {
  const errors: Record<string, string[]> = {};

  // Username validation
  if (!data.username || data.username.trim().length === 0) {
    errors.username = ['Username is required'];
  } else if (data.username.length < 3) {
    errors.username = ['Username must be at least 3 characters long'];
  } else if (data.username.length > 30) {
    errors.username = ['Username must be less than 30 characters'];
  } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
    errors.username = ['Username can only contain letters, numbers, and underscores'];
  }

  // Email validation
  if (!data.email || data.email.trim().length === 0) {
    errors.email = ['Email is required'];
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = ['Please enter a valid email address'];
  }

  // Password validation
  if (!data.password || data.password.length === 0) {
    errors.password = ['Password is required'];
  } else if (data.password.length < 8) {
    errors.password = ['Password must be at least 8 characters long'];
  }

  // Password confirmation
  if (!data.password2 || data.password2.length === 0) {
    errors.password2 = ['Please confirm your password'];
  } else if (data.password !== data.password2) {
    errors.password2 = ['Passwords do not match'];
  }

  // Optional fields validation
  if (data.first_name && data.first_name.length > 50) {
    errors.first_name = ['First name must be less than 50 characters'];
  }

  if (data.last_name && data.last_name.length > 50) {
    errors.last_name = ['Last name must be less than 50 characters'];
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate job application
export const validateApplication = (data: {
  cover_letter: string;
  resume: File | null;
}): ValidationResult => {
  const errors: Record<string, string[]> = {};

  if (!data.cover_letter || data.cover_letter.trim().length === 0) {
    errors.cover_letter = ['Cover letter is required'];
  } else if (data.cover_letter.length < 50) {
    errors.cover_letter = ['Cover letter must be at least 50 characters long'];
  } else if (data.cover_letter.length > 5000) {
    errors.cover_letter = ['Cover letter must be less than 5000 characters'];
  }

  if (!data.resume) {
    errors.resume = ['Resume is required'];
  } else {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (data.resume.size > maxSize) {
      errors.resume = ['Resume file size must be less than 5MB'];
    }

    if (!allowedTypes.includes(data.resume.type) && !allowedExtensions.includes(data.resume.name.split('.').pop()?.toLowerCase() || '')) {
      errors.resume = ['Resume must be a PDF, DOC, or DOCX file'];
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate job creation/update
export const validateJob = (data: {
  title: string;
  description: string;
  location: string;
  job_type: string;
  category?: string;
  salary_min?: string;
  salary_max?: string;
}): ValidationResult => {
  const errors: Record<string, string[]> = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = ['Job title is required'];
  } else if (data.title.length > 200) {
    errors.title = ['Job title must be less than 200 characters'];
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.description = ['Job description is required'];
  } else if (data.description.length < 50) {
    errors.description = ['Job description must be at least 50 characters long'];
  }

  if (!data.location || data.location.trim().length === 0) {
    errors.location = ['Location is required'];
  }

  if (!data.job_type || !['full-time', 'part-time', 'contract', 'internship', 'freelance'].includes(data.job_type)) {
    errors.job_type = ['Please select a valid job type'];
  }

  if (data.salary_min && data.salary_max) {
    const min = parseFloat(data.salary_min);
    const max = parseFloat(data.salary_max);
    if (min > max) {
      errors.salary_max = ['Maximum salary must be greater than minimum salary'];
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Sanitize string input
export const sanitizeString = (input: string, maxLength?: number): string => {
  if (typeof input !== 'string') return '';
  
  let sanitized = input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');

  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};
