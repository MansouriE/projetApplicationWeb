const { verifyToken } = require("../config/jwt");

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token manquant" });

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(403).json({ error: "Token invalide ou expiré" });
  }
}

module.exports = authMiddleware;
