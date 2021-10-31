const User = require("../model/user_model");
const Chat = require("../model/chat_model");

const getChatroomAccess = async (req, res) => {
  const room = req.query.room;
  const userId = req.decoded.payload.id;
  // check if user is in roomid
  const roomids = room.split("-", 2);
  const user2Id = parseInt(roomids.filter((id) => id != userId)[0]);
  const checkRoom = roomids.filter((id) => id == userId);
  if (checkRoom.length == 0) {
    res.json({ message: "noaccess" });
    return;
  }
  // ids: [userid(self), user2id]
  const ids = [];
  ids.push(userId, user2Id);
  console.log(ids);
  // get sender and receiver ids
  const senderData = await User.getUserData(userId);
  const receiverData = await User.getUserData(user2Id);
  // format sender/receiver data
  const formatUserData = {
    senderId: senderData[0].id,
    senderName: senderData[0].name,
    senderPicture: senderData[0].picture,
    receiverId: receiverData[0].id,
    receiverName: receiverData[0].name,
    receiverPicture: receiverData[0].picture,
    roomId: room,
  };
  //   console.log(formatUserData);
  res.json(formatUserData);
};

const getChatroomRecord = async (req, res) => {
  const userId = req.query.uid;
  // check existing room_id by uid
  let existingIds = await Chat.getExistingRoomIds(userId);
  console.log(existingIds);
  if (existingIds.length == 0) {
    res.json({ message: "no existing rooms" });
    return;
  }

  // get other users ids
  existingIds.map((data) => {
    let ids = data.room_id.split("-");
    ids.forEach((id) => {
      if (id != userId) {
        data.othersId = id;
      }
    });
  });
  //   console.log(existingIds);

  // get last records by roomids
  const ids = existingIds.map((data) => Object.values(data));
  //   console.log(ids);
  const roomRecords = await Chat.getRoomLastRecord(ids);
  console.log(roomRecords);
  res.json(roomRecords);
};

module.exports = {
  getChatroomAccess,
  getChatroomRecord,
};
