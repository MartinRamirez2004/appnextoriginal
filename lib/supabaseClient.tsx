import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://itofhpldxmuqgahpvjzi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0b2ZocGxkeG11cWdhaHB2anppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MDc0NzEsImV4cCI6MjA3ODM4MzQ3MX0.PPBvdEaIZp-6uyiKuzxMg61PeZXTbOwN5KfG24bRAMA';

export const supabase = createClient(supabaseUrl, supabaseKey);