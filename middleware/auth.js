const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ detail: "No token" });

  try {
    const token = h.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ detail: "Invalid token" });
  }
};
