const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: (process.env.EMAIL_PASS || "").replace(/\s+/g, ""),
    },
});

/**
 * [STEP 1] 인증번호 발송 및 저장 (발송 시점)
 */
const requestVerification = async (targetEmail) => {
    if (!targetEmail.toLowerCase().endsWith('.ac.kr')) {
        return { success: false, message: "대학 이메일이 아닙니다." };
    }

    const vCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        // 1. 메일 발송
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: targetEmail,
            subject: '[Knock Knock] 대학생 인증번호',
            text: `인증번호는 [${vCode}] 입니다. 5분 이내에 입력해주세요.`
        });

        // 2. DB 저장 (만료시간 체크를 위해 현재시간 저장)
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
 */
const verifyCode = async (userEmail, inputCode) => {
    try {
        // 1. DB에서 해당 이메일의 최신 정보 가져오기
        const { data, error } = await supabase
            .from('email_verifications')
            .select('code, created_at')
            .eq('email', userEmail)
            .single();

        if (error || !data) return { success: false, message: "인증 요청 내역이 없습니다." };

        // 2. 만료 시간 체크 (5분 제한)
        const now = new Date();
        const createdAt = new Date(data.created_at);
        const diffMinutes = (now - createdAt) / (1000 * 60);

        if (diffMinutes > 5) {
            return { success: false, message: "인증 시간이 만료되었습니다. 다시 요청해주세요." };
        }

        // 3. 번호 대조
        if (data.code === inputCode) {
            console.log(`✨ [${userEmail}] 인증 최종 성공!`);
            // 여기서 실제 유저 테이블의 is_verified를 true로 바꾸는 로직을 추가하면 완벽합니다.
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