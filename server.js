const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = createServer(app);

app.use(express.static(path.join(__dirname, "public")));

let rooms = {};
let count = 0
let messages = {};

const io = new Server(server, {
  cors: {
    origin: ['https://10.81.35.101:5173', 'https://co-lab-beta.vercel.app'],
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("joinRoom", ({UserName, RoomId}) => {
    count = count + 1;
    console.log(`${UserName} joined room: ${RoomId}`);
    socket.join(RoomId);
    io.to(RoomId).emit("newJoin", UserName);
    if (1) {
      if(rooms[RoomId] === undefined) rooms[RoomId] = "// Write Your Code Here.";
      socket.emit("loadContent", rooms[RoomId]);
      socket.emit("loadMessages", messages[RoomId] || []);
    } else {
      rooms[RoomId] = "";
    }
  });

  socket.on("textChange", ({ RoomId, content }) => {
    rooms[RoomId] = content;
    io.to(RoomId).emit("updateText", content);
  });

  socket.on("newMsg", ({RoomId, newmsg}) => {
    if (!messages[RoomId]) {
      messages[RoomId] = [];
    }
    messages[RoomId].push(newmsg);
    io.to(RoomId).emit("updateMsgs", messages[RoomId]);
  })

  socket.on("leave", ({ UserName, RoomId }) => {
    io.to(RoomId).emit("userExit", UserName);
  })

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.get("/room/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
