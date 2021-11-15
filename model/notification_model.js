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
    `SELECT id, find_owners_id, time FROM notification WHERE status = "created"
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

const updateNotification = async (status, foid, fpid) => {
  const [notification] = await db.query(
    `UPDATE notification SET status = ? WHERE find_owners_id = ? and find_pets_id = ?`,
    [status, foid, fpid]
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

const getNotiMailData = async () => {
  const [notification] = await db.query(
    `SELECT u.name, u.email, n.find_owners_id AS f_id, n.id AS n_id FROM 
    (SELECT id,find_pets_id, find_owners_id  FROM notification WHERE mail_status is null and status = 'created') AS n
    INNER JOIN pet_post AS p
    ON n.find_pets_id = p.id
    INNER JOIN user AS u
    ON u.id = p.user_id ; `
  );
  return notification;
};

const getNotiMailPhoto = async () => {
  const [notification] = await db.query(
    `SELECT p.photo FROM 
    (SELECT  find_owners_id  FROM notification WHERE mail_status is null and status = 'created') AS n
    INNER JOIN pet_post AS p
    ON n.find_owners_id = p.id ;`
  );
  return notification;
};

const updateNotiMailStatus = async (id) => {
  const [notification] = await db.query(
    `UPDATE notification SET mail_status = 'send' WHERE id in (?)`,
    [id]
  );
  return notification;
};

const getMatchMailData = async () => {
  const [notification] = await db.query(
    `SELECT u.name, u.email, u.picture, m.id AS mid, m.thank_message, m.sender, m.find_owner_id FROM 
    (SELECT id, thank_message, sender, find_owner_id FROM match_list 
    WHERE status ='pending' and mail_status is null) AS m
    INNER JOIN user AS u
    ON u.id = m.sender ; `
  );
  return notification;
};

const getMatchSenderData = async () => {
  const [notification] = await db.query(
    `SELECT u.name, u.picture FROM
    (SELECT sender FROM match_list WHERE status ='pending' and mail_status is null) AS m
    INNER JOIN user AS u
    ON u.id = m.sender; `
  );
  return notification;
};

const updateMatchMailStatus = async (id) => {
  const [notification] = await db.query(
    `UPDATE match_list SET mail_status = 'send' WHERE id in (?)`,
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
  updateNotification,
  getNotiMailData,
  getNotiMailPhoto,
  updateNotiMailStatus,
  getMatchMailData,
  getMatchSenderData,
  updateMatchMailStatus,
};
