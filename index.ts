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

type Connection = {
  sessionId: string;
  users: any;
};

const connections: Connection[] = [];

const checkIfSessionExists = (sessionId: any) => {
  return connections.some((connection) => connection.sessionId === sessionId);
};

io.on("connection", (socket) => {
  socket.on("joinSession", ({ sessionId, user }) => {
    socket.join(sessionId);

    if (!checkIfSessionExists(sessionId)) {
      connections.push({ sessionId, users: [user] });
    } else {
      connections.forEach((connection) => {
        if (connection.sessionId === sessionId) {
          connection.users.push(user);
        }
      });
    }

    console.log(JSON.stringify(connections));

    const connection = connections.find((connection) => connection.sessionId === sessionId);

    io.to(sessionId).emit("joinedSession", connection?.users);
  });
});

server.listen(3001, () => {
  console.log("listening on *:3001");
});
