import { readFileSync } from "node:fs";
import path from 'node:path';
import jose from 'node-jose'

// Support reading keys from environment variables (for Vercel/production)
// or from files on disk (for local development)
const getKey = (envVar: string, filePath: string): Buffer => {
    const envValue = process.env[envVar];
    if (envValue) {
        // Environment variable values use \n for newlines
        return Buffer.from(envValue.replace(/\\n/g, '\n'));
    }
    return readFileSync(path.resolve(filePath));
};

export const PRIVATE_KEY = getKey('PRIVATE_KEY', 'cert/private-key.pem');
export const PUBLIC_KEY = getKey('PUBLIC_KEY', 'cert/public-key.pem');

export const JWK = await jose.JWK.asKey(PUBLIC_KEY, "pem");