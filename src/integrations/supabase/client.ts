// ReadBible Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment variables with fallbacks for ReadBible project
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://sijdfgnypaplxihifwgi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpamRmZ255cGFwbHhpaGlmd2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMzYwODAsImV4cCI6MjA2OTgxMjA4MH0.RBEmlyAtd0qCNABXMwbgeeSASnEx7S2SsnHduYDtnUg";

// Debug logging for deployment troubleshooting
if (typeof window !== 'undefined') {
  console.log('🔌 ReadBible Supabase Configuration:');
  console.log('URL:', SUPABASE_URL);
  console.log('Key:', SUPABASE_PUBLISHABLE_KEY ? '✅ Present' : '❌ Missing');
  console.log('Environment:', import.meta.env.MODE || 'production');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});