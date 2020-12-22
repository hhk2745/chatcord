
const bomb = document.getElementById('bomb');
const room = document.getElementById('room');

const socket = io();

bomb.addEventListener("click", ()=>{
  // Join chatroom
  socket.emit('bomb', room.value);
})


