import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL;


export const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true, // 자동 재연결 설정
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});