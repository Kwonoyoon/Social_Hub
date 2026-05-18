const { createClient } = require('@supabase/supabase-js');
// 1. nodemailer 대신 resend 라이브러리를 가져옵니다.
const { Resend } = require('resend'); 
require('dotenv').config();

// (참고: NEXT_PUBLIC_process.env는 문법 오류가 날 수 있어 process.env로 깔끔하게 통일했습니다)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// 2. Resend 인스턴스를 생성합니다. (환경변수에서 API 키를 가져옴)
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * [STEP 1] 인증번호 발송 및 저장 (발송 시점)
 */
const requestVerification = async (targetEmail) => {
    if (!targetEmail.toLowerCase().endsWith('.ac.kr')) {
        return { success: false, message: "대학 이메일이 아닙니다." };
    }

    const vCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        // 3. nodemailer 발송 로직을 Resend API 호출 방식으로 변경했습니다.
        const { data, error: mailError } = await resend.emails.send({
            from: 'KnockKnock <onboarding@resend.dev>', // ⚠️도메인 인증 전에는 이 주소 고정입니다.
            to: targetEmail,
            subject: '[Knock Knock] 대학생 인증번호',
            text: `인증번호는 [${vCode}] 입니다. 5분 이내에 입력해주세요.`,
            // html을 추가하면 조금 더 깔끔하게 메일이 보입니다 (선택 사항)
            html: `<p>인증번호는 <strong>[${vCode}]</strong> 입니다.</p><p>5분 이내에 입력해주세요.</p>`
        });

        // 메일 발송 자체에 실패했을 경우 에러 핸들링
        if (mailError) {
            console.error("❌ Resend 메일 발송 실패:", mailError);
            return { success: false, error: mailError.message };
        }

        // 4. DB 저장은 기존 로직 완벽하게 유지!
        await supabase
            .from('email_verifications')
            .upsert({ 
                email: targetEmail, 
                code: vCode,
                created_at: new Date() 
            }, { onConflict: 'email' });

        console.log(`✅ [${targetEmail}] 발송 및 DB 저장 완료`);
        return { success: true };
    } catch (err) {
        console.error(err);
        return { success: false, error: err.message };
    }
};

/**
 * [STEP 2] 인증번호 검증 (사용자가 입력했을 때)
 * 👉 이 단계는 기존 코드가 완벽하므로 건드릴 것이 없습니다!
 */
const verifyCode = async (userEmail, inputCode) => {
    try {
        const { data, error } = await supabase
            .from('email_verifications')
            .select('code, created_at')
            .eq('email', userEmail)
            .single();

        if (error || !data) return { success: false, message: "인증 요청 내역이 없습니다." };

        const now = new Date();
        const createdAt = new Date(data.created_at);
        const diffMinutes = (now - createdAt) / (1000 * 60);

        if (diffMinutes > 5) {
            return { success: false, message: "인증 시간이 만료되었습니다. 다시 요청해주세요." };
        }

        if (data.code === inputCode) {
            console.log(`✨ [${userEmail}] 인증 최종 성공!`);
            return { success: true, message: "인증에 성공했습니다." };
        } else {
            return { success: false, message: "인증번호가 일치하지 않습니다." };
        }
    } catch (err) {
        console.error(err);
        return { success: false, error: err.message };
    }
};

module.exports = { requestVerification, verifyCode };