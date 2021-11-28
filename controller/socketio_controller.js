const Chat = require("../model/chat_model");
const LIMIT = 20;
const MAXLENGTH = 255;

const socketController = (io) => {
  // connect io
  io.on("connection", (socket) => {
    socket.on("joinroom", async (usersData) => {
      const historyMessage = await Chat.getChatMessage(usersData.roomId, LIMIT);
      // emit hsitory message
      socket.emit("historymessage", historyMessage, usersData);
      // join room
      socket.join(usersData.roomId);
      // listen on chatmessage
      socket.on("chatMessage", async (msg, usersData) => {
        // format messages
        if (msg.length > MAXLENGTH) {
          const errorMessage = "訊息過長無法傳送";
          io.to(usersData.roomId).emit("error", errorMessage);
        }
        if (msg.length <= MAXLENGTH) {
          const message = formatMessage(msg, usersData);
          await Chat.insertChatMessage(message);
          io.to(usersData.roomId).emit("chatMessage", msg, usersData);
        }
      });
    });
  });
};

function formatMessage(msg, usersData) {
  return [usersData.senderId, usersData.receiverId, msg, usersData.roomId];
}

module.exports = { socketController };
