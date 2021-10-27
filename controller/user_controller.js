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
  if (validator.isEmail(email)) {
    res.status(400).json({ error: "請輸入正確的 email" });
    return;
  }
  // check existing email
  const checkExistEmail = await User.checkExistedEmail(email);
  if (checkExistEmail.count > 0) {
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

  // create jwt token
  const payload = {
    id: userId,
    name: name,
    email: email,
    provider: provider,
    picture: picture,
  };
  const token = await Auth.jwtTokenGenerater(payload);

  res.json({});
};

module.exports = { signUp };
