import { createClient } from '@supabase/supabase-js'

// Thay thế bằng thông tin thật của bạn
const supabaseUrl = 'https://lsdcoadgonhytnosmcwh.supabase.co' 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZGNvYWRnb25oeXRub3NtY3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjUzMzksImV4cCI6MjA4MTQwMTMzOX0.ICVV4hCbXzK0KkySMoC6olaSaVKnOTAYNokfeh_ddFU' 

export const supabase = createClient(supabaseUrl, supabaseKey)