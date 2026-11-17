// The only place OzStickerPrinting server URLs are written. Specs and page objects never hardcode hosts.
export type EnvironmentConfig = {
  baseUrl: string;
  apiBaseUrl: string;
  // Production is live customer data: specs that write are refused there, and the write guard in
  // osp-test.ts aborts mutating API calls that are not on the allowlist.
  isProduction: boolean;
};

export type EnvironmentName = 'production' | 'dev';

function devEnvironment(): EnvironmentConfig {
  const baseUrl = process.env.OSP_DEV_BASE_URL?.trim();
  const apiBaseUrl = process.env.OSP_DEV_API_URL?.trim();

  if (!baseUrl || !apiBaseUrl) {
    throw new Error(
      'E2E_ENVIRONMENT=dev needs OSP_DEV_BASE_URL and OSP_DEV_API_URL in .env. Ask the QA owner which dev server to use.'
    );
  }

  const host = new URL(baseUrl).hostname;
  if (host === 'www.ozstickerprinting.com' || host === 'ozstickerprinting.com') {
    throw new Error(`OSP_DEV_BASE_URL points at production (${host}). Use E2E_ENVIRONMENT=production instead.`);
  }

  return { baseUrl: baseUrl.replace(/\/$/, ''), apiBaseUrl: apiBaseUrl.replace(/\/$/, ''), isProduction: false };
}

export function resolveEnvironment(name: string): EnvironmentConfig & { name: EnvironmentName } {
  if (name === 'production') {
    return {
      name,
      baseUrl: 'https://www.ozstickerprinting.com',
      apiBaseUrl: 'https://api.ozstickerprinting.com/index.php',
      isProduction: true
    };
  }

  if (name === 'dev') {
    return { name, ...devEnvironment() };
  }

  throw new Error(`Unsupported E2E_ENVIRONMENT "${name}". Use production or dev.`);
}
