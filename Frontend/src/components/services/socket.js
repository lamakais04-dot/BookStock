import { io } from "socket.io-client";

import { SOCKET_URL } from "./apiConfig";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});
