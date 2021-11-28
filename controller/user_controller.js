const validator = require("validator");
const User = require("../model/user_model");

const signUp = async (req, res) => {
  const { email, password } = req.body;
  let { name } = req.body;
  const provider = "native";
  const picture = `${process.env.CLOUDFRONT}/member_default_image.png`;
  const passwordLenMax = 6;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "請輸入名字、email 和密碼" });
  }

  if (name) {
    name = validator.escape(name);
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "請輸入正確的 email" });
  }
  if (password.length < passwordLenMax) {
    return res.status(400).json({ error: "請輸入至少6位數密碼" });
  }

  const result = await User.signUp(provider, name, email, password, picture);
  if (result.error) {
    return res.status(403).json({ error: result.error });
  }

  return res.status(200).json(result);
};

const signIn = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "請輸入 email 和密碼" });
  }
  try {
    const result = await User.nativeSignIn(email, password);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    return res.status(200).json(result);
  } catch (error) {
    return { error };
  }
};

const facebookSignIn = async (req, res) => {
  const { access_token } = req.body;
  if (!access_token) {
    return res.status(400).json({ error: "no access token" });
  }
  try {
    // get fb profile data
    const profile = await User.getFacebookProfile(access_token);
    const { id, name, email } = profile;
    const picture = profile.picture.data.url;
    if (!id || !name || !email) {
      return res.status(400).json({ error: "no access token" });
    }
    const result = await User.facebookSignIn(id, name, email, picture);
    return res.json(result);
  } catch (error) {
    return { error };
  }
};

const getUserData = async (req, res) => {
  const payload = req.decoded.payload;
  const userData = {
    id: payload.id,
    name: payload.name,
    picture: payload.picture,
  };
  return res.json({ userData });
};

module.exports = { signUp, signIn, getUserData, facebookSignIn };
