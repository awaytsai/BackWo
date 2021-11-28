const User = require("../model/user_model");
const Chat = require("../model/chat_model");
const { getOtherUserId } = require("../util/util");

const getChatroomAccess = async (req, res) => {
  const room = req.query.room;
  const userId = req.decoded.payload.id;
  const roomids = room.split("-", 2);
  const otherUserId = parseInt(roomids.filter((id) => id != userId)[0]);
  const roomIdByUser = roomids.filter((id) => id == userId);

  if (room == "0") {
    return res.json({ message: "blankroom" });
  }
  if (
    roomids[0] == roomids[1] ||
    roomIdByUser.length == 0 ||
    parseInt(roomids[0]) > parseInt(roomids[1])
  ) {
    return res.status(400).json({ message: "noaccess" });
  }

  const ids = [];
  ids.push(userId, otherUserId);
  const senderData = await User.getUserData(userId);
  const receiverData = await User.getUserData(otherUserId);

  if (senderData.length == 0 || receiverData.length == 0) {
    return res.status(401).json({ message: "noaccess" });
  }

  const formatUserData = {
    senderId: senderData[0].id,
    senderName: senderData[0].name,
    senderPicture: senderData[0].picture,
    receiverId: receiverData[0].id,
    receiverName: receiverData[0].name,
    receiverPicture: receiverData[0].picture,
    roomId: room,
  };
  return res.status(200).json(formatUserData);
};

const getChatroomRecord = async (req, res) => {
  const userId = req.query.uid;
  let existingIds = await Chat.getExistingRoomIds(userId);
  if (existingIds.length == 0) {
    return res.json({ message: "no existing rooms" });
  }

  getOtherUserId(existingIds, userId);
  // get last records by roomids
  const ids = existingIds.map((data) => Object.values(data));
  const roomRecords = await Chat.getRoomLastRecord(ids);
  return res.status(200).json(roomRecords);
};

const getUserLatestRoomId = async (req, res) => {
  const userId = req.decoded.payload.id;
  const latestRoomId = await Chat.getLatestRoomId(userId);
  if (latestRoomId.length == 0) {
    return res.json({ message: "noExistingRoom" });
  } else {
    return res.status(200).json(latestRoomId[0]);
  }
};

module.exports = {
  getChatroomAccess,
  getChatroomRecord,
  getUserLatestRoomId,
};
