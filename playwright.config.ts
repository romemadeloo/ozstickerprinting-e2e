import { defineConfig, devices, type ReporterDescription } from '@playwright/test';
import { env } from './tests/fixtures/env.js';

const desktopProjects = ['chromium', 'firefox', 'webkit'].map((browser) => ({
  name: `${browser}-desktop`,
  grepInvert: /@mobile/,
  use: {
    ...devices[browser === 'chromium' ? 'Desktop Chrome' : browser === 'firefox' ? 'Desktop Firefox' : 'Desktop Safari'],
    viewport: { width: 1440, height: 900 }
  }
}));

const mobileProject = {
  name: 'chromium-mobile',
  grep: /@mobile/,
  use: { ...devices['Pixel 7'] }
};

function selectedProjects() {
  const requested = process.env.E2E_BROWSER_PROJECT ?? 'chromium-desktop';
  if (requested === 'all-desktop') return desktopProjects;
  const project = [...desktopProjects, mobileProject].find((candidate) => candidate.name === requested);
  if (!project) {
    throw new Error(
      `Unsupported E2E_BROWSER_PROJECT "${requested}". Use chromium-desktop, firefox-desktop, webkit-desktop, chromium-mobile or all-desktop.`
    );
  }
  return [project];
}

function resolveWorkers(): number {
  const requested = Number(process.env.PW_WORKERS ?? 2);
  if (!Number.isInteger(requested) || requested < 1) {
    throw new Error(`Unsupported PW_WORKERS "${process.env.PW_WORKERS}". Use a positive integer.`);
  }
  return requested;
}

const reporters: ReporterDescription[] = process.env.CI
  ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]]
  : [['list'], ['html', { open: 'never' }]];

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: resolveWorkers(),
  reporter: reporters,
  metadata: { environment: env.name, baseUrl: env.baseUrl },
  use: {
    baseURL: env.baseUrl,
    headless: process.env.HEADED !== 'true',
    locale: 'en-AU',
    timezoneId: 'Australia/Sydney',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: selectedProjects(),
  outputDir: 'test-results'
});
