import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ehbaenczvnphgiuwujoc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoYmFlbmN6dm5waGdpdXd1am9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzEyMzcsImV4cCI6MjA4NjMwNzIzN30.0BEWpZe2r95GEx1VHVBmjbC5hUI767LdG60c1LXoK6k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
