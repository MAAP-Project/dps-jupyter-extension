const fs = require('fs/promises');
const path = require('path');

module.exports = async () => {
  const apiUrl = process.env.MAAP_API_URL;
  const token = process.env.MAAP_TOKEN;

  if (!apiUrl) {
    throw new Error('Missing required environment variable: MAAP_API_URL');
  }

  if (!token) {
    throw new Error('Missing required environment variable: MAAP_TOKEN');
  }

  const pluginPackage = 'maap_dps_jupyter_extension';
  const pluginName = 'jobs_submit';

  // Use a test-local JupyterLab settings dir
  const settingsRoot = path.resolve(__dirname, 'tests', 'jupyterlab-settings');
  const pluginDir = path.join(settingsRoot, pluginPackage);
  const settingsFile = path.join(
    pluginDir,
    `${pluginName}.jupyterlab-settings`
  );

  await fs.mkdir(pluginDir, { recursive: true });

  // User settings file: values only, not schema
  await fs.writeFile(
    settingsFile,
    JSON.stringify(
      {
        maapApiUrl: apiUrl,
        maapToken: token,
      },
      null,
      2
    ),
    'utf8'
  );

  // Make sure the Playwright/JupyterLab process sees this directory
  process.env.JUPYTERLAB_SETTINGS_DIR = settingsRoot;

  console.log(`Wrote JupyterLab test settings to: ${settingsFile}`);
  console.log(`Set JUPYTERLAB_SETTINGS_DIR=${settingsRoot}`);
};