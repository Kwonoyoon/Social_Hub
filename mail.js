const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const dns = require('dns'); // 👈 Railway IPv6 충돌 우회용 모듈
require('dotenv').config();

// 🚨 핵심 해결책: 구글 우체국을 찾아갈 때 무조건 구형 주소(IPv4)를 먼저 찾도록 강제!
dns.setDefaultResultOrder('ipv4first');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Gmail SMTP 트랜스포터 설정 (포트 587 우회 적용)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,             
    secure: false,         // 587 포트에서는 무조건 false
    requireTLS: true,      // 대신 TLS 보안 강제
    auth: {
        user: process.env.EMAIL_USER, 
        pass: (process.env.EMAIL_PASS || "").replace(/\s+/g, ""), 
    },
});

/**
 * [STEP 1] 인증번호 발송 및 저장 (발송 시점)
 */
const requestVerification = async (targetEmail) => {
    // 💡 철통 방어막 유지! (.ac.kr이 아니면 컷)
    if (!targetEmail.toLowerCase().endsWith('.ac.kr')) {
        return { success: false, message: "대학 이메일이 아닙니다." };
    }

    const vCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        const mailOptions = {
            from: `"Knock Knock" <${process.env.EMAIL_USER}>`, 
            to: targetEmail,
            subject: '[Knock Knock] 대학생 인증번호',
            text: `인증번호는 [${vCode}] 입니다. 5분 이내에 입력해주세요.`,
            html: `<p>인증번호는 <strong>[${vCode}]</strong> 입니다.</p><p>5분 이내에 입력해주세요.</p>`
        };

        // 메일 발송 실행!
        await transporter.sendMail(mailOptions);

        // DB 저장 로직
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
        console.error("❌ 메일 발송 실패:", err);
        return { success: false, error: err.message };
    }
};

/**
 * [STEP 2] 인증번호 검증 (사용자가 입력했을 때)
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