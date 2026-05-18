/**
 * Configuration for Playwright using default from @jupyterlab/galata
 */
const baseConfig = require('@jupyterlab/galata/lib/playwright-config');
const path = require('path');

const settingsDir = path.resolve(__dirname, 'tests', 'jupyterlab-settings');

module.exports = {
  ...baseConfig,
  globalSetup: require.resolve('./playwright.global-setup'),
  webServer: {
    command: 'jlpm start',
    url: 'http://localhost:8888/lab',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      JUPYTERLAB_SETTINGS_DIR: settingsDir,
    },
  },
};