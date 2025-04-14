import { useState } from "react";
import GenerateId from "./GenerateId";
import showPopup from "./PopUp";
import { useNavigate } from "react-router-dom";
import "./OscillatingImage.css";
import socket from "./socket";

function Page1() {
  const [UserName, setUserName] = useState("");
  const [RoomId, setRoomId] = useState("");
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "row",
        // gap: "10px",
        padding: "150px",
      }}
    >
      <div style={{ flex: "1", display: "flex", justifyContent: "center" }}>
        <img
          src="/logo.png"
          alt="Logo"
          style={{
            width: "min(80%, 600px)",
            height: "auto",
            animation: "oscillate 2s infinite ease-in-out",
          }}
        />
      </div>

      {/* Form Section */}
      <div
        style={{
          flex: "1",
          display: "flex",
          flexDirection: "column",
          justifyContent: "left",
          // alignItems: "center",
          gap: "15px",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        {/* Username Input */}
        <input
          style={{
            width: "70%",
            height: "50px",
            padding: "10px",
            fontSize: "16px",
            border: "1px solid gray",
            borderRadius: "8px",
            outline: "none",
          }}
          type="text"
          placeholder="Username"
          value={UserName}
          onChange={(e) => setUserName(e.target.value)}
        />

        {/* Room ID Input */}
        <input
          style={{
            width: "70%",
            height: "50px",
            padding: "10px",
            fontSize: "16px",
            border: "1px solid gray",
            borderRadius: "8px",
            outline: "none",
          }}
          type="text"
          placeholder="Room-ID"
          value={RoomId}
          onChange={(e) => setRoomId(e.target.value)}
        />

        {/* Join Room Button */}
        <button
          style={{
            width: "70%",
            height: "50px",
            fontSize: "16px",
            fontFamily: "monospace",
            color: "black",
            backgroundColor: "white",
            border: "2px solid black",
            borderRadius: "8px",
            transition: "0.3s ease-in-out",
            cursor: "pointer",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "black";
            e.currentTarget.style.color = "white";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "white";
            e.currentTarget.style.color = "black";
          }}
          onClick={() => {
            if (!UserName) {
              showPopup("Enter Username");
            } else if (!RoomId) {
              showPopup("Enter Room-ID");
            } else {
              socket.connect();
              // socket.emit("joinRoom", ({UserName, RoomId}));
              navigate(`/room/${RoomId}`, { state: { UserName, RoomId: RoomId } });
            }
          }}
        >
          JOIN ROOM
        </button>

        {/* Create Room Button */}
        <button
          style={{
            width: "70%",
            height: "50px",
            fontSize: "16px",
            fontFamily: "monospace",
            color: "black",
            backgroundColor: "white",
            border: "2px solid black",
            borderRadius: "8px",
            transition: "0.3s ease-in-out",
            cursor: "pointer",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "black";
            e.currentTarget.style.color = "white";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "white";
            e.currentTarget.style.color = "black";
          }}
          onClick={() => {
            if (!UserName) {
              showPopup("Enter Username");
            } else {
              let id = GenerateId();
              socket.connect();
              // socket.emit("joinRoom", ({UserName, id}));
              navigate(`/room/${id}`, { state: { UserName, RoomId: id } });
            }
          }}
        >
          CREATE NEW ROOM
        </button>
      </div>
    </div>
  );
}

export default Page1;