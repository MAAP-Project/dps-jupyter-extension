import { type Locator } from '@playwright/test';
import { test as base, expect, galata } from '@jupyterlab/galata';

type Fixtures = {
  pluginSubmitJobs: Locator;
};

// Set in the environment and checked by playwright.global-setup.js
const maapSettings = {
  maapApiUrl: process.env.MAAP_API_URL,
  maapToken: process.env.MAAP_TOKEN,
};

/**
 * Open the dps plugins and use that as that entry point for the playwright tests.
 */
export const test = base.extend<Fixtures>({
  // Galata serves these mocked settings in place of any saved user settings,
  // so the MAAP settings have to be provided here. The extension reads the
  // shared MAAP settings when maap-jupyter-server-extension is installed, and
  // its own settings otherwise. That extension may also overwrite the shared
  // settings from the server environment, which playwright.config.ts sets.
  mockSettings: [
    {
      ...galata.DEFAULT_SETTINGS,
      'maap-jupyter-server-extension:plugin': maapSettings,
      'maap-dps-jupyter-extension:plugin': maapSettings,
    },
    { option: true },
  ],

  pluginSubmitJobs: async ({ page }, use) => {
    await page.goto('/');

    await page.evaluate(async () => {
      await window.jupyterapp.commands.execute('jobs_submit:open');
    });

    const plugin = page.locator('.submit-jobs-container');

    await expect(plugin).toBeVisible();
    await expect(
      plugin.getByRole('heading', { name: 'Submit MAAP Jobs' })
    ).toBeVisible();

    await use(plugin);
  },
});

export { expect } from '@playwright/test';
