export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  avatar: string;
  walletAddress: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  discord?: string;
  location?: string;
  joinedAt: string;
  isVerified: boolean;
  preferences: {
    emailNotifications: boolean;
    marketingEmails: boolean;
    publicProfile: boolean;
    showWalletAddress: boolean;
  };
}

export interface ProfileFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  discord?: string;
  location?: string;
  preferences: {
    emailNotifications: boolean;
    marketingEmails: boolean;
    publicProfile: boolean;
    showWalletAddress: boolean;
  };
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'url' | 'textarea';
  maxLength?: number;
  disabled?: boolean;
}

export interface SocialLinkProps {
  platform: 'twitter' | 'instagram' | 'discord' | 'website';
  value: string;
  onChange: (value: string) => void;
  error?: string;
}