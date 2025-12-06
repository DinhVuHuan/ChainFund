import { createClient } from '@supabase/supabase-js'

// Thay thế bằng thông tin thật của bạn
const supabaseUrl = 'https://otzxdwcherdfszyaortf.supabase.co' 
const supabaseKey = 'sb_publishable_ChOP0jmuHEnQDprQ6eEmng_wDjdVJCK' 

export const supabase = createClient(supabaseUrl, supabaseKey)