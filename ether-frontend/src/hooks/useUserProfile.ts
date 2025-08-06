import { useState } from 'react';
import { getUserByWallet, upsertUser, UserInfo } from '../lib/supabase/user';

export function useUserProfile() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user info by wallet address
  const fetchUser = async (wallet_address: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserByWallet(wallet_address);
      setUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create or update user info
  const saveUser = async (userInfo: UserInfo) => {
    setLoading(true);
    setError(null);
    try {
      const data = await upsertUser(userInfo);
      setUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, fetchUser, saveUser };
}
