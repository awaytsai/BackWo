const db = require("../db");

const insertNotification = async (petPostIds, postId) => {
  const ids = petPostIds.map((id) => [id, postId]);
  const notification = await db.query(
    `INSERT INTO notification (find_pets_id, find_owners_id) VALUES ?`,
    [ids]
  );
  return notification;
};

module.exports = { insertNotification };
