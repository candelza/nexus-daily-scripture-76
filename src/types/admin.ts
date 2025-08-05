// Admin-related types
export type AdminRoleType = 'admin' | 'moderator';
export type UserRole = 'user' | AdminRoleType;

export interface AdminInvite {
  id: string;
  email: string;
  role: AdminRoleType;
  token: string;
  invited_by: string | null;
  expires_at: string;
  created_at: string;
  used_at: string | null;
}

export interface AdminRole {
  id: string;
  user_id: string;
  role: AdminRoleType;
  created_at: string;
}

// Supabase database types
export interface Database {
  public: {
    Tables: {
      admin_invites: {
        Row: AdminInvite;
        Insert: Omit<AdminInvite, 'id' | 'created_at'>;
        Update: Partial<Omit<AdminInvite, 'id' | 'created_at'>>;
      };
      admin_roles: {
        Row: AdminRole;
        Insert: Omit<AdminRole, 'id' | 'created_at'>;
        Update: Partial<Omit<AdminRole, 'id' | 'created_at'>>;
      };
      // Add other tables as needed
    };
    Views: {
      // Add views if needed
      [key: string]: any;
    };
    Functions: {
      // Add functions if needed
      [key: string]: any;
    };
  };
}
