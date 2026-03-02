import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = 'https://itarozdimxukkhwxruti.supabase.co';
const supabaseAnonKey: string =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0YXJvemRpbXh1a2tod3hydXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MTQ2MzgsImV4cCI6MjA3NDE5MDYzOH0.q7y0a7wiOaKcmkvWt0-G9ZXxj4f9BdogBB_mTGREOVY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
