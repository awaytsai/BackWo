const Noti = require("../model/notification_model");

const getNotification = async (req, res) => {
  const userId = req.decoded.payload.id;
  // console.log(userId);
  const notificationData = await Noti.getNotification(userId);
  res.json(notificationData);
};

const deleteNotification = async (req, res) => {
  const id = req.body.id;
  console.log(id);
  const deleteResult = await Noti.deleteNotification(id);
  console.log(deleteResult);
  res.json({ status: "updated" });
};

module.exports = {
  getNotification,
  deleteNotification,
};
