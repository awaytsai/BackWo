const db = require("../db");

const insertNotification = async (petPostIds, postId, notiStauts) => {
  const ids = petPostIds.map((id) => [id, postId, notiStauts]);
  const notification = await db.query(
    `INSERT INTO notification (find_pets_id, find_owners_id, status) VALUES ?`,
    [ids]
  );
  return notification;
};

const getNotification = async (userId) => {
  const [notification] = await db.query(
    `SELECT id, find_owners_id, time FROM notification WHERE status = "exist"
    AND find_pets_id IN (SELECT id FROM pet_post WHERE user_id = ?) ORDER BY id DESC;`,
    [userId]
  );
  return notification;
};
const deleteNotification = async (id) => {
  const [notification] = await db.query(
    `UPDATE notification SET status = 'delete' WHERE id = ?`,
    [id]
  );
  return notification;
};

const updateFindOwnersNoti = async (id) => {
  const [notification] = await db.query(
    `UPDATE notification SET status = 'delete' WHERE find_owners_id = ?`,
    [id]
  );
  return notification;
};

const updateFindPetsNoti = async (id) => {
  const [notification] = await db.query(
    `UPDATE notification SET status = 'delete' WHERE find_pets_id = ?`,
    [id]
  );
  return notification;
};

module.exports = {
  insertNotification,
  getNotification,
  deleteNotification,
  updateFindOwnersNoti,
  updateFindPetsNoti,
};
