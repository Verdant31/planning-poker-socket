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

type User = {
  id: string;
  name: string;
  card?: number;
};

const initialUsersMock = [
  {
    id: "1",
    name: "John",
    card: 5,
  },
  {
    id: "2",
    name: "Jane",
    card: 8,
  },
  {
    id: "3",
    name: "Jack",
    card: 5,
  },
  {
    id: "4",
    name: "Jill",
    card: 13,
  },
];

const connections: Connection[] = [];

const checkIfSessionExists = (sessionId: any) => {
  return connections.some((connection) => connection.sessionId === sessionId);
};

io.on("connection", (socket) => {
  socket.on("joinSession", ({ sessionId, user }) => {
    socket.join(sessionId);
    console.log("OPA SESSAO JA EXISTE");
    if (checkIfSessionExists(sessionId)) {
      const connection = connections.find((connection) => connection.sessionId === sessionId);
      const user = connection?.users.find((connected: User) => user.id === connected.id);
      if (user) {
        io.to(sessionId).emit("joinedSession", connection?.users);
        return;
      }
    }
    if (!checkIfSessionExists(sessionId)) {
      connections.push({ sessionId, users: [...initialUsersMock, user] });
    } else {
      connections.forEach((connection) => {
        if (connection.sessionId === sessionId) {
          connection.users.push(user);
        }
      });
    }
    const connection = connections.find((connection) => connection.sessionId === sessionId);
    io.to(sessionId).emit("joinedSession", connection?.users);
  });

  socket.on("chooseCard", ({ sessionId, userId, card }) => {
    const connection = connections.find((connection) => connection.sessionId === sessionId);
    const user = connection?.users.find((user: User) => user.id === userId);
    user!.card = card;
    io.to(sessionId).emit("cardChosen", connection?.users);
  });

  socket.on("resetGame", ({ sessionId }) => {
    const connection = connections.find((connection) => connection.sessionId === sessionId);
    connection!.users.forEach((user: User) => {
      user.card = undefined;
    });
    io.to(sessionId).emit("gameReset", connection?.users);
  });

  socket.on("revealCards", ({ sessionId }) => {
    io.to(sessionId).emit("cardsReveal", true);
  });
});

server.listen(3001, () => {
  console.log("listening on *:3001");
});
