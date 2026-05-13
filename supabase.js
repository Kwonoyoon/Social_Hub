require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 💡 승환님의 Supabase 프로젝트 URL과 Key를 직접 입력
const supabaseUrl = 'https://pglsdyqfldoopzzitbup.supabase.co';
const supabaseKey = 'sb_publishable_NRbfYi7_Y6Vcfw_hbdydhw_t2MNo3-F';

// 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseKey);

// 다른 파일(server.js, match.js)에서 쓸 수 있도록 내보내기
module.exports = supabase;