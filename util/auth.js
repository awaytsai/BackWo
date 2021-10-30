const jwt = require("jsonwebtoken");

// jwt
async function jwtTokenGenerater(payload) {
  const expiresIn = "24h";
  const randomNum = Math.floor(Math.random() * 100);
  const token = jwt.sign(
    { payload, randomNum },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn }
  );
  return token;
}

// auth check login status
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader && authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "請重新登入" });
      req.decoded = decoded;
      next();
    });
  } else {
    res.status(401).json({ message: "請先登入或註冊" });
  }
}

// auth check for rendering chatbutton
async function authMiddlewareforChat(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader && authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        res.locals.message = "loginagain";
        return next();
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    next();
  }
}

function userinfoFormat(token, payload) {
  const expiresIn = "1h";
  const registedResponse = {
    access_token: token,
    access_expired: expiresIn,
    user: {
      id: payload.id,
      provider: payload.provider,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    },
  };
  return registedResponse;
}

module.exports = {
  jwtTokenGenerater,
  authMiddleware,
  userinfoFormat,
  authMiddlewareforChat,
};
