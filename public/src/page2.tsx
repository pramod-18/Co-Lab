import { Editor } from "@monaco-editor/react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Avatar from "react-avatar";
import { useRef } from "react";
import {
  faCopy,
  faDownload,
  faTimes,
  faPlay,
  faComments,
  faUserGroup,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";
import showPopup from "./PopUp";
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
// const socket = io("http://localhost:3000");
import socket from "./socket";
import { CopyToClipboard } from "react-copy-to-clipboard";

socket.connect();

const getJudge0LangId = (lang: string): number => {
  switch (lang) {
    case "cpp":
      return 54; // C++ (GCC)
    case "c":
      return 50; // C
    case "java":
      return 62; // Java
    case "python":
      return 71; // Python
    case "javascript":
      return 63; // JavaScript
    default:
      return 54;
  }
};

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 50%)`;
  return color;
}

function Page2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState<string>("");
  const [lang, setLang] = useState<string>("cpp");
  const [selectedValue, setSelectedValue] = useState<string>("cpp");
  const [showChat, setShowChat] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<
    (string | { sender: string; text: string })[]
  >([]);
  const [message, setMessage] = useState<string>("");
  const { UserName, RoomId, flag } = location.state ?? {};
  const [output, setOutput] = useState<string>("No output");
  const [input, setInput] = useState<string>("");
  const [users, setUsers] = useState<string[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!UserName || !RoomId) {
      showPopup("Invalid session", "#ff4d4d");
      socket.disconnect();
      navigate("/");
    }
  }, [UserName, RoomId, navigate]);

  useEffect(() => {
    if (UserName && RoomId && flag === 0)
      socket.emit("joinRoom", { UserName, RoomId, flag });
  }, []);

  const handleCopy = () => {
    showPopup("CoLab ID copied", "white");
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    let name = `code.${selectedValue === "python" ? "py" : selectedValue}`;
    link.download = name;
    link.click();
    showPopup("Downloaded Code", "white");
  };

  const handleRun = async () => {
    showPopup("Running code...", "white");

    const encodedCode = btoa(code);
    const encodedInput = btoa(input);

    try {
      const response = await fetch(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key":
              "a4e4a92b8amshfc37830ae89c80cp1d41f1jsn931e12285737",
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
          body: JSON.stringify({
            language_id: getJudge0LangId(selectedValue),
            source_code: encodedCode,
            stdin: encodedInput,
          }),
        }
      );

      const result = await response.json();
      console.log(result);

      if (result.status.description !== "Accepted") {
        setOutput(result.status.description);
      } else {
        const stdout = result.stdout ? atob(result.stdout) : "";
        const stderr = result.stderr ? atob(result.stderr) : "";
        const time = result.time ?? "N/A";
        const memory = result.memory ? `${result.memory} KB` : "N/A";

        const finalOutput =
          (stdout || stderr || "No Output") +
          `\n\n\n---------------------------\n---------------------------\nTime: ${time} sec\nMemory: ${memory}`;

        setOutput(finalOutput);
      }
    } catch (err) {
      console.error(err);
      setOutput("Execution error");
    }
  };

  const toggleChat = () => {
    setShowChat((prev) => !prev);
    setShowUsers(false);
  };

  const sendMessage = () => {
    if (message.trim() !== "") {
      const newMsg = { sender: UserName, text: message };
      setChatMessages([...chatMessages, newMsg]);
      setMessage("");
      socket.emit("newMsg", { RoomId, message });
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(event.target.value);
    setLang(event.target.value);
  };

  const handleCode = (value: string | undefined) => {
    console.log(value);
    const newContent = value ?? "hi";
    setCode(newContent);
    socket.emit("textChange", { RoomId, content: newContent });
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target?.result as string;
        setCode(fileContent);
        socket.emit("textChange", { RoomId, content: fileContent });
      };
      reader.readAsText(file);
    }
  };

  socket.on("updateText", (content: string) => {
    console.log("updating");
    setCode(content);
  });

  socket.on("loadContent", (existingCode: string) => {
    setCode(existingCode);
  });

  socket.on("newJoin", (userName) => {
    // setUsers((prevUsers) => [...prevUsers, { UserName: userName }]);
    showPopup(`${userName} joined`, "#66ff99", false);
  });

  socket.on("userExit", (userName) => {
    showPopup(`${userName} left`, "#ff4d4d", false);
    setUsers((prevUsers) => prevUsers.filter((user) => user !== userName));
  });

  socket.on(
    "loadMessages",
    (messages: (string | { sender: string; text: string })[] = []) => {
      setChatMessages(messages);
    }
  );

  socket.on(
    "updateMsgs",
    (msgs: (string | { sender: string; text: string })[] = []) => {
      setChatMessages(msgs);
    }
  );

  socket.on("showusers-response", (data) => {
    if (data.success) {
      // alert("Users in room:\n" + data.users.join("\n"));
      setUsers(data.users);
    } else {
      alert(data.message);
    }
  });

  const buttonStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "1px solid white",
    backgroundColor: "white",
    color: "black",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.3s ease",
  };

  const hoverStyle = (
    e: React.MouseEvent<HTMLButtonElement>,
    color: string
  ) => {
    e.currentTarget.style.backgroundColor = color;
    e.currentTarget.style.color = "white";
  };

  const resetStyle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "white";
    e.currentTarget.style.color = "black";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px",
          borderBottom: "2px solid gray",
          height: "60px",
          backgroundColor: "#f8f9fa",
        }}
      >
        <select
          value={selectedValue}
          onChange={handleChange}
          style={{
            padding: "8px",
            fontSize: "14px",
            borderRadius: "15px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        >
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="javascript">Javascript</option>
        </select>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            title="Users"
            style={buttonStyle}
            onMouseOver={(e) => hoverStyle(e, "#ffa500")}
            onMouseOut={resetStyle}
            onClick={() => {
              setShowUsers((prev) => !prev);
              setShowChat(false);
              socket.emit("showusers", RoomId);
            }}
          >
            <FontAwesomeIcon icon={faUserGroup} size="lg" />
          </button>

          <button
            title="Toggle Chat"
            style={buttonStyle}
            onMouseOver={(e) => hoverStyle(e, "#66ff33")}
            onMouseOut={resetStyle}
            onClick={toggleChat}
          >
            <FontAwesomeIcon icon={faComments} size="lg" />
          </button>

          <button
            title="Run Code"
            style={buttonStyle}
            onMouseOver={(e) => hoverStyle(e, "#3399ff")}
            onMouseOut={resetStyle}
            onClick={handleRun}
          >
            <FontAwesomeIcon icon={faPlay} size="lg" />
          </button>

          <button
            title="Import Code"
            style={buttonStyle}
            onMouseOver={(e) => hoverStyle(e, "black")}
            onMouseOut={resetStyle}
            onClick={handleFileSelect}
          >
            <FontAwesomeIcon icon={faFolderOpen} size="lg" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={handleFileChange}
            accept=".cpp,.c,.java,.py,.js,.txt"
          />

          <button
            title="Download Code"
            style={buttonStyle}
            onMouseOver={(e) => hoverStyle(e, "black")}
            onMouseOut={resetStyle}
            onClick={handleDownload}
          >
            <FontAwesomeIcon icon={faDownload} size="lg" />
          </button>

          <CopyToClipboard text={RoomId} onCopy={handleCopy}>
            <button
              title="Copy ID"
              style={buttonStyle}
              onMouseOver={(e) => hoverStyle(e, "black")}
              onMouseOut={resetStyle}
            >
              <FontAwesomeIcon icon={faCopy} size="lg" />
            </button>
          </CopyToClipboard>

          <button
            title="Exit Room"
            style={buttonStyle}
            onMouseOver={(e) => hoverStyle(e, "#ff3300")}
            onMouseOut={resetStyle}
            onClick={() => {
              const confirmed = window.confirm(
                "Are you sure you want to leave the room?"
              );
              if (confirmed) {
                socket.emit("leave", { UserName, RoomId });
                setTimeout(() => {
                  socket.disconnect();
                  navigate("/", { replace: true });
                }, 100);
              }
            }}
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        <div
          style={{
            width: "75%",
            display: "flex",
            flexDirection: "column",
            padding: "10px",
          }}
        >
          <Editor
            height="100%"
            defaultLanguage="cpp"
            language={lang}
            theme="vs-light"
            defaultValue="// Write Your Code Here."
            value={code}
            onChange={handleCode}
            options={{
              fontSize: 14,
              minimap: { enabled: true },
            }}
          />
        </div>

        <div
          style={{
            width: "29%",
            padding: "10px",
            borderLeft: "2px solid gray",
            backgroundColor: "#f8f9fa",
          }}
        >
          {showChat ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <h3>Chat</h3>
              </div>
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "10px",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  minHeight: "200px",
                  maxHeight: "100vh",
                }}
              >
                {chatMessages.length === 0 ? (
                  <p>No messages yet</p>
                ) : (
                  chatMessages.map((msg, index) => {
                    if (typeof msg === "string") {
                      return (
                        <p key={index} style={{ marginBottom: "5px" }}>
                          {msg}
                        </p>
                      );
                    }
                    const color = stringToColor(msg.sender);
                    return (
                      <div key={index} style={{ marginBottom: "5px" }}>
                        <span style={{ color, fontWeight: "bold" }}>
                          {msg.sender}
                        </span>{" "}
                        <span>: {msg.text}</span>
                      </div>
                    );
                  })
                )}
              </div>
              <div style={{ display: "flex", marginTop: "10px" }}>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    outline: "none",
                    width: "80%",
                  }}
                />
                <button
                  onClick={sendMessage}
                  style={{
                    marginLeft: "5px",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "green",
                    color: "white",
                    cursor: "pointer",
                    width: "20%",
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          ) : showUsers ? (
            <div
              style={{
                padding: "10px",
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #ccc",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                maxHeight: "100%",
                overflowY: "auto",
              }}
            >
              <h4 style={{ marginBottom: "10px", textAlign: "center" }}>
                Active Users
              </h4>

              {users.length === 0 ? (
                <p style={{ textAlign: "center", color: "#777" }}>No users</p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {users.map((user, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      <Avatar name={user} size="40" round={true} />
                      <span style={{ fontWeight: "500", fontSize: "16px" }}>
                        {user}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <h4>Input</h4>
              <textarea
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  outline: "none",
                  resize: "none",
                }}
                placeholder="Enter input..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              >
                {input}
              </textarea>

              <h4 style={{ marginTop: "10px" }}>Output</h4>
              <pre
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  minHeight: "100px",
                }}
              >
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page2;
