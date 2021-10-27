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

const getUserData = async (email) => {
  const [userData] = await db.query("SELECT * FROM user WHERE email = ?;", [
    email,
  ]);
  return userData;
};

module.exports = {
  checkExistedEmail,
  insertUserData,
  getUserData,
};
