import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("joinSession", (sessionId) => {
    socket.join(sessionId);
  });

  socket.on("send_message", (data) => {
    socket.to(data.sessionId).emit("receive_message", data.message);
  });
});

server.listen(3001, () => {
  console.log("listening on *:3001");
});
