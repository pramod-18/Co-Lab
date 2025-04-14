// socket.js or socket.ts if using TypeScript
import { io } from "socket.io-client";

const socket = io("https://co-lab-irhl.onrender.com", {
  autoConnect: false, // Optional: control connection manually
});

export default socket;
