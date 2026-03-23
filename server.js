const express = require('express');
const cors = require('cors');
const matcher = require('./match'); // AI 로직 불러오기

const app = express();
const PORT = 5000; 

app.use(cors()); // 프론트엔드 접속 허용
app.use(express.json()); // JSON 데이터 읽기 허용

// [창구 이름: /api/match]
app.post('/api/match', (req, res) => {
    try {
        const { myInterests, otherUsers } = req.body;
        
        // 1. 프론트에서 보내준 데이터를 AI 로직에 전달
        const results = matcher.getMatchResults(myInterests, otherUsers);
        
        // 2. 계산된 결과를 다시 프론트로 보냄
        res.json(results);
    } catch (error) {
        console.error("매칭 에러:", error);
        res.status(500).json({ error: "매칭 중 서버 에러" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ API 서버 가동 중: http://localhost:${PORT}/api/match`);
});