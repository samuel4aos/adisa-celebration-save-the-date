import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aafbzgcfoqgbiupovbnr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZmJ6Z2Nmb3FnYml1cG92Ym5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTg4ODgsImV4cCI6MjA5MjM3NDg4OH0.tPEcsuIrAU0sPXJilGysPgP4DDzHTNyBWl0Ahop8aC0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Update event date to May 30th 2026
async function updateDate() {
  const { data, error } = await supabase
    .from('app_config')
    .update({ event_date: '2026-05-30' })
    .eq('id', 'global')
    .select();
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Updated:', data);
  }
}

updateDate();