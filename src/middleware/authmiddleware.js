import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1];

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next(); 
  } catch (error) {
    console.error("JWT Error:", error.message);
    res.status(403).json({ error: "Invalid or expired token" });
  }
}
