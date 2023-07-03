"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cors_1 = __importDefault(require("cors"));
var express_1 = __importDefault(require("express"));
var http_1 = __importDefault(require("http"));
var socket_io_1 = require("socket.io");
var app = (0, express_1.default)();
app.use((0, cors_1.default)());
var server = http_1.default.createServer(app);
var io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
// const initialUsersMock = [
//   {
//     id: "1",
//     name: "John",
//     card: 5,
//   },
//   {
//     id: "2",
//     name: "Jane",
//     card: 8,
//   },
//   {
//     id: "3",
//     name: "Jack",
//     card: 5,
//   },
//   {
//     id: "4",
//     name: "Jill",
//     card: 13,
//   },
// ];
var connections = [];
var checkIfSessionExists = function (sessionId) {
    return connections.some(function (connection) { return connection.sessionId === sessionId; });
};
io.on("connection", function (socket) {
    socket.on("joinSession", function (_a) {
        var sessionId = _a.sessionId, user = _a.user;
        socket.join(sessionId);
        if (checkIfSessionExists(sessionId)) {
            var connection_1 = connections.find(function (connection) { return connection.sessionId === sessionId; });
            var userExists = connection_1 === null || connection_1 === void 0 ? void 0 : connection_1.users.find(function (connected) { return user.id === connected.id; });
            if (userExists) {
                io.to(sessionId).emit("joinedSession", connection_1 === null || connection_1 === void 0 ? void 0 : connection_1.users);
                return;
            }
        }
        if (!checkIfSessionExists(sessionId)) {
            connections.push({ sessionId: sessionId, users: [user] });
        }
        else {
            connections.forEach(function (connection) {
                if (connection.sessionId === sessionId) {
                    connection.users.push(user);
                }
            });
        }
        var connection = connections.find(function (connection) { return connection.sessionId === sessionId; });
        io.to(sessionId).emit("joinedSession", connection === null || connection === void 0 ? void 0 : connection.users);
    });
    socket.on("chooseCard", function (_a) {
        var sessionId = _a.sessionId, userId = _a.userId, card = _a.card;
        var connection = connections.find(function (connection) { return connection.sessionId === sessionId; });
        var user = connection === null || connection === void 0 ? void 0 : connection.users.find(function (user) { return user.id === userId; });
        user.card = card;
        io.to(sessionId).emit("cardChosen", connection === null || connection === void 0 ? void 0 : connection.users);
    });
    socket.on("resetGame", function (_a) {
        var sessionId = _a.sessionId;
        var connection = connections.find(function (connection) { return connection.sessionId === sessionId; });
        connection.users.forEach(function (user) {
            user.card = undefined;
        });
        io.to(sessionId).emit("gameReset", connection === null || connection === void 0 ? void 0 : connection.users);
    });
    socket.on("revealCards", function (_a) {
        var sessionId = _a.sessionId;
        io.to(sessionId).emit("cardsReveal", true);
    });
});
server.listen(3001, function () {
    console.log("listening on *:3001");
});
