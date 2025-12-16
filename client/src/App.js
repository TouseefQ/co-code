import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import io from "socket.io-client";
import "./App.css";

// --- CHANGE IS HERE ---
// Detect if we are running in production (Vercel) or local
const SERVER_URL = process.env.NODE_ENV === 'production' 
  ? "https://co-code-api.onrender.com/" // <--- ⚠️ PASTE YOUR RENDER URL HERE
  : "http://localhost:3001";

const socket = io.connect(SERVER_URL);
// ----------------------

function App() {
  // ... rest of your existing code stays exactly the same ...
  const [roomId, setRoomId] = useState("room1"); 
  const [code, setCode] = useState("// Start coding together!");
  const [isIncoming, setIsIncoming] = useState(false);

  useEffect(() => {
    socket.emit("join_room", roomId);

    socket.on("receive_code", (newCode) => {
      setIsIncoming(true);
      setCode(newCode);
      setTimeout(() => setIsIncoming(false), 100);
    });
  }, [roomId]);

  const handleEditorChange = (value) => {
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