const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: '112.164.10.150',
  user: 'test',
  password: 'Inforex$567890',
  database: 'mango',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';
const adminName = 'Admin';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    console.log('joinRoom ... ', username, room)
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', (target) => {
    console.log('disconnect target ... ', target);
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
  socket.on('bomb', (room) => {
    const ms = 3000;
    io.to(room).emit('leave', ms);

    io.to(room).emit(
        'message',
        formatMessage(adminName, `방이 폭파되었습니다. ${ms/1000} 초 뒤에 방이 폭파합니다.`)
    );
  });

  socket.on('login', (loginId) => {
    console.log(' on login ', connection);
    // db 조회

    connection.execute(
        'SELECT * FROM member_simple where login_id = ?'
        , [loginId]
        ,function(err, results, fields) {
          if(results.length < 1){

          }
          console.log(loginId, results); // results contains rows returned by server
        }
    );

    // connection.execute(
    //     'SELECT * FROM `member_simple` WHERE `login_id` = ?',
    //     [loginId],
    //     function(err, results, fields) {
    //       console.log(`err ... `, err);
    //       console.log(loginId, results); // results contains rows returned by server
    //       // console.log(fields); // fields contains extra meta data about results, if available
    //
    //       // If you execute same statement again, it will be picked from a LRU cache
    //       // which will save query preparation time and give better performance
    //     }
    // );

    if( true ){
      // emit joinRoom
    } else {
      console.log('존재하지 않는 ID')
    }
  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
