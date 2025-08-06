import { supabase } from './supabaseClient';
import { UserProfile, ProfileFormData } from '@/types/profile';

// Map between Supabase row and UserProfile
function mapUserRowToProfile(row: any): UserProfile {
  return {
    id: row.id,
    username: row.username || '',
    email: row.email || '',
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    bio: row.bio || '',
    avatar: row.avatar || '',
    walletAddress: row.wallet_address || '',
    website: row.website || '',
    twitter: row.twitter || '',
    instagram: row.instagram || '',
    discord: row.discord || '',
    location: row.location || '',
    joinedAt: row.joined_at || '',
    isVerified: row.is_verified || false,
    preferences: {
      emailNotifications: row.pref_email_notifications ?? true,
      marketingEmails: row.pref_marketing_emails ?? false,
      publicProfile: row.pref_public_profile ?? true,
      showWalletAddress: row.pref_show_wallet_address ?? false,
    },
  };
}

function mapProfileToUserRow(profile: UserProfile | ProfileFormData & { walletAddress: string, avatar?: string, joinedAt?: string, isVerified?: boolean }) {
  return {
    username: profile.username,
    email: profile.email,
    first_name: profile.firstName,
    last_name: profile.lastName,
    bio: profile.bio,
    avatar: profile.avatar || '',
    wallet_address: profile.walletAddress,
    website: profile.website || '',
    twitter: profile.twitter || '',
    instagram: profile.instagram || '',
    discord: profile.discord || '',
    location: profile.location || '',
    joined_at: profile.joinedAt || undefined,
    is_verified: profile.isVerified || false,
    pref_email_notifications: profile.preferences.emailNotifications,
    pref_marketing_emails: profile.preferences.marketingEmails,
    pref_public_profile: profile.preferences.publicProfile,
    pref_show_wallet_address: profile.preferences.showWalletAddress,
  };
}

// Fetch user profile by wallet address
export async function getUserProfile(walletAddress: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data ? mapUserRowToProfile(data) : null;
}

// Upsert user profile (create or update)
export async function upsertUserProfile(walletAddress: string, form: ProfileFormData & { avatar?: string }) {
  const row = mapProfileToUserRow({ ...form, walletAddress });
  const { data, error } = await supabase
    .from('users')
    .upsert([row], { onConflict: ['wallet_address'] })
    .select();
  if (error) throw error;
  return data?.[0] ? mapUserRowToProfile(data[0]) : null;
}

// Upload avatar image to Supabase Storage and return public URL
export async function uploadAvatar(walletAddress: string, file: File): Promise<string> {
  const filePath = `avatars/${walletAddress}_${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
  if (error) throw error;
  // Get public URL
  const { publicURL } = supabase.storage.from('avatars').getPublicUrl(filePath).data;
  return publicURL;
}
