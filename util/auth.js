const jwt = require("jsonwebtoken");

// jwt
function jwtTokenGenerater(payload) {
  const expiresIn = "1h";
  const randomNum = Math.floor(Math.random() * 100);
  const token = jwt.sign(
    { payload, randomNum },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn }
  );
  return token;
}

// auth
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader && authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "please login again" });
      req.decoded = decoded;
      next();
    });
  } else {
    res.status(401).json({ message: "you don't have access" });
  }
}

module.exports = {
  jwtTokenGenerater,
  authMiddleware,
};
