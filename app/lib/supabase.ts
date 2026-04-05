import { createClient } from '@supabase/supabase-js';

// process.env가 안 먹힐 때를 대비해 기본값 체크를 뺍니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);