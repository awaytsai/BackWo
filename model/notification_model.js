const db = require("../db");

const insertNotification = async (petPostIds, postId) => {
  const ids = petPostIds.map((id) => [id, postId]);
  const notification = await db.query(
    `INSERT INTO notification (find_pets_id, find_owners_id) VALUES ?`,
    [ids]
  );
  return notification;
};

const getNotification = async (userId) => {
  const [notification] = await db.query(
    `SELECT find_owners_id FROM notification WHERE find_pets_id IN (SELECT id FROM pet_post WHERE user_id = ?);`,
    [userId]
  );
  return notification;
};

module.exports = { insertNotification, getNotification };
