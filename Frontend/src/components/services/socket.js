// src/services/socket.js
import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io("http://localhost:8000", {
      transports: ["websocket"],
      autoConnect: false,
    });
  }
  return socket;
}
