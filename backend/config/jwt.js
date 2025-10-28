const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET || "cleSuperSecrete!";

function signToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: "1h" });
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret);
}

module.exports = { signToken, verifyToken, jwtSecret };