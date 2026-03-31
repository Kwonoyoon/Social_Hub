require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
// 💡 팀원과 승환님의 모듈을 모두 불러옴
const supabase = require('./supabase'); 
const matcher = require('./match');

const app = express();
const PORT = 5000;

// 1. 미들웨어 설정
app.use(cors({ origin: '*' })); 
app.use(express.json());

const server = http.createServer(app);

// 2. Socket.io 설정 (실시간 채팅용)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// ---------------------------------------------------------
// [기능 1: 팀원의 매칭 로직] - API 영역
// ---------------------------------------------------------

// 1. 매칭 리스트 가져오기 API
app.get('/api/match', async (req, res) => {
    const { userId } = req.query; 
    if (!userId) return res.status(400).json({ error: "userId(UUID)가 필요합니다." });

    try {
        const { data: allUsers, error } = await supabase.from('user').select('*');
        if (error) throw error;

        const me = allUsers.find(u => String(u.id) === String(userId));
        if (!me) return res.status(404).json({ error: "내 정보를 찾을 수 없습니다." });

        const myInterests = [me.movie, me.music, me.hobby];
        const calculatedMatches = matcher.getMatchResults(userId, myInterests, allUsers);

        res.json(calculatedMatches);
    } catch (err) {
        console.error("매칭 에러:", err);
        res.status(500).json({ error: "서버 내부 에러" });
    }
});

// 2. 하트/X 액션 처리 API (여기서 1:1 채팅방 생성 로직 연결 가능)
app.post('/api/match/action', async (req, res) => {
    const { senderId, receiverId, action } = req.body;
    try {
        if (action === 'like') {
            // 임시 ID 대신 나중에 여기서 진짜 chat_room을 생성하도록 고칠 예정입니다!
            const roomId = `chat_${senderId.slice(0, 5)}_${receiverId.slice(0, 5)}`;
            return res.json({ success: true, roomId: roomId });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "액션 처리 중 에러" });
    }
});

// ---------------------------------------------------------
// [기능 2: 승환님의 채팅 로직] - 실시간 통신 영역
// ---------------------------------------------------------

io.on('connection', (socket) => {
    console.log('유저 접속됨:', socket.id);

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`유저 [${socket.id}] 님이 방 [${room}] 에 입장했습니다.`);
    });

    socket.on('send_message', async (data) => {
        try {
            // Supabase DB에 메시지 저장
            const { error } = await supabase
                .from('chat_message')
                .insert([
                    {
                        room_id: data.room,
                        sender_id: data.sender_id,
                        content: data.message
                    }
                ]);

            if (error) console.error("❌ DB 저장 실패:", error.message);
            else console.log(`✅ DB 저장 성공! (${data.message})`);

            // 상대방에게 실시간 전달
            socket.to(data.room).emit('receive_message', data);
        } catch (err) {
            console.error("서버 에러:", err);
        }
    });

    socket.on('disconnect', () => {
        console.log('유저 접속 종료:', socket.id);
    });
});

// 🚨 주의: app.listen 대신 server.listen을 사용해야 소켓이 돌아갑니다!
server.listen(PORT, () => {
    console.log(`🚀 매칭 & 채팅 통합 서버가 포트 ${PORT}에서 활기차게 돌아가는 중!`);
});