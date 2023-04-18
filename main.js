

var path = require('path');
var express = require('express')
var serveStatic = require('serve-static')
var app = express()

const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

var htmlPath = path.join(__dirname, 'html');

//route functions 
io.dbroutines = require('./routes/dbroutines.js')();
io.mtg = require('./routes/mtg.js')(io);
io.mtg.init();
io.mtgsave = require('./routes/mtgsave.js')(io);
io.login = require('./routes/login.js')(io);



io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on("create-account",io.login.createAccount);
  socket.on("login-account",io.login.loginAccount);
  socket.on("mtg:search",io.mtg.search);
  socket.on("mtg:searchbyids",io.mtg.searchbyids);

  socket.on("mtg:save",io.mtgsave.save);
  socket.on("mtg:load",io.mtgsave.load);
});


app.use(serveStatic(htmlPath));
server.listen(2323);
