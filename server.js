const express = require("express");
const {
  createServer
} = require("http");
const {
  Server
} = require("socket.io");
const mongoose = require('mongoose');
const Document = require('./Document');
const path = require("path");

mongoose.connect("mongodb://localhost/Co-lab")
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });


const app = express();
const server = createServer(app);

app.use(express.static(path.join(__dirname, "public")));

let rooms = {};
let count = 0
let messages = {};

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");


  socket.on("joinRoom", async ({
    UserName,
    RoomId,
    flag
  }) => {
    count = count + 1;
    console.log(`${UserName} joined room: ${RoomId}`);
    if (flag === 0) {
      const doc = await Document.findById(RoomId);

      if (!doc) {
        const newDoc = new Document({
          _id: RoomId,
          users: [UserName] 
        });
        await newDoc.save();
      } else {
        if (!doc.users.includes(UserName)) {
          doc.users.push(UserName);
          await doc.save();
        }
        socket.join(RoomId);
        socket.username = UserName;
        socket.roomId = RoomId;
        io.to(RoomId).emit("newJoin", UserName);
        if (1) {
          if (rooms[RoomId] === undefined) rooms[RoomId] = "// Write Your Code Here.";
          socket.emit("loadContent", rooms[RoomId]);
          socket.emit("loadMessages", messages[RoomId] || []);
        } else {
          rooms[RoomId] = "";
        }
      }
      socket.join(RoomId);
      socket.username = UserName;
      socket.roomId = RoomId;
      io.to(RoomId).emit("newJoin", UserName);
      if (1) {
        if (rooms[RoomId] === undefined) rooms[RoomId] = "// Write Your Code Here.";
        socket.emit("loadContent", rooms[RoomId]);
        socket.emit("loadMessages", messages[RoomId] || []);
      } else {
        rooms[RoomId] = "";
      }
    } else {
      try {
        const doc = await Document.findById(RoomId);
        if (!doc) {
          console.log('No Valid Room');
          socket.emit("Invalid id");
        } else {
          if (doc.users.includes(UserName)) {
            console.log("Username exists");
            socket.emit("Username exists");
          }
          else{
            socket.emit("joined-room");
            doc.users.push(UserName);
            await doc.save();
            socket.join(RoomId);
            socket.username = UserName;
            socket.roomId = RoomId;
            io.to(RoomId).emit("newJoin", UserName);
            if (1) {
              if (rooms[RoomId] === undefined) rooms[RoomId] = "// Write Your Code Here.";
              socket.emit("loadContent", rooms[RoomId]);
              socket.emit("loadMessages", messages[RoomId] || []);
            } else {
              rooms[RoomId] = "";
            }
          }
          
        }

      } catch (err) {
        console.error("Error adding user to the database:", err);
        socket.emit("error", "Error adding user to the database");
      }
    }

  });

  socket.on("textChange", ({
    RoomId,
    content
  }) => {
    rooms[RoomId] = content;
    io.to(RoomId).emit("updateText", content);
  });

  socket.on("newMsg", ({
    RoomId,
    newmsg
  }) => {
    if (!messages[RoomId]) {
      messages[RoomId] = [];
    }
    messages[RoomId].push(newmsg);
    io.to(RoomId).emit("updateMsgs", messages[RoomId]);
  })
  socket.on("showusers", async (roomId) => {
    console.log('u');
    try {
      const doc = await Document.findById(roomId);

      if (!doc) {
        socket.emit("showusers-response", {
          success: false,
          message: "Room not found",
        });
        return;
      }

      socket.emit("showusers-response", {
        success: true,
        users: doc.users,
      });

    } catch (err) {
      console.error("Error fetching users:", err);
      socket.emit("showusers-response", {
        success: false,
        message: "Error retrieving users",
      });
    }
  });

  socket.on("leave", async ({
    UserName,
    RoomId
  }) => {
    try {
      const doc = await Document.findById(RoomId);
      if (doc && doc.users.includes(UserName)) {
        doc.users = doc.users.filter(user => user !== UserName);
        await doc.save();

        io.to(RoomId).emit("userExit", UserName);

        io.to(RoomId).emit("showusers-response", {
          success: true,
          users: doc.users
        });
      }
      socket.leave(RoomId);
    } catch (err) {
      console.error("Error handling leave:", err);
      socket.emit("error", "Error processing leave request");
    }
  });


  socket.on("disconnect", async () => {
    const {
      username,
      roomId
    } = socket;

    if (username && roomId) {
      try {
        const doc = await Document.findById(roomId);
        if (doc && doc.users.includes(username)) {
          doc.users = doc.users.filter(user => user !== username);
          await doc.save();

          io.to(roomId).emit("userExit", username);
          io.to(roomId).emit("showusers-response", {
            success: true,
            users: doc.users
          });
        }
        socket.leave(roomId);

      } catch (err) {
        console.error("Error handling disconnect cleanup:", err);
      }
    }

    console.log("User disconnected");
  });

});

app.get("/room/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});