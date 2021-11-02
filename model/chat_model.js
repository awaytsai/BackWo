const db = require("../db");

const insertChatMessage = async (message) => {
  const [chatResult] = await db.query(
    "INSERT INTO chat(sender, receiver, message, room_id) VALUES (?) ;",
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

const getExistingRoomIds = async (userId) => {
  const [roomRecord] = await db.query(
    "SELECT room_id FROM chat WHERE (sender= ? OR receiver = ?) GROUP BY room_id;",
    [userId, userId]
  );
  return roomRecord;
};

const getRoomLastRecord = async (ids) => {
  const result = [];
  for (let i = 0; i < ids.length; i++) {
    const [roomRecord] = await db.query(
      "SELECT c.sender, c.receiver, c.message, c.time, c.room_id, u.name, u.picture FROM chat as c INNER JOIN user as u ON c.receiver = u.id WHERE c.room_id = ? and c.receiver = ? ORDER BY time DESC LIMIT 1;",
      ids[i]
    );
    result.push(roomRecord);
  }
  return result;
};

module.exports = {
  insertChatMessage,
  getChatMessage,
  getExistingRoomIds,
  getRoomLastRecord,
};
