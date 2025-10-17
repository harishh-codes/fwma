import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

let socket: Socket | null = null;

export async function connectSocket() {
  if (socket) return socket;
  const token = await AsyncStorage.getItem("token");

  socket = io("http://<YOUR_LOCAL_IP>:4000", {
    auth: { token },
    transports: ["websocket"],   // better reliability
  });

  socket.on("connect", () => console.log("✅ Socket connected:", socket?.id));
  socket.on("disconnect", () => console.log("❌ Socket disconnected"));

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
