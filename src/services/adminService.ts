import { supabase } from '@/integrations/supabase/client';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'moderator';
  created_at: string;
}

export interface AdminInvite {
  id: string;
  email: string;
  role: 'admin' | 'moderator';
  invited_by: string | null;
  expires_at: string;
  created_at: string;
  used_at: string | null;
  token: string;
}

export interface PrayerTopic {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const checkAdminAccess = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data, error } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();
    
  return !!data;
};

export const checkIsAdmin = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .single();
    
  return !!data;
};

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const { data, error } = await supabase
    .from('admin_roles')
    .select(`
      user_id as id,
      role,
      created_at,
      profiles:profiles!inner(
        email
      )
    `)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  return data.map(admin => ({
    id: admin.id,
    email: admin.profiles?.email || 'Unknown',
    role: admin.role,
    created_at: admin.created_at
  }));
};

export const createAdminInvite = async (email: string, role: 'admin' | 'moderator'): Promise<{ data?: AdminInvite; error?: any }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const token = await generateRandomToken(32);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
  
  const { data, error } = await supabase
    .from('admin_invites')
    .insert([
      {
        email,
        role,
        invited_by: user.id,
        token,
        expires_at: expiresAt.toISOString()
      }
    ])
    .select()
    .single();
    
  if (error) return { error };
  
  // In a real app, you would send an email with the invite link
  console.log('Invite link:', `${window.location.origin}/admin/accept-invite?token=${token}`);
  
  return { data };
};

export const getPrayerTopics = async (): Promise<PrayerTopic[]> => {
  const { data, error } = await supabase
    .from('prayer_topics')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

export const createPrayerTopic = async (topic: Omit<PrayerTopic, 'id' | 'created_by' | 'created_at' | 'updated_at'>): Promise<PrayerTopic> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('prayer_topics')
    .insert([{ ...topic, created_by: user.id }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updatePrayerTopic = async (id: string, updates: Partial<PrayerTopic>): Promise<PrayerTopic> => {
  const { data, error } = await supabase
    .from('prayer_topics')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

const generateRandomToken = async (length: number): Promise<string> => {
  const { data, error } = await supabase.rpc('generate_random_token', { length });
  if (error) throw error;
  return data;
};
