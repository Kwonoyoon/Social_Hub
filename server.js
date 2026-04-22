require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const supabase = require('./supabase'); 
const matcher = require('./match');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' })); 
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// [기능 1: 매칭 및 방 생성 API 영역] - 그대로 유지
app.get('/api/match', async (req, res) => {
    const { userId } = req.query; 
    if (!userId) return res.status(400).json({ error: "userId(UUID)가 필요합니다." });

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
        if (!safeMe) return res.status(404).json({ error: "내 정보를 찾을 수 없습니다." });

        const myInterests = [safeMe.movie, safeMe.music, safeMe.hobby];
        const calculatedMatches = matcher.getMatchResults(userId, myInterests, safeUsers);
        res.json(calculatedMatches);
    } catch (err) {
        res.status(500).json([]); 
    }
});

app.post('/api/match/action', async (req, res) => {
    const { senderId, receiverId, action } = req.body;
    try {
        if (action === 'like') {
            const { data: roomData, error: roomError } = await supabase
                .from('chat_room').insert([{ room_type: 'private' }]).select().single();
            if (roomError) throw roomError;
            const newRoomId = roomData.id;
            const { error: partError } = await supabase
                .from('chat_room_participant').insert([
                    { room_id: newRoomId, user_id: senderId },
                    { room_id: newRoomId, user_id: receiverId }
                ]);
            if (partError) throw partError;
            return res.json({ success: true, roomId: newRoomId });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "액션 처리 중 에러" });
    }
});

// [기능 2: 채팅방 목록 및 참여자 조회] - 그대로 유지
app.get('/api/chat/list', async (req, res) => {
    const { userId } = req.query;
    try {
        const { data: partRooms, error: partError } = await supabase
            .from('chat_room_participant').select('room_id').eq('user_id', userId);
        if (partError) throw partError;
        let roomIds = partRooms ? partRooms.map(r => r.room_id) : [];
        const { data: meetParts } = await supabase
            .from('meeting_participant').select('meeting_id').eq('user_id', userId);
        if (meetParts && meetParts.length > 0) {
            const meetingIds = meetParts.map(m => m.meeting_id);
            const { data: meetings } = await supabase
                .from('meeting').select('room_id').in('meeting_id', meetingIds);
            if (meetings) {
                const meetRoomIds = meetings.map(m => m.room_id).filter(id => id !== null);
                roomIds = [...roomIds, ...meetRoomIds]; 
            }
        }
        roomIds = [...new Set(roomIds)]; 
        if (roomIds.length === 0) return res.json([]);
        const { data: roomsInfo, error: infoError } = await supabase
            .from('chat_room').select('*').in('id', roomIds).order('last_message_at', { ascending: false, nullsFirst: false });
        if (infoError) throw infoError;
        const chatList = await Promise.all(roomsInfo.map(async (room) => {
            if (room.room_type === 'private') {
                const { data: otherPart } = await supabase.from('chat_room_participant').select('user_id').eq('room_id', room.id).neq('user_id', userId).limit(1).single();
                let title = '알 수 없는 유저';
                if (otherPart) {
                    const { data: otherUser } = await supabase.from('user').select('nickname').eq('id', otherPart.user_id).single();
                    if (otherUser) title = otherUser.nickname;
                }
                return { id: room.id, type: 'private', title: title, lastMessage: room.last_message || '대화가 시작되었습니다.', time: room.last_message_at ? new Date(room.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '', unreadCount: 0, isOnline: false, avatarColor: 'bg-neutral-100 border border-neutral-200', avatarText: '👤', textColor: 'text-gray-900' };
            } else {
                const { data: meetingInfo } = await supabase.from('meeting').select('title').eq('room_id', room.id).limit(1).single();
                return { id: room.id, type: 'group', title: meetingInfo?.title || '참여 중인 모임', titleIcon: '👥', memberCount: 0, lastMessage: room.last_message || '새로운 모임 채팅방입니다.', time: room.last_message_at ? new Date(room.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '', unreadCount: 0, avatarColor: 'bg-neutral-900', avatarText: '💬' };
            }
        }));
        res.json(chatList);
    } catch (err) { res.status(500).json({ error: "목록 로드 실패" }); }
});

app.get('/api/meetings/:meetingId/participants', async (req, res) => {
    const { meetingId } = req.params;
    try {
        const { data, error } = await supabase.from('meeting_participant').select(`user_id, role, user:user_id ( nickname )`).eq('meeting_id', meetingId);
        if (error) throw error;
        const participants = data.map(p => ({ user_id: p.user_id, role: p.role, nickname: p.user?.nickname || '알 수 없음' }));
        res.json(participants);
    } catch (err) { res.status(500).json({ error: "서버 에러가 발생했습니다." }); }
});

// [기능 3: 채팅방 나가기] - 그대로 유지
app.post('/api/chat/leave', async (req, res) => {
    const { userId, roomId } = req.body;
    try {
        await supabase.from('chat_room_participant').delete().eq('room_id', roomId).eq('user_id', userId);
        const { data: meet } = await supabase.from('meeting').select('meeting_id').eq('room_id', roomId).single();
        if (meet) await supabase.from('meeting_participant').delete().eq('meeting_id', meet.meeting_id).eq('user_id', userId);
        res.json({ success: true, message: "채팅방을 나갔습니다." });
    } catch (err) { res.status(500).json({ success: false, error: "나가기 실패" }); }
});

// ---------------------------------------------------------
// [기능 4: 실시간 통신 영역 (Socket.io)] - ⭐ 알람 기능 추가됨
// ---------------------------------------------------------

io.on('connection', (socket) => {
    console.log('유저 접속됨:', socket.id);

    // 1. 방 입장 (채팅방 + 개인 알람 방 공용)
    socket.on('join_room', (roomOrUserId) => {
        socket.join(roomOrUserId);
        console.log(`[${socket.id}] 님이 [${roomOrUserId}] 방에 입장했습니다.`);
    });

    // 2. 메시지 전송 및 실시간 알람 발송
    socket.on('send_message', async (data) => {
        try {
            // DB 저장 로직 (기존 유지)
            const { error: msgError } = await supabase.from('chat_message').insert([
                { room_id: data.room, sender_id: data.sender_id, content: data.message }
            ]);
            if (msgError) console.error("❌ DB 저장 실패:", msgError.message);

            await supabase.from('chat_room').update({ 
                last_message: data.message, last_message_at: new Date().toISOString() 
            }).eq('id', data.room);

            // [A] 채팅방 사람들에게 메시지 전달 (실시간 채팅)
            socket.to(data.room).emit('receive_message', data);

            // [B] 🔔 상대방에게 실시간 알람 전송 (추가됨!)
            // 프론트에서 receiver_id를 넘겨주면 해당 유저의 개인 방으로 알람을 쏩니다.
            if (data.receiver_id) {
                io.to(data.receiver_id).emit('receive_notification', {
                    type: 'chat',
                    sender_id: data.sender_id,
                    message: '새로운 메시지가 도착했습니다!'
                });
                console.log(`🔔 ${data.receiver_id} 님에게 알람 전송 완료`);
            }
        } catch (err) {
            console.error("서버 에러:", err);
        }
    });

    socket.on('disconnect', () => {
        console.log('유저 접속 종료:', socket.id);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 매칭 & 채팅 통합 서버가 포트 ${PORT}에서 활기차게 돌아가는 중!`);
});