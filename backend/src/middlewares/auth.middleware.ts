import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const { token } = req.cookies;

  if (!token) {
    return res
      .status(401)
      .json({ error: "Access denied. No session token provided." });
  }

  try {
    const secret = process.env.JWT_SECRET || "fall-back string";
    const decoded = jwt.verify(token, secret) as any;

    (req as any).user_id = decoded.userId;

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired session token." });
  }
}

export default requireAuth;
