/**
 * Checks that the MAAP settings needed by the tests are set. The values are
 * passed to JupyterLab through galata's mocked settings in tests/fixtures.ts.
 */
module.exports = async () => {
  if (!process.env.MAAP_API_URL) {
    throw new Error('Missing required environment variable: MAAP_API_URL');
  }

  if (!process.env.MAAP_TOKEN) {
    throw new Error('Missing required environment variable: MAAP_TOKEN');
  }
};
