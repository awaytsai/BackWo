const Noti = require("../model/notification_model");

const getNotification = async (req, res) => {
  const userId = req.decoded.payload.id;
  const notificationData = await Noti.getNotification(userId);
  return res.status(200).json(notificationData);
};

const deleteNotification = async (req, res) => {
  const id = req.body.id;
  await Noti.deleteNotification(id);
  return res.status(200).json({ status: "updated" });
};

module.exports = {
  getNotification,
  deleteNotification,
};
