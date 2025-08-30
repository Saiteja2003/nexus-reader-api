// middleware/auth.js
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  // 1. Get the token from the request header
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  // Headers look like "Bearer <token>". We just want the token part.
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token format is invalid" });
  }

  try {
    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // 3. If valid, add the user's ID to the request object
    req.user = decoded;
    next(); // 4. Pass control to the next function (the route handler)
  } catch (error) {
    res.status(401).json({ error: "Token is not valid" });
  }
}

module.exports = authMiddleware;
