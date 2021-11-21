const db = require("../db");
const crypto = require("crypto");
const { jwtTokenGenerater, userinfoFormat } = require("../util/auth");
const fetch = require("node-fetch");

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

const signUp = async (provider, name, email, password, picture) => {
  const conn = await db.getConnection();
  try {
    await conn.query("START TRANSACTION");

    const checkEmail = await conn.query(
      "SELECT email FROM user WHERE email = ? FOR UPDATE",
      [email]
    );
    if (checkEmail[0].length > 0) {
      await conn.query("COMMIT");
      return { error: "email 已經被註冊過，請更換" };
    }
    const hashPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const result = await conn.query(
      "INSERT INTO user(provider, name, email, password, picture) VALUES (?,?,?,?,?) ;",
      [provider, name, email, hashPassword, picture]
    );
    const userId = result[0].insertId;
    const payload = {
      id: userId,
      name: name,
      email: email,
      provider: provider,
      picture: picture,
    };
    const token = await jwtTokenGenerater(payload);
    const userResult = userinfoFormat(token, payload);

    await conn.query("COMMIT");
    return userResult;
  } catch (error) {
    console.log(error);
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

const nativeSignIn = async (email, password) => {
  const conn = await db.getConnection();

  try {
    await conn.query("START TRANSACTION");

    const [users] = await conn.query("SELECT * FROM user WHERE email = ? ;", [
      email,
    ]);
    const user = users[0];
    const hashPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    if (user.password !== hashPassword) {
      await conn.query("COMMIT");
      return { error: "密碼錯誤" };
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      provider: user.provider,
      picture: user.picture,
    };

    const token = await jwtTokenGenerater(payload);
    const userResult = userinfoFormat(token, payload);
    return userResult;
  } catch (error) {
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

const getFacebookProfile = async function (access_token) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v11.0/me?fields=id,name,email,picture&access_token=${access_token}`
    );
    const data = await response.json();
    console.log(data);
    return data;
  } catch (e) {
    console.log(e);
    throw "Permissions Error: facebook access token is wrong";
  }
};

const facebookSignIn = async (id, name, email, picture) => {
  const conn = await db.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [users] = await conn.query(
      "SELECT id FROM user WHERE email = ? FOR UPDATE ;",
      [email]
    );
    const provider = "facebook";
    let userId;
    if (users.length === 0) {
      // insert db
      const [result] = await conn.query(
        "INSERT INTO user(provider, name, email, picture) VALUES (?,?,?,?) ;",
        [provider, name, email, picture]
      );
      userId = result.insertId;
    } else {
      // Update existed user
      userId = users[0].id;
      const queryStr = "UPDATE user SET picture = ?, name = ? WHERE id = ?";
      await conn.query(queryStr, [picture, name, userId]);
    }
    const payload = {
      id: userId,
      name: name,
      email: email,
      provider: provider,
      picture: picture,
    };
    const token = await jwtTokenGenerater(payload);
    const userResult = userinfoFormat(token, payload);

    await conn.query("COMMIT");
    return userResult;
  } catch (error) {
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

module.exports = {
  getUserData,
  getPendingUserData,
  signUp,
  nativeSignIn,
  getFacebookProfile,
  facebookSignIn,
};
