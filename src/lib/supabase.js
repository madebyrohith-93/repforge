import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jmdyxzkbgkshkbmsuqza.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZHl4emtiZ2tzaGtibXN1cXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MjU3MjEsImV4cCI6MjA4OTQwMTcyMX0.8tMt1zEewyv78_eFFN2sVdxVCje6gW4BraH2K-OjonA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
