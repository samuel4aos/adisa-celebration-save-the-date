import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aafbzgcfoqgbiupovbnr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZmJ6Z2Nmb3FnYml1cG92Ym5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTg4ODgsImV4cCI6MjA5MjM3NDg4OH0.tPEcsuIrAU0sPXJilGysPgP4DDzHTNyBWl0Ahop8aC0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);