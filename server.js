require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
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

        // 취향 데이터 배열 강제 변환 (에러 방지)
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
// [기능 2: 내 채팅방 목록 가져오기 API (모임방 + 1:1 완벽 호환!)]
// ---------------------------------------------------------

app.get('/api/chat/list', async (req, res) => {
    const { userId } = req.query;

    try {
        // 1. 1:1 채팅방(chat_room_participant)에서 내 방 찾기
        const { data: partRooms, error: partError } = await supabase
            .from('chat_room_participant')
            .select('room_id')
            .eq('user_id', userId);

        if (partError) throw partError;
        let roomIds = partRooms ? partRooms.map(r => r.room_id) : [];

        // 2. 모임방(meeting_participant)에서도 내 방 찾기
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
                roomIds = [...roomIds, ...meetRoomIds]; // 1:1 방과 모임방 합치기!
            }
        }

        roomIds = [...new Set(roomIds)]; // 중복 제거

        if (roomIds.length === 0) return res.json([]);

        // 3. 해당 방들의 상세 정보 가져오기 (최신 메시지 순 정렬)
        const { data: roomsInfo, error: infoError } = await supabase
            .from('chat_room')
            .select('*')
            .in('id', roomIds)
            .order('last_message_at', { ascending: false, nullsFirst: false });

        if (infoError) throw infoError;

        // 4. 각 방별로 상대방 정보 또는 모임 정보 합치기
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

// ---------------------------------------------------------
// [기능 3: 채팅방 나가기 API]
// ---------------------------------------------------------

app.post('/api/chat/leave', async (req, res) => {
    const { userId, roomId } = req.body;
    try {
        // 1. 개인 채팅/참가 정보 삭제
        await supabase.from('chat_room_participant').delete().eq('room_id', roomId).eq('user_id', userId);
        
        // 2. 모임방일 경우 모임 참가 정보도 삭제
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
            // DB에 메시지 저장
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

            // 채팅방(chat_room)의 마지막 메시지 업데이트
            await supabase
                .from('chat_room')
                .update({ 
                    last_message: data.message, 
                    last_message_at: new Date().toISOString() 
                })
                .eq('id', data.room);

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

server.listen(PORT, () => {
    console.log(`🚀 매칭 & 채팅 통합 서버가 포트 ${PORT}에서 활기차게 돌아가는 중!`);
});