const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const peerServer = ExpressPeerServer(server, { debug: true });

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use('/peerjs', peerServer);

const rooms = {};

app.get('/', (req, res) => {
  res.send("Server is running");
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join-room', (roomId, userId) => {
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    rooms[roomId].push(userId);
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
