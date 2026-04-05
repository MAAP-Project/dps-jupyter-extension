import { type Locator } from '@playwright/test';
import { test as base, expect } from '@jupyterlab/galata';

type Fixtures = {
  pluginSubmitJobs: Locator;
};

/**
 * Open the dps plugins and use that as that entry point for the playwright tests.
 */
export const test = base.extend<Fixtures>({
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