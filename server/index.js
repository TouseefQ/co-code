const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // 1. Join a Room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // 2. Handle Code Changes
  // When User A types, we receive the code and send it to everyone ELSE in the room
  socket.on("code_change", ({ roomId, code }) => {
    socket.to(roomId).emit("receive_code", code);
  });

  // 3. Sync New User
  // When a new user joins, they need the current code. 
  // (Simplified: We rely on existing users to sync them for now, or store state here)

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING on 3001");
});

// ... imports

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // Allow ANY domain to connect (easiest for development/demo)
    // In production, you would restrict this to your specific Vercel URL
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

// ... socket logic ...

// CHANGE THIS LINE: Use process.env.PORT
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING on ${PORT}`);
});