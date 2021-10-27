//
// build a room
const socketController = (io) => {
  // socket io connection
  io.on("connection", (socket) => {
    console.log(socket.id);
    console.log("a user connected");
  });

  // emit
  io.on("connection", (socket) => {
    socket.on("chatMessage", (msg) => {
      console.log(msg);
      // store every message into db (roomid, userid, time, message)
      io.emit("chatMessage", `${socket.id}says: ${msg}`);
    });
  });
};

module.exports = { socketController };
