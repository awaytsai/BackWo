const Chat = require("../model/chat_model");
const limit = 20;

const socketController = (io) => {
  // connect io
  io.on("connection", (socket) => {
    socket.on("joinroom", async (usersData) => {
      console.log(
        `${usersData.senderName} join room with ${usersData.receiverName}`
      );
      const historyMessage = await Chat.getChatMessage(usersData.roomId, limit);
      // emit hsitory message
      socket.emit("historymessage", historyMessage, usersData);
      // join room
      socket.join(usersData.roomId);
      // listen on chatmessage
      socket.on("chatMessage", async (msg, usersData) => {
        // format messages
        if (msg.length > 255) {
          const errorMessage = "訊息過長無法傳送";
          io.to(usersData.roomId).emit("error", errorMessage);
        }
        if (msg.length <= 255) {
          const message = formatMessage(msg, usersData);
          const result = await Chat.insertChatMessage(message);
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
