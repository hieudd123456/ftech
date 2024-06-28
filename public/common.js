var socket = io.connect('/');
setInterval(function(){
  socket.emit("data",{data:"hello world"});
},3000)

