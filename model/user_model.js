const db = require("../db");

const checkExistedEmail = async (email) => {
  const [existingEmail] = await db.query(
    "SELECT count(email) as count FROM user WHERE email = ? ;",
    [email]
  );
  return existingEmail;
};

const insertUserData = async (provider, name, email, hashPassword, picture) => {
  const [existingEmail] = await db.query(
    "INSERT INTO user(provider, name, email, password, picture) VALUES (?,?,?,?,?) ;",
    [provider, name, email, hashPassword, picture]
  );
  return existingEmail;
};

const getUserDataByEmail = async (email) => {
  const [userData] = await db.query("SELECT * FROM user WHERE email = ?;", [
    email,
  ]);
  return userData;
};

const getUserData = async (id) => {
  const [userData] = await db.query("SELECT * FROM user WHERE id = ?;", [id]);
  return userData;
};

const getPendingUserData = async (id) => {
  const [userData] = await db.query(
    `SELECT u.id, u.name, u.picture, m.id as mid ,m.sender, m.find_pet_id, m.thank_message
    FROM user as u 
    INNER JOIN match_list as m 
    ON u.id = m.sender 
    WHERE m.status='pending' and m.find_owner_id in (?) 
    and u.id in 
    (SELECT sender FROM match_list WHERE status ='pending' and find_owner_id in (?));`,
    [id, id]
  );
  return userData;
};

module.exports = {
  checkExistedEmail,
  insertUserData,
  getUserDataByEmail,
  getUserData,
  getPendingUserData,
};
