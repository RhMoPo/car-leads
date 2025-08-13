import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { getIronSession } from "iron-session";

const sessionOptions = {
  password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long",
  cookieName: "admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
};

export async function validateAdminPassword(password: string): Promise<boolean> {
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminPasswordHash) {
    throw new Error("ADMIN_PASSWORD_HASH not configured");
  }
  
  return await bcrypt.compare(password, adminPasswordHash);
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await getIronSession(req, res, sessionOptions);
    
    if (!session.admin) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: "Session error" });
  }
}

export async function setAdminSession(req: Request, res: Response) {
  const session = await getIronSession(req, res, sessionOptions);
  session.admin = true;
  await session.save();
}

export async function clearAdminSession(req: Request, res: Response) {
  const session = await getIronSession(req, res, sessionOptions);
  session.destroy();
}

declare module "iron-session" {
  interface IronSessionData {
    admin?: boolean;
  }
}
