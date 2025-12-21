import { createClient } from '@supabase/supabase-js'

// Thay thế bằng thông tin thật của bạn
const supabaseUrl = 'https://aqljrgsuwcpzhjqscgot.supabase.co' 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxbGpyZ3N1d2NwemhqcXNjZ290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNjE1NjUsImV4cCI6MjA4MTgzNzU2NX0.z8e4P1yvBZLYwTFvgKLNH3AaQKivjVgBohLiCo4nOPM' 

export const supabase = createClient(supabaseUrl, supabaseKey)