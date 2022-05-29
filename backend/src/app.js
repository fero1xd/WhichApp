// Third Party Modules
const http = require('http');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookies = require('cookie-parser');

// Custom Utils
const connectDb = require('../utils/connectDb');
const AppError = require('../utils/appError');
const appRoutes = require('../routes');
const globalErrorHandler = require('../controllers/errorController');
const roomUtils = require('../utils/roomActions');
const { loadMessages, sendMessage } = require('../utils/messagesAction');
const { getMutualInfo } = require('../utils/callActions');

// Loading .env File
require('dotenv').config();

// Constants
const app = express();
const server = http.Server(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT;
const API_URL = '/api/v' + process.env.API_V;

// Middlewares
app.use(express.json());
app.use(morgan('dev'));
app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3000', 'http://192.168.1.3:3000'],
  })
);
app.use(cookies());

// Connecting to Db
connectDb();

// Main App Routes
app.use(API_URL, appRoutes);

// 404 : Not Found
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handling
app.use(globalErrorHandler);

// io
io.on('connection', (socket) => {
  socket.on('join', async ({ userId }) => {
    const clients = roomUtils.addUser(userId, socket.id);
    socket.emit('connectedUsers', {
      users: clients.filter((client) => client.userId != userId),
    });
    console.log(clients);
    setInterval(() => {
      socket.emit('connectedUsers', {
        users: clients.filter((client) => client.userId != userId),
      });
    }, 5000);
  });

  socket.on('loadMessages', async ({ userId, messagesWithUser }) => {
    const data = await loadMessages(userId, messagesWithUser);

    if (data.error) {
      return socket.emit('loadingMessagesFailed');
    }

    delete data.error;

    socket.emit('messagesLoaded', data);
  });

  socket.on('sendMessage', async ({ userId, messagesWith, messageBody }) => {
    const {
      newMessage,
      error,
      name,
      profilePicUrl,
      senderName,
      senderProfilePic,
    } = await sendMessage(userId, messagesWith, messageBody);

    if (error) {
      return socket.emit('sendMessageFailed');
    }

    socket.emit('messageSent', { newMessage, name, profilePicUrl });

    const user = roomUtils.findConnectedUser(messagesWith);
    if (user) {
      io.to(user.socketId).emit('newMessageReceived', {
        newMessage,
        senderName,
        senderProfilePic,
      });
    }
  });

  socket.on('blockUser', ({ userId, targetId }) => {
    const user = roomUtils.findConnectedUser(targetId);

    if (user) {
      io.to(user.socketId).emit('userBlocked', { userId });
    }
  });

  socket.on('unblockUser', ({ userId, targetId }) => {
    const user = roomUtils.findConnectedUser(targetId);

    if (user) {
      io.to(user.socketId).emit('userUnblocked', { userId });
    }
  });

  socket.on('callUser', async ({ userId, userToCall, peerId }, cb) => {
    const info = await getMutualInfo(userId, userToCall, peerId);

    if (info.error) return socket.emit('callError');

    const self = roomUtils.findConnectedUser(userId);
    if (self && self.call) {
      if (self.call === info.recipient) {
        return socket.emit('cannotCallSameUser');
      }

      return socket.emit('alreadyOnCall');
    }

    roomUtils.EditData(userId, info.recipient);
    const user = roomUtils.findConnectedUser(info.recipient);

    if (user) {
      if (user.call) {
        socket.emit('userBusy', info);
        return roomUtils.EditData(userId, null);
      }

      roomUtils.EditData(info.recipient, info.sender);
      io.to(user.socketId).emit('callUserToClient', info);
    }
    cb(info);
  });

  socket.on('endCall', (data) => {
    const client = roomUtils.findConnectedUser(data.sender);

    if (client) {
      client.call && io.to(client.socketId).emit('endCallToClient', data);

      roomUtils.EditData(client.userId, null);

      if (client.call) {
        const clientCall = roomUtils.findConnectedUser(client.call);

        clientCall && io.to(clientCall.socketId).emit('endCallToClient', data);

        roomUtils.EditData(client.call, null);
      }
    }
  });

  socket.on('disconnect', () => {
    // const connected = roomUtils.users.find(
    //   (user) => user.socketId.toString() === socket.id.toString()
    // );

    // console.log('connected was ', connected);
    // if (connected && connected.call) {
    //   const client = roomUtils.findConnectedUser(connected.call);
    //   if (client) {
    //     io.to(client.socketId).emit('callerDisconnected');
    //   }
    // }
    roomUtils.findCall(socket.id, io);

    const users = roomUtils.removeUser(socket.id);
    console.log(users);
  });

  socket.on('off', () => {
    // const user = .findBySocketId(socket.id);
    // console.log('all users ', roomUtils.users);

    // if (user && user.call) {
    //   const client = roomUtils.findConnectedUser(user.call);
    //   if (client) {
    //     io.to(client.socketId).emit('callerDisconnected');
    //   }
    // }
    roomUtils.findCall(socket.id, io);

    const users = roomUtils.removeUser(socket.id);
    console.log(users);
  });
});

// Finally, Start the API
server.listen(PORT, () => {
  console.log('Server listening on PORT ' + PORT);
});
