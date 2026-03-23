// supabase.js
require('dotenv').config(); // .env 파일을 읽어옵니다.
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// 클라이언트 생성 후 내보내기
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;