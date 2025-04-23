import { io } from "socket.io-client";

const socket = io("10.81.38.174:3000", {
  autoConnect: false, 
});

export default socket; 
