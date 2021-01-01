'use strict';

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 7000;
const path = require('path');

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, './public')));

app.get('/', (req, res) => {
  res.render('index');
});

io.on('connection', (socket) => {
  // 接続された時に動く処理
  console.log('connected');

  // クライアント側からメッセージが送られてきた時の処理
  socket.on('message', (msg) => {
    // 受け取ったメッセージをクライアントに返す
    console.log('message: ', msg);
    io.emit('message', msg);
  });
});

http.listen(PORT, () => {
  console.log('server listening. Port: ' + PORT);
});

module.exports = app;