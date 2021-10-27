const validator = require("validator");
const User = require("../model/user_model");
const Auth = require("../util/auth");
const crypto = require("crypto");

const signUp = async (req, res) => {
  const { name, email, password } = req.body;
  const provider = "native";
  const picture = "";
  if (!name || !email || !password) {
    res.status(400).json({ error: "請輸入名字、email 和密碼" });
    return;
  }
  if (!validator.isEmail(email)) {
    res.status(400).json({ error: "請輸入正確的 email" });
    return;
  }
  // check existing email
  const checkExistEmail = await User.checkExistedEmail(email);
  if (checkExistEmail[0].count > 0) {
    res.status(400).json({ error: "email 已經被註冊過，請更換" });
    return;
  }
  // hash password
  const hashPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
  // insert user data
  const userData = await User.insertUserData(
    provider,
    name,
    email,
    hashPassword,
    picture
  );
  const userId = userData.insertId;
  console.log(userId);
  // format response
  const payload = {
    id: userId,
    name: name,
    email: email,
    provider: provider,
    picture: picture,
  };
  const token = await Auth.jwtTokenGenerater(payload);
  const userResult = Auth.userinfoFormat(token, payload);
  res.status(200).json(userResult);
};

const signIn = async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "請輸入 email 和密碼" });
    return;
  }
  const userData = await User.getUserData(email);
  console.log(userData);
  if (userData.length == 0) {
    res.status(400).json({ error: "email 不存在" });
    return;
  }
  const hashPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  if (userData[0].password !== hashPassword) {
    res.status(400).json({ error: "密碼錯誤" });
    return;
  }
  // format response
  const payload = {
    id: userData[0].id,
    name: userData[0].name,
    email: userData[0].email,
    provider: userData[0].provider,
    picture: userData[0].picture,
  };
  const token = await Auth.jwtTokenGenerater(payload);
  const userResult = Auth.userinfoFormat(token, payload);
  res.status(200).json(userResult);
};

module.exports = { signUp, signIn };
