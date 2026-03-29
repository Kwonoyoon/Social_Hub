require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// 💡 승환님의 Supabase 프로젝트 정보 세팅 완료!
const supabaseUrl = 'https://pglsdyqfldoopzzitbup.supabase.co';
const supabaseKey = 'sb_publishable_NRbfYi7_Y6Vcfw_hbdydhw_t2MNo3-F';
const supabase = createClient(supabaseUrl, supabaseKey);

io.on('connection', (socket) => {
    console.log('유저 접속됨:', socket.id);

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`유저 [${socket.id}] 님이 방 [${room}] 에 입장했습니다.`);
    });

    // 💡 메시지를 받을 때 DB에 먼저 저장하고 상대방에게 전달!
    socket.on('send_message', async (data) => {
        try {
            // 1. 백엔드가 메시지를 받자마자 Supabase DB에 저장
            const { error } = await supabase
                .from('chat_message')
                .insert([
                    {
                        room_id: data.room,        // 프론트에서 보낸 방 번호
                        sender_id: data.sender_id, // 프론트에서 보낸 유저 고유 ID (UUID)
                        content: data.message      // 채팅 텍스트
                    }
                ]);

            if (error) {
                console.error("❌ DB 저장 실패:", error.message);
            } else {
                console.log(`✅ DB 저장 성공! (방: ${data.room}, 내용: ${data.message})`);
            }

            // 2. 같은 방에 있는 사람들에게 메시지 뿌려주기
            socket.to(data.room).emit('receive_message', data);
            
        } catch (err) {
            console.error("서버 에러:", err);
        }
    });

    socket.on('disconnect', () => {
        console.log('유저 접속 종료:', socket.id);
    });
});

server.listen(5000, () => {
    console.log('🚀 채팅 백엔드 서버가 5000번 포트에서 돌아가고 있습니다.');
});