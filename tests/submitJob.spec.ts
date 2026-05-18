import { test, expect } from './fixtures';

test.describe('SubmitJob Form', () => {
  test.beforeEach(async ({ page }) => {
    console.log('test');
  });

  test('should display the form with all required fields', async ({ pluginSubmitJobs }) => {
    await expect(pluginSubmitJobs.locator('h2')).toContainText('Submit MAAP Jobs');

    // Check for required fields
    await expect(pluginSubmitJobs.locator('label').filter({ hasText: 'Process' })).toBeVisible();
    await expect(pluginSubmitJobs.locator('label').filter({ hasText: 'Version' })).toBeVisible();
    await expect(pluginSubmitJobs.locator('label').filter({ hasText: 'Queue' })).toBeVisible();

    // Check for buttons
    await expect(
      pluginSubmitJobs.locator('button').filter({ hasText: 'Submit Job' })
    ).toBeVisible();
    await expect(pluginSubmitJobs.locator('button').filter({ hasText: 'Clear' })).toBeVisible();
    await expect(
      pluginSubmitJobs.locator('button').filter({ hasText: 'Copy Jupyter Notebook Code' })
    ).toBeVisible();
    await expect(pluginSubmitJobs.locator('button').filter({ hasText: 'View Jobs' })).toBeVisible();
    await expect(pluginSubmitJobs).toBeVisible();
  });

  test('should disable Version field until Process is selected', async ({
    page,
    pluginSubmitJobs,
  }) => {
    const versionField = pluginSubmitJobs.locator('input[placeholder="Select a version"]');
    await expect(versionField).toBeDisabled();

    const processField = pluginSubmitJobs.locator('input[placeholder="Select a process"]').first();
    await processField.click();

    // Wait for dropdown options (rendered in portal)
    const firstOption = page.locator('li[role="option"]').first();
    await expect(firstOption).toBeVisible();

    await firstOption.click();

    await expect(versionField).toBeEnabled();
  });

  test('should have View Jobs button and clicking it should open view jobs', async ({ page }) => {
    const viewJobsButton = page.locator('button').filter({ hasText: 'View Jobs' });
    await expect(viewJobsButton).toBeVisible();
  });
});
