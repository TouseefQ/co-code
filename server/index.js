const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

// Enable CORS for all routes (middleware)
app.use(cors());

// Create the HTTP server
const server = http.createServer(app);

// Initialize Socket.io with CORS rules
const io = new Server(server, {
  cors: {
    origin: "*", // Allow connection from any URL (Vercel, localhost, etc.)
    methods: ["GET", "POST"],
  },
});

// --- NEW: Home Route (Fixes "Cannot GET /") ---
app.get("/", (req, res) => {
  res.send("<h1>Server is running successfully! 🚀</h1>");
});

// --- Socket.io Logic ---
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // 1. Join a Room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // 2. Handle Code Changes
  // When User A types, send the code to everyone ELSE in the room
  socket.on("code_change", ({ roomId, code }) => {
    socket.to(roomId).emit("receive_code", code);
  });

  // 3. Disconnect
  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// --- Start Server ---
// IMPORTANT: Render provides the PORT via process.env.PORT
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING on port ${PORT}`);
});