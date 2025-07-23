// src/lib/validation.ts - Centralized Form Validation
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// 🔍 Generic validation function
export function validateForm(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors[field] = `${getFieldDisplayName(field)} gereklidir`;
      continue;
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) continue;

    // String length validations
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = `${getFieldDisplayName(field)} en az ${rules.minLength} karakter olmalıdır`;
        continue;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = `${getFieldDisplayName(field)} en fazla ${rules.maxLength} karakter olmalıdır`;
        continue;
      }
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      errors[field] = `${getFieldDisplayName(field)} geçerli bir format değil`;
      continue;
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        errors[field] = customError;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Helper to get user-friendly field names
function getFieldDisplayName(field: string): string {
  const fieldNames: Record<string, string> = {
    name: 'Ad',
    email: 'E-posta',
    password: 'Şifre',
    title: 'Başlık',
    description: 'Açıklama',
    meeting_date: 'Toplantı tarihi',
    start_time: 'Başlangıç saati',
    end_time: 'Bitiş saati',
    location: 'Konum',
    club_id: 'Kulüp',
    due_date: 'Bitiş tarihi',
    priority: 'Öncelik',
    status: 'Durum',
    type: 'Tip',
  };

  return fieldNames[field] || field;
}

// 📝 Predefined validation schemas
export const ValidationSchemas = {
  club: {
    name: { required: true, minLength: 2, maxLength: 100 },
    description: { required: true, minLength: 10, maxLength: 500 },
    type: { required: true },
  },

  meeting: {
    title: { required: true, minLength: 3, maxLength: 200 },
    description: { maxLength: 1000 },
    meeting_date: { required: true },
    start_time: { required: true },
    club_id: { required: true },
  },

  task: {
    title: { required: true, minLength: 3, maxLength: 200 },
    description: { maxLength: 1000 },
    due_date: { required: true },
    priority: { required: true },
    club_id: { required: true },
    assigned_to: { required: true },
  },

  file: {
    clubId: { required: true },
    file: { 
      required: true,
      custom: (file: File) => {
        if (!file) return 'Dosya seçilmesi gerekli';
        if (file.size > 10 * 1024 * 1024) return 'Dosya boyutu 10MB\'dan büyük olamaz';
        return null;
      }
    },
  },

  user: {
    name: { required: true, minLength: 2, maxLength: 100 },
    email: { 
      required: true, 
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: { 
      required: true, 
      minLength: 6,
      custom: (password: string) => {
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
          return 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir';
        }
        return null;
      }
    },
  },
};

// 🔧 Utility functions for specific validations
export const ValidationUtils = {
  isEmail: (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  
  isPhoneNumber: (phone: string): boolean => /^(\+90|0)?[5][0-9]{9}$/.test(phone),
  
  isStrongPassword: (password: string): boolean => 
    password.length >= 6 && 
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password),
  
  isValidDate: (date: string): boolean => {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  },
  
  isFutureDate: (date: string): boolean => {
    const d = new Date(date);
    return d > new Date();
  },
  
  isValidTimeFormat: (time: string): boolean => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time),
};

// 🎯 Specific validation functions
export function validateClubData(data: any): ValidationResult {
  return validateForm(data, ValidationSchemas.club);
}

export function validateMeetingData(data: any): ValidationResult {
  const result = validateForm(data, ValidationSchemas.meeting);
  
  // Additional custom validations
  if (data.meeting_date && !ValidationUtils.isFutureDate(data.meeting_date)) {
    result.errors.meeting_date = 'Toplantı tarihi gelecekte olmalıdır';
    result.isValid = false;
  }
  
  if (data.start_time && !ValidationUtils.isValidTimeFormat(data.start_time)) {
    result.errors.start_time = 'Geçerli bir saat formatı giriniz (HH:MM)';
    result.isValid = false;
  }
  
  if (data.end_time && !ValidationUtils.isValidTimeFormat(data.end_time)) {
    result.errors.end_time = 'Geçerli bir saat formatı giriniz (HH:MM)';
    result.isValid = false;
  }
  
  if (data.start_time && data.end_time && data.start_time >= data.end_time) {
    result.errors.end_time = 'Bitiş saati başlangıç saatinden sonra olmalıdır';
    result.isValid = false;
  }
  
  return result;
}

export function validateTaskData(data: any): ValidationResult {
  const result = validateForm(data, ValidationSchemas.task);
  
  // Additional validations
  if (data.due_date && !ValidationUtils.isValidDate(data.due_date)) {
    result.errors.due_date = 'Geçerli bir tarih formatı giriniz';
    result.isValid = false;
  }
  
  return result;
}

export function validateFileData(data: any): ValidationResult {
  return validateForm(data, ValidationSchemas.file);
}

export function validateUserData(data: any): ValidationResult {
  return validateForm(data, ValidationSchemas.user);
}
