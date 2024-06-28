var socket = io();
setInterval(function(){
  socket.emit("data",{data:"hello world"});
},3000)

