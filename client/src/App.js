import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import io from "socket.io-client";
import "./App.css";

// Connect to Backend
// Detect if we are running locally or in production
const SERVER_URL = process.env.NODE_ENV === 'production' 
  ? "https://YOUR-RENDER-APP-NAME.onrender.com" // <--- PASTE YOUR RENDER URL HERE
  : "http://localhost:3001";

const socket = io.connect(SERVER_URL);

function App() {
  const [roomId, setRoomId] = useState("room1"); // Default room
  const [code, setCode] = useState("// Start coding together!");

  // We use this flag to prevent the editor from updating 
  // if the change came from our own typing.
  const [isIncoming, setIsIncoming] = useState(false);

  useEffect(() => {
    // 1. Join the Room on Load
    socket.emit("join_room", roomId);

    // 2. Listen for incoming code changes
    socket.on("receive_code", (newCode) => {
      setIsIncoming(true); // Mark this update as "External"
      setCode(newCode);
      // Wait for React to render, then reset flag
      setTimeout(() => setIsIncoming(false), 100);
    });
  }, [roomId]);

  // 3. Handle Local Changes (User Typing)
  const handleEditorChange = (value) => {
    // Only emit if the change came from the User typing, 
    // NOT from an incoming socket event
    if (!isIncoming) {
      socket.emit("code_change", { roomId, code: value });
      setCode(value);
    }
  };

  return (
    <div className="App">
      <div className="header">
        <h1>💻 Co-Code</h1>
        <div className="room-info">
          Room: <strong>{roomId}</strong>
        </div>
      </div>

      <div className="editor-container">
        <Editor
          height="90vh"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
          }}
        />
      </div>
    </div>
  );
}

export default App;