var socket = io("http://" + location.hostname);

setInterval(function(){
  socket.emit("data",{data:"hello world"});
},3000)

