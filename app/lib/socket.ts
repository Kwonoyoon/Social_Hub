// app/lib/socket.ts
import { io } from "socket.io-client";

// 서버 주소 (Railway 배포 전이라면 localhost:5000)
const SOCKET_URL = "http://localhost:5000";

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
});