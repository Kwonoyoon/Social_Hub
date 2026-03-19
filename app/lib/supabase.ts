// app/lib/supabase.ts (또는 .js)
import { createClient } from '@supabase/supabase-js';

// .env.local에 저장한 환경 변수를 불러옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 이 'supabase' 객체를 통해 DB에 접근합니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);