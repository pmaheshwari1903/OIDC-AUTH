import { readFileSync } from "node:fs";
import path from 'node:path';
import jose from 'node-jose'

export const PRIVATE_KEY = readFileSync(path.resolve("cert/private-key.pem"))
export const PUBLIC_KEY = readFileSync(path.resolve("cert/public-key.pem"))

export const JWK = await jose.JWK.asKey(PUBLIC_KEY, "pem");