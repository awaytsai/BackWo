const validator = require("validator");
const User = require("../model/user_model");
const Auth = require("../util/auth");
const crypto = require("crypto");

const signUp = async (req, res) => {
  const { email, password } = req.body;
  let { name } = req.body;
  name = validator.escape(name);
  const provider = "native";
  const picture = `${process.env.CLOUDFRONT}/member_default_image.png`;

  if (!name || !email || !password) {
    res.status(400).json({ error: "請輸入名字、email 和密碼" });
    return;
  }
  if (!validator.isEmail(email)) {
    res.status(400).json({ error: "請輸入正確的 email" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "請輸入至少6位數密碼" });
  }
  //////// race condition
  const result = await User.signUp(provider, name, email, password, picture);
  if (result.error) {
    res.status(403).json({ error: result.error });
    return;
  }
  return res.status(200).json(result);
  ////////
  // // check existing email
  // const checkExistEmail = await User.checkExistedEmail(email);
  // if (checkExistEmail[0].count > 0) {
  //   res.status(400).json({ error: "email 已經被註冊過，請更換" });
  //   return;
  // }
  // // hash password
  // const hashPassword = crypto
  //   .createHash("sha256")
  //   .update(password)
  //   .digest("hex");
  // // insert user data
  // const userData = await User.insertUserData(
  //   provider,
  //   name,
  //   email,
  //   hashPassword,
  //   picture
  // );
  // const userId = userData.insertId;
  // // console.log(userId);
  // // format response
  // const payload = {
  //   id: userId,
  //   name: name,
  //   email: email,
  //   provider: provider,
  //   picture: picture,
  // };
  // const token = await Auth.jwtTokenGenerater(payload);
  // const userResult = Auth.userinfoFormat(token, payload);
  // // console.log(userResult);
  // res.status(200).json(userResult);
};

const signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "請輸入 email 和密碼" });
    return;
  }
  try {
    const result = await User.nativeSignIn(email, password);
    console.log(result);
    return res.status(200).json(result);
  } catch (error) {
    return { error };
  }
};

const facebookSignIn = async (req, res) => {
  const { access_token } = req.body;
  // check access token
  if (!access_token) {
    res.status(400).json({ error: "no access token" });
    return;
  }
  try {
    // get fb profile data
    const profile = await User.getFacebookProfile(access_token);
    const { id, name, email, picture } = profile;
    if (!id || !name || !email) {
      res.status(400).json({ error: "no access token" });
      return;
    }
    // signin
    const result = await User.facebookSignIn(id, name, email, picture);
    return result;
  } catch (error) {
    return { error: error };
  }
};

// const signIn = async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     res.status(400).json({ error: "請輸入 email 和密碼" });
//     return;
//   }
//   const userData = await User.getUserDataByEmail(email);
//   if (userData.length == 0) {
//     res.status(400).json({ error: "email 不存在" });
//     return;
//   }
//   const hashPassword = crypto
//     .createHash("sha256")
//     .update(password)
//     .digest("hex");

//   if (userData[0].password !== hashPassword) {
//     res.status(400).json({ error: "密碼錯誤" });
//     return;
//   }
//   // format response
//   const payload = {
//     id: userData[0].id,
//     name: userData[0].name,
//     email: userData[0].email,
//     provider: userData[0].provider,
//     picture: userData[0].picture,
//   };
//   const token = await Auth.jwtTokenGenerater(payload);
//   const userResult = Auth.userinfoFormat(token, payload);
//   res.status(200).json(userResult);
// };

const getUserData = async (req, res) => {
  const payload = req.decoded.payload;
  const userData = {
    id: payload.id,
    name: payload.name,
    picture: payload.picture,
  };
  console.log(userData);
  res.json({ userData });
};

module.exports = { signUp, signIn, getUserData };
