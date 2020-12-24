const socket = io();

$("#join-chat").on('click', ()=>{
    if($("#username").val().length < 1) return;
    socket.emit('login', $("#username").val());
})