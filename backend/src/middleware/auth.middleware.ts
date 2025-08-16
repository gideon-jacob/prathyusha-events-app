import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  userId: string;
  username: string;
  role?: string; // Assuming a role might be part of the user payload
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload; // Attach user payload to the request
    }
  }
}

const jwtSecret = process.env.JWT_SECRET || "supersecretjwtkey"; // Must match the secret used for signing

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ message: "Authentication token required." });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      // Token is invalid, expired, or malformed
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    req.user = user as UserPayload;
    next();
  });
};

export const authorizeRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }
    next();
  };
};
