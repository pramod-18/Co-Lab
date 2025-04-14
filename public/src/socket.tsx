// socket.js or socket.ts if using TypeScript
import { io } from "socket.io-client";

const socket = io("http://10.81.35.101:3000", {
  autoConnect: false, // Optional: control connection manually
});

export default socket;
