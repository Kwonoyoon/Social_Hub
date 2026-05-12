import { io } from "socket.io-client";

// 정하신 환경 변수 이름을 사용합니다. 
// 값이 없으면 자동으로 localhost:5000을 바라봅니다.
const SOCKET_URL = process.env.NEXT_PUBLIC_KNOCK_KNOCK_API || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true, // 자동 재연결 설정
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});