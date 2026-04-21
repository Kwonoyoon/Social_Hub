require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const supabase = require('./supabase'); 
const matcher = require('./match');

const app = express();

// [수정 1] Railway는 process.env.PORT를 통해 포트를 주입하므로 이를 따르도록 수정
const PORT = process.env.PORT || 5000;

// 1. 미들웨어 설정
// [수정 2] 배포 환경에서 프론트엔드와 원활하게 통신하기 위해 origin을 유연하게 설정
app.use(cors({ origin: '*' })); 
app.use(express.json());

const server = http.createServer(app);

// 2. Socket.io 설정 (실시간 채팅용)
const io = new Server(server, {
    cors: {
        // [수정 3] 배포 후 프론트엔드 URL(Vercel 등)이 확정되면 "*" 대신 해당 주소를 넣으세요.
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// ---------------------------------------------------------
// [기능 1: 매칭 및 방 생성 API 영역]
// ---------------------------------------------------------

// 1-1. 매칭 리스트 가져오기 API
app.get('/api/match', async (req, res) => {
    const { userId } = req.query; 

    if (!userId) {
        return res.status(400).json({ error: "userId(UUID)가 필요합니다." });
    }

    try {
        const { data: allUsers, error } = await supabase.from('user').select('*');
        if (error) throw error;

        const safeUsers = allUsers.map(u => ({
            ...u,
            movie: Array.isArray(u.movie) ? u.movie : (u.movie ? [u.movie] : []),
            music: Array.isArray(u.music) ? u.music : (u.music ? [u.music] : []),
            hobby: Array.isArray(u.hobby) ? u.hobby : (u.hobby ? [u.hobby] : [])
        }));

        const safeMe = safeUsers.find(u => String(u.id) === String(userId));
        if (!safeMe) {
            return res.status(404).json({ error: "내 정보를 찾을 수 없습니다." });
        }

        const myInterests = [safeMe.movie, safeMe.music, safeMe.hobby];
        const calculatedMatches = matcher.getMatchResults(userId, myInterests, safeUsers);
        
        console.log("✅ 매칭 성공! 알고리즘 통과 완료");
        res.json(calculatedMatches);
    } catch (err) {
        console.error("🚨 매칭 에러 상세 내용:", err);
        res.status(500).json([]); 
    }
});

// 1-2. 하트(like) 액션 시 진짜 1:1 채팅방 생성 로직
app.post('/api/match/action', async (req, res) => {
    const { senderId, receiverId, action } = req.body;
    try {
        if (action === 'like') {
            const { data: roomData, error: roomError } = await supabase
                .from('chat_room')
                .insert([{ room_type: 'private' }])
                .select()
                .single();

            if (roomError) throw roomError;
            const newRoomId = roomData.id;

            const { error: partError } = await supabase
                .from('chat_room_participant')
                .insert([
                    { room_id: newRoomId, user_id: senderId },
                    { room_id: newRoomId, user_id: receiverId }
                ]);

            if (partError) throw partError;

            return res.json({ success: true, roomId: newRoomId });
        }
        res.json({ success: true });
    } catch (err) {
        console.error("액션 처리 중 에러:", err);
        res.status(500).json({ error: "액션 처리 중 에러" });
    }
});

// ---------------------------------------------------------
// [기능 2: 내 채팅방 목록 가져오기 API]
// ---------------------------------------------------------

app.get('/api/chat/list', async (req, res) => {
    const { userId } = req.query;

    try {
        const { data: partRooms, error: partError } = await supabase
            .from('chat_room_participant')
            .select('room_id')
            .eq('user_id', userId);

        if (partError) throw partError;
        let roomIds = partRooms ? partRooms.map(r => r.room_id) : [];

        const { data: meetParts } = await supabase
            .from('meeting_participant')
            .select('meeting_id')
            .eq('user_id', userId);

        if (meetParts && meetParts.length > 0) {
            const meetingIds = meetParts.map(m => m.meeting_id);
            const { data: meetings } = await supabase
                .from('meeting')
                .select('room_id')
                .in('meeting_id', meetingIds);

            if (meetings) {
                const meetRoomIds = meetings.map(m => m.room_id).filter(id => id !== null);
                roomIds = [...roomIds, ...meetRoomIds]; 
            }
        }

        roomIds = [...new Set(roomIds)]; 

        if (roomIds.length === 0) return res.json([]);

        const { data: roomsInfo, error: infoError } = await supabase
            .from('chat_room')
            .select('*')
            .in('id', roomIds)
            .order('last_message_at', { ascending: false, nullsFirst: false });

        if (infoError) throw infoError;

        const chatList = await Promise.all(roomsInfo.map(async (room) => {
            if (room.room_type === 'private') {
                const { data: otherPart } = await supabase
                    .from('chat_room_participant')
                    .select('user_id')
                    .eq('room_id', room.id)
                    .neq('user_id', userId)
                    .limit(1)
                    .single();

                let title = '알 수 없는 유저';
                if (otherPart) {
                    const { data: otherUser } = await supabase
                        .from('user')
                        .select('nickname')
                        .eq('id', otherPart.user_id)
                        .single();
                    if (otherUser) title = otherUser.nickname;
                }

                return {
                    id: room.id,
                    type: 'private',
                    title: title,
                    lastMessage: room.last_message || '대화가 시작되었습니다.',
                    time: room.last_message_at ? new Date(room.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                    unreadCount: 0, 
                    isOnline: false,
                    avatarColor: 'bg-neutral-100 border border-neutral-200',
                    avatarText: '👤',
                    textColor: 'text-gray-900'
                };
            } else {
                const { data: meetingInfo } = await supabase
                    .from('meeting')
                    .select('title')
                    .eq('room_id', room.id)
                    .limit(1)
                    .single();

                return {
                    id: room.id,
                    type: 'group',
                    title: meetingInfo?.title || '참여 중인 모임',
                    titleIcon: '👥',
                    memberCount: 0, 
                    lastMessage: room.last_message || '새로운 모임 채팅방입니다.',
                    time: room.last_message_at ? new Date(room.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                    unreadCount: 0,
                    avatarColor: 'bg-neutral-900',
                    avatarText: '💬'
                };
            }
        }));

        res.json(chatList);
    } catch (err) {
        console.error("채팅 목록 로드 에러:", err);
        res.status(500).json({ error: "목록 로드 실패" });
    }
});
app.get('/api/meetings/:meetingId/participants', async (req, res) => {
    const { meetingId } = req.params;
    try {
        const { data, error } = await supabase
            .from('meeting_participant')
            .select(`
                user_id,
                role,
                user:user_id ( nickname )
            `) // user_id를 키로 user 테이블의 nickname을 조인해서 가져옴
            .eq('meeting_id', meetingId);

        if (error) throw error;

        // 프론트엔드에서 쓰기 편하게 데이터 구조를 정리해서 보냄
        const participants = data.map(p => ({
            user_id: p.user_id,
            role: p.role,
            nickname: p.user?.nickname || '알 수 없음'
        }));

        res.json(participants);
    } catch (err) {
        console.error("참여자 조회 중 서버 에러:", err);
        res.status(500).json({ error: "서버 에러가 발생했습니다." });
    }
});

// ---------------------------------------------------------
// [기능 3: 채팅방 나가기 API]
// ---------------------------------------------------------

app.post('/api/chat/leave', async (req, res) => {
    const { userId, roomId } = req.body;
    try {
        await supabase.from('chat_room_participant').delete().eq('room_id', roomId).eq('user_id', userId);
        const { data: meet } = await supabase.from('meeting').select('meeting_id').eq('room_id', roomId).single();
        if (meet) {
            await supabase.from('meeting_participant').delete().eq('meeting_id', meet.meeting_id).eq('user_id', userId);
        }
        res.json({ success: true, message: "채팅방을 나갔습니다." });
    } catch (err) {
        console.error("나가기 에러:", err);
        res.status(500).json({ success: false, error: "나가기 실패" });
    }
});

// ---------------------------------------------------------
// [기능 4: 실시간 통신 영역 (Socket.io)]
// ---------------------------------------------------------

io.on('connection', (socket) => {
    console.log('유저 접속됨:', socket.id);

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`유저 [${socket.id}] 님이 방 [${room}] 에 입장했습니다.`);
    });

    socket.on('send_message', async (data) => {
        try {
            const { error: msgError } = await supabase
                .from('chat_message')
                .insert([
                    {
                        room_id: data.room,
                        sender_id: data.sender_id,
                        content: data.message
                    }
                ]);

            if (msgError) console.error("❌ DB 저장 실패:", msgError.message);

            await supabase
                .from('chat_room')
                .update({ 
                    last_message: data.message, 
                    last_message_at: new Date().toISOString() 
                })
                .eq('id', data.room);

            socket.to(data.room).emit('receive_message', data);
        } catch (err) {
            console.error("서버 에러:", err);
        }
    });

    socket.on('disconnect', () => {
        console.log('유저 접속 종료:', socket.id);
    });
});

// [수정 4] "0.0.0.0" 호스트를 추가하여 클라우드 환경 접속 허용
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 매칭 & 채팅 통합 서버가 포트 ${PORT}에서 활기차게 돌아가는 중!`);
});