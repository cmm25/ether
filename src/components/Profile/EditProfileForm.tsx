"use client";
import React, { useState, useEffect } from 'react';
import { ProfileFormData, ValidationErrors, UserProfile } from '@/types/profile';
import { validateProfileForm, sanitizeUrl, sanitizeSocialHandle } from '@/utils/profileValidation';
import FormField from './FormField';
import SocialLinkField from './SocialLinkField';
import AvatarUpload from './AvatarUpload';
import PreferenceToggle from './PreferenceToggle';
import { getUserProfile, upsertUserProfile, uploadAvatar } from '../../lib/supabase/user';

interface EditProfileFormProps {
  walletAddress: string;
  onCancel?: () => void;
  onSaved?: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ walletAddress, onCancel, onSaved }) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    bio: '',
    website: '',
    twitter: '',
    instagram: '',
    discord: '',
    location: '',
    preferences: {
      emailNotifications: true,
      marketingEmails: false,
      publicProfile: true,
      showWalletAddress: false,
    },
  });
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState<'basic' | 'social' | 'preferences'>('basic');

  // Fetch user profile on mount or wallet change
  useEffect(() => {
    if (!walletAddress) return;
    setLoading(true);
    getUserProfile(walletAddress)
      .then((profile) => {
        if (profile) {
          setFormData({
            username: profile.username || '',
            email: profile.email || '',
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            bio: profile.bio || '',
            website: profile.website || '',
            twitter: profile.twitter || '',
            instagram: profile.instagram || '',
            discord: profile.discord || '',
            location: profile.location || '',
            preferences: profile.preferences || {
              emailNotifications: true,
              marketingEmails: false,
              publicProfile: true,
              showWalletAddress: false,
            },
          });
          setAvatarUrl(profile.avatar || '');
        }
      })
      .finally(() => setLoading(false));
  }, [walletAddress]);

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [formData, avatarFile]);

  const updateField = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updatePreference = (key: keyof ProfileFormData['preferences'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    // Validate form
    const validationErrors = validateProfileForm({ ...formData, email: formData.email, username: formData.username });
    if (!formData.email) validationErrors.email = 'Email is required';
    if (!formData.username) validationErrors.username = 'Username is required';
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setLoading(false);
      return;
    }
    // Sanitize data
    const sanitizedData = {
      ...formData,
      website: sanitizeUrl(formData.website || ''),
      twitter: sanitizeSocialHandle(formData.twitter || '', 'twitter'),
      instagram: sanitizeSocialHandle(formData.instagram || '', 'instagram'),
    };
    let avatar = avatarUrl;
    try {
      if (avatarFile) {
        avatar = await uploadAvatar(walletAddress, avatarFile);
        setAvatarUrl(avatar);
      }
      await upsertUserProfile(walletAddress, { ...sanitizedData, avatar });
      setHasChanges(false);
      console.log('Profile saved successfully!');
      onSaved?.(); // Notify parent component
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setErrors({ form: error.message || 'Failed to save profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: '👤' },
    { id: 'social', label: 'Social Links', icon: '🔗' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  ] as const;

  if (!walletAddress) {
    return <div className="max-w-4xl mx-auto p-8 text-center text-gray-300">Connect your wallet to edit your profile.</div>;
  }
  if (loading) {
    return <div className="max-w-4xl mx-auto p-8 text-center text-gray-300">Loading profile...</div>;
  }
  return (
    <div className="max-w-4xl mx-auto bg-[#121212] rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
        <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
        <p className="text-purple-100 mt-1">Update your profile information and preferences</p>
      </div>
      {/* Navigation Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex px-8">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`
                flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                ${activeSection === section.id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
                }
              `}
            >
              <span>{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>
      </div>
      <form onSubmit={handleSubmit} className="p-8">
        {/* Basic Information */}
        {activeSection === 'basic' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
            <AvatarUpload
              currentAvatar={avatarUrl}
              onAvatarChange={setAvatarFile}
              error={errors.avatar}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Wallet Address"
                name="walletAddress"
                value={walletAddress}
                onChange={() => {}}
                error={''}
                disabled
              />
              <FormField
                label="Username"
                name="username"
                value={formData.username}
                onChange={(value) => updateField('username', value)}
                error={errors.username}
                placeholder="Enter your username"
                required
                maxLength={20}
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(value) => updateField('email', value)}
                error={errors.email}
                placeholder="Enter your email"
                required
              />
              <FormField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={(value) => updateField('firstName', value)}
                error={errors.firstName}
                placeholder="Enter your first name"
                maxLength={50}
              />
              <FormField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={(value) => updateField('lastName', value)}
                error={errors.lastName}
                placeholder="Enter your last name"
                maxLength={50}
              />
              <FormField
                label="Location"
                name="location"
                value={formData.location || ''}
                onChange={(value) => updateField('location', value)}
                error={errors.location}
                placeholder="City, Country"
                maxLength={100}
              />
            </div>
            <FormField
              label="Bio"
              name="bio"
              type="textarea"
              value={formData.bio}
              onChange={(value) => updateField('bio', value)}
              error={errors.bio}
              placeholder="Tell us about yourself..."
              maxLength={500}
            />
          </div>
        )}
        {/* Social Links */}
        {activeSection === 'social' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6">Social Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SocialLinkField
                platform="website"
                value={formData.website || ''}
                onChange={(value) => updateField('website', value)}
                error={errors.website}
              />
              <SocialLinkField
                platform="twitter"
                value={formData.twitter || ''}
                onChange={(value) => updateField('twitter', value)}
                error={errors.twitter}
              />
              <SocialLinkField
                platform="instagram"
                value={formData.instagram || ''}
                onChange={(value) => updateField('instagram', value)}
                error={errors.instagram}
              />
              <SocialLinkField
                platform="discord"
                value={formData.discord || ''}
                onChange={(value) => updateField('discord', value)}
                error={errors.discord}
              />
            </div>
          </div>
        )}
        {/* Preferences */}
        {activeSection === 'preferences' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6">Privacy & Preferences</h2>
            <div className="bg-[#1a1a1a] rounded-xl p-6 space-y-1">
              <PreferenceToggle
                label="Email Notifications"
                description="Receive notifications about your account activity"
                checked={formData.preferences.emailNotifications}
                onChange={(checked) => updatePreference('emailNotifications', checked)}
              />
              <PreferenceToggle
                label="Marketing Emails"
                description="Receive updates about new features and promotions"
                checked={formData.preferences.marketingEmails}
                onChange={(checked) => updatePreference('marketingEmails', checked)}
              />
              <PreferenceToggle
                label="Public Profile"
                description="Make your profile visible to other users"
                checked={formData.preferences.publicProfile}
                onChange={(checked) => updatePreference('publicProfile', checked)}
              />
              <PreferenceToggle
                label="Show Wallet Address"
                description="Display your wallet address on your public profile"
                checked={formData.preferences.showWalletAddress}
                onChange={(checked) => updatePreference('showWalletAddress', checked)}
              />
            </div>
          </div>
        )}
        {/* Form Actions */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {hasChanges && (
              <>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>You have unsaved changes</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !hasChanges}
              className="
                px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl
                hover:from-purple-700 hover:to-indigo-700 transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
                flex items-center gap-2
              "
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        {errors.form && <div className="text-red-400 mt-4">{errors.form}</div>}
      </form>
    </div>
  );
};

export default EditProfileForm;
