const express = require('express');
const http = require('http'); // 💡 추가됨: Socket.io 서버를 열기 위해 기본 http 모듈 필요
const cors = require('cors');
const { Server } = require('socket.io'); // 💡 추가됨: 실시간 통신 라이브러리
const matcher = require('./match'); // AI 로직 불러오기

const app = express();
const PORT = 5000; 

// 💡 추가됨: Express 앱을 HTTP 서버로 감싸기
const server = http.createServer(app);

app.use(cors()); // 프론트엔드 접속 허용
app.use(express.json()); // JSON 데이터 읽기 허용

// 💡 추가됨: Socket.io 설정 (프론트엔드-백엔드 간 실시간 통신 허용)
const io = new Server(server, {
    cors: {
        origin: "*", // (나중에 배포할 때 실제 프론트엔드 웹사이트 주소로 변경하세요)
        methods: ["GET", "POST"]
    }
});

// ==========================================
// 1. 기존 매칭 API 로직 (유지)
// ==========================================
app.post('/api/match', (req, res) => {
    try {
        const { myInterests, otherUsers } = req.body;
        
        // 프론트에서 보내준 데이터를 AI 로직에 전달
        const results = matcher.getMatchResults(myInterests, otherUsers);
        
        // 계산된 결과를 다시 프론트로 보냄
        res.json(results);
    } catch (error) {
        console.error("매칭 에러:", error);
        res.status(500).json({ error: "매칭 중 서버 에러" });
    }
});

// ==========================================
// 2. 새로운 실시간 채팅 소켓 로직
// ==========================================
io.on('connection', (socket) => {
    console.log(`🟢 새 사용자가 접속했습니다! (소켓 ID: ${socket.id})`);

    // [이벤트] 클라이언트가 특정 채팅방에 입장할 때
    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`🚪 사용자 [${socket.id}] 님이 [${room}] 방에 입장했습니다.`);
    });

    // [이벤트] 클라이언트가 메시지를 보낼 때
    socket.on('send_message', (data) => {
        // 나를 제외한 같은 방에 있는 다른 사람들에게 메시지 전달
        // (data 안에는 방 번호, 보낸 사람, 메시지 내용 등이 담겨 있게 됩니다)
        socket.to(data.room).emit('receive_message', data);
        console.log(`💬 [${data.room}] 방에서 새 메시지 발생:`, data.message);
    });

    // [이벤트] 클라이언트가 접속을 종료(새로고침, 탭 닫기 등)할 때
    socket.on('disconnect', () => {
        console.log(`🔴 사용자가 퇴장했습니다. (소켓 ID: ${socket.id})`);
    });
});

// ==========================================
// 3. 서버 실행 (app.listen -> server.listen 으로 변경)
// ==========================================
server.listen(PORT, () => {
    console.log(`✅ knock knock 백엔드 가동 중`);
    console.log(`- 매칭 API: http://localhost:${PORT}/api/match`);
    console.log(`- 채팅 소켓 대기 중 🚀`);
});