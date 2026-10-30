/**
 * Configuration for Playwright using default from @jupyterlab/galata
 */
const baseConfig = require('@jupyterlab/galata/lib/playwright-config');
const path = require('path');

const settingsDir = path.resolve(__dirname, 'tests', 'jupyterlab-settings');

module.exports = {
  ...baseConfig,
  // Only the browser tests; the Jest unit tests in src/ are run by `jlpm test:unit`
  testDir: './tests',
  globalSetup: require.resolve('./playwright.global-setup'),
  webServer: {
    command: 'jlpm start',
    url: 'http://localhost:8888/lab',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      JUPYTERLAB_SETTINGS_DIR: settingsDir,
      // When maap-jupyter-server-extension is installed, it overwrites the shared
      // MAAP settings on startup with these server environment variables
      MAAP_API_HOST: process.env.MAAP_API_URL ?? '',
      MAAP_PGT: process.env.MAAP_TOKEN ?? '',
    },
  },
};