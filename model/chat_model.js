const db = require("../db");

const insertChatMessage = async (message) => {
  const [chatResult] = await db.query(
    "INSERT INTO chat(sender, receiver, message, time, room_id) VALUES (?) ;",
    [message]
  );
  return chatResult;
};

const getChatMessage = async (roomId, limit) => {
  const [chatResult] = await db.query(
    "SELECT * FROM chat WHERE room_id = ? order by time DESC limit ?;",
    [roomId, limit]
  );
  return chatResult;
};

module.exports = {
  insertChatMessage,
  getChatMessage,
};
