import crypto from "node:crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";

const generateSecretToken = () => {
  const rawToken = crypto.randomBytes(16).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return { rawToken, hashedToken };
};

const generateAccessToken = (payload: string | object | Buffer): string => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: "15m",
  });
};

const verifyAccessToken = (token: string): string | JwtPayload => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
};

const generateRefreshToken = (payload: string | object | Buffer): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "7d",
  });
};

const verifyRefreshToken = (token: string): string | JwtPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);
};

const generateIdToken = (payload: string | object | Buffer): string => {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
        expiresIn: "15m",
    });
};

const verifyIdToken = (token: string): string | JwtPayload => {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
};

export {
  generateSecretToken,
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateIdToken,
  verifyIdToken
};