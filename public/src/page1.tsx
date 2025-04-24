import { useEffect, useState } from "react";
import GenerateId from "./GenerateId";
import showPopup from "./PopUp";
import { useNavigate } from "react-router-dom";
import "./OscillatingImage.css";
import socket from "./socket";
import { encryptRoomId } from "./encrypt";

function Page1() {
  const [UserName, setUserName] = useState("");
  const [RoomId, setRoomId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("Invalid id", () => {
      showPopup("Invalid CoLab Id", "#ff4d4d", false);
    });

    socket.on("Username exists", () => {
      showPopup(`Username ${UserName} already exists`, "#ff4d4d", false);
    });

    socket.on("joined-room", () => {
      let erid = encryptRoomId(RoomId);
      navigate(`/room/${erid}`, {
        state: { UserName, RoomId, flag: 1 },
      });
    });

    return () => {
      socket.off("Invalid id");
      socket.off("joined-room");
    };
  });

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
          placeholder="CoLab-ID"
          value={RoomId}
          onChange={(e) => setRoomId(e.target.value)}
        />

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
              showPopup("Enter CoLab-ID");
            } else {
              socket.connect();
              socket.emit("joinRoom", { UserName, RoomId, flag: 1 });
            }
          }}
        >
          JOIN ROOM
        </button>

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
            } else if (RoomId) {
              showPopup("Remove ID to proceed");
            } else {
              let id = GenerateId();
              socket.connect();
              // socket.emit("joinRoom", ({UserName, id}));
              let erid = encryptRoomId(id);
              navigate(`/room/${erid}`, {
                state: { UserName, RoomId: id, flag: 0 },
              });
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
