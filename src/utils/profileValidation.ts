import { ProfileFormData, ValidationErrors } from '@/types/profile';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const validateUrl = (url: string): boolean => {
  if (!url) return true; // Optional field
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
};

export const validateTwitterHandle = (handle: string): boolean => {
  if (!handle) return true; // Optional field
  const twitterRegex = /^@?[a-zA-Z0-9_]{1,15}$/;
  return twitterRegex.test(handle);
};

export const validateDiscordHandle = (handle: string): boolean => {
  if (!handle) return true; // Optional field
  const discordRegex = /^[a-zA-Z0-9_]{2,32}#[0-9]{4}$|^[a-zA-Z0-9_.]{2,32}$/;
  return discordRegex.test(handle);
};

export const validateInstagramHandle = (handle: string): boolean => {
  if (!handle) return true; // Optional field
  const instagramRegex = /^@?[a-zA-Z0-9_.]{1,30}$/;
  return instagramRegex.test(handle);
};

export const validateProfileForm = (data: ProfileFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Required fields
  if (!data.username.trim()) {
    errors.username = 'Username is required';
  } else if (!validateUsername(data.username)) {
    errors.username = 'Username must be 3-20 characters and contain only letters, numbers, and underscores';
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.firstName.trim()) {
    errors.firstName = 'First name is required';
  } else if (data.firstName.length > 50) {
    errors.firstName = 'First name must be less than 50 characters';
  }

  if (!data.lastName.trim()) {
    errors.lastName = 'Last name is required';
  } else if (data.lastName.length > 50) {
    errors.lastName = 'Last name must be less than 50 characters';
  }

  if (data.bio.length > 500) {
    errors.bio = 'Bio must be less than 500 characters';
  }

  // Optional fields validation
  if (data.website && !validateUrl(data.website)) {
    errors.website = 'Please enter a valid website URL';
  }

  if (data.twitter && !validateTwitterHandle(data.twitter)) {
    errors.twitter = 'Please enter a valid Twitter handle';
  }

  if (data.instagram && !validateInstagramHandle(data.instagram)) {
    errors.instagram = 'Please enter a valid Instagram handle';
  }

  if (data.discord && !validateDiscordHandle(data.discord)) {
    errors.discord = 'Please enter a valid Discord handle';
  }

  if (data.location && data.location.length > 100) {
    errors.location = 'Location must be less than 100 characters';
  }

  return errors;
};

export const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  return url.startsWith('http') ? url : `https://${url}`;
};

export const sanitizeSocialHandle = (handle: string, platform: string): string => {
  if (!handle) return '';
  
  switch (platform) {
    case 'twitter':
    case 'instagram':
      return handle.startsWith('@') ? handle.slice(1) : handle;
    default:
      return handle;
  }
};