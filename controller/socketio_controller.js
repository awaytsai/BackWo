const Chat = require("../model/chat_model");

const rooms = [];
const messageContent = [];
const socketController = (io) => {
  io.on("connection", (socket) => {
    socket.on("joinroom", async (usersData) => {
      // 1. check room, if existed
      console.log("server join room");
      const checkRoom = checkRoomExisted(usersData.roomId);
      if (checkRoom.length == 0) {
        rooms.push(usersData.roomId);
      }
      if (checkRoom.length != 0) {
        // get history data
        const limit = 20;
        const historyMessage = await Chat.getChatMessage(
          usersData.roomId,
          limit
        );
        // emit it to front end
        // console.log(historyMessage);
        socket.emit("historymessage", historyMessage, usersData);
      }
      // 1-1. get data from db, send to client to render
      // 2. join room
      socket.join(usersData.roomId);

      // someone join room
      // socket.emit("online", `${usersData.senderId} on line`);

      // 3. listen on chatmessage
      socket.on("chatMessage", async (msg, usersData) => {
        // format messages(roomid, sender, receiver, time, message)
        // store into global (sender, receiver, message, time, roomid)
        const message = formatMessage(msg, usersData);
        // console.log(message);
        // messageContent.push(message);
        const result = await Chat.insertChatMessage(message);
        // console.log(result);
        // send message to client
        io.to(usersData.roomId).emit("chatMessage", msg, usersData);
      });

      // disconnect
      // socket.on("disconnect", () => {
      //   io.to(usersData.roomId).emit(
      //     "leave",
      //     `${usersData.senderName} has left the chat`
      //   );
      // });
    });

    // // join room
    // socket.emit("message", formatMessage(username, "welcome to chatcord!"));

    // // brocast when a user connect (僅有新加入的人自己不會收到)
    // socket.broadcast.emit(
    //   "message",
    //   formatMessage(username, "a user has joined the chat")
    // );

    // // runs when clients disconnects
    // socket.on("disconnect", () => {
    //   // store every message into db (roomid, sender, receiver, time, message)
    //   io.emit("message", formatMessage(username, "a user has left the chat"));
    // });

    // listen for  chatmessage
    // socket.on("chatMessage", (msg) => {
    //   console.log(msg);
    //   // store every message into db (roomid, userid, time, message)
    //   // send message to client
    //   io.emit("chatMessage", formatMessage("USER", `${socket.id}says: ${msg}`));
    // });
  });
};

function checkRoomExisted(roomId) {
  return rooms.filter((data) => data === roomId);
}

// (sender, receiver, message, time, roomid)
function formatMessage(msg, usersData) {
  return [usersData.senderId, usersData.receiverId, msg, usersData.roomId];
}

module.exports = { socketController };
