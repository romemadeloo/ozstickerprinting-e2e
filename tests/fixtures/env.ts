import 'dotenv/config';
import { resolveEnvironment } from './environments.js';

export const env = resolveEnvironment(process.env.E2E_ENVIRONMENT?.trim() || 'production');

/** Hosts whose console errors and >=400 responses fail a test (third-party noise is ignored). */
export const ownHosts = [
  new URL(env.baseUrl).hostname,
  new URL(env.apiBaseUrl).hostname,
  'static.ozstickerprinting.com'
];

export function isOwnHost(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return ownHosts.includes(host);
  } catch {
    return false;
  }
}

export const memberCredentials =
  process.env.OSP_MEMBER_EMAIL && process.env.OSP_MEMBER_PASSWORD
    ? { email: process.env.OSP_MEMBER_EMAIL, password: process.env.OSP_MEMBER_PASSWORD }
    : undefined;

export const runCartE2E = process.env.RUN_CART_E2E === 'true';
