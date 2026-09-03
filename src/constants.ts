/*******************************
 * Jupyter Extension
 *******************************/
export const JUPYTER_EXT = {
  EXTENSION_CSS_CLASSNAME: 'jl-ReactAppWidget',

  VIEW_JOBS_PLUGIN_ID: 'jobs_view:plugin',
  VIEW_JOBS_NAME: 'View My Jobs',
  VIEW_JOBS_OPEN_COMMAND: 'jobs_view:open',

  SUBMIT_JOBS_PLUGIN_ID: 'jobs_submit:plugin',
  SUBMIT_JOBS_NAME: 'Submit Jobs',
  SUBMIT_JOBS_OPEN_COMMAND: 'jobs_submit:open',

  REGISTER_ALGORITHM_PLUGIN_ID: 'register_algorithm:plugin',
  REGISTER_ALGORITHM_NAME: 'Register Algorithm',
  REGISTER_ALGORITHM_OPEN_COMMAND: 'register_algorithm:open',
};

/*******************************
 * MAAP API ENDPOINTS
 *******************************/
export const MAAP_API_ENDPOINTS = {
  JOBS: 'api/ogc/jobs',
  JOBS_JOBID: 'api/ogc/jobs/{JOB_ID}',
  JOBS_JOBID_RESULTS: 'api/ogc/jobs/{JOB_ID}/results',
  PROCESSES: 'api/ogc/processes',
  PROCESSES_PROCESSID: 'api/ogc/processes/{PROCESS_ID}',
  PROCESSES_PROCESSID_EXECUTION: 'api/ogc/processes/{PROCESS_ID}/execution',
  ALGORITHM_RESOURCE: 'api/mas/algorithm/resource',
};

/*******************************
 * MAAP General
 *******************************/
export const MAAP_PROFILE_TOKENS_URL =
  'https://console.maap-project.org/profile/tokens';
export const MAAP_PROFILE_TOKENS_URL_UAT =
  'https://console.uat.maap-project.org/profile/tokens';
