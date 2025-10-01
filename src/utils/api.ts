import { MAAP_API_OGC_ENDPOINTS } from "../constants";
import { JobResponse, JobsListResponse, ProcessExecutionFailureResponse, ProcessExecutionSuccessResponse } from "../types/api";
import { Notification } from '@jupyterlab/apputils';
import { PageConfig } from '@jupyterlab/coreutils';

const BASE_URL = PageConfig.getBaseUrl();
const MAAP_API_URL = await getMaapApiUrl();

/**
 * Retrieves the XSRF token from browser local storage
 * @returns {string | undefined} The XSRF token string or undefined if not found
 */
function _getXsrfToken(): string | undefined {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("_xsrf="))
    ?.split("=")[1];
}

/**
 * Validates if a string is a valid environment variable value
 * @param value - The string to validate
 * @returns {boolean} True if the string is a valid environment variable value, false otherwise
 */
function isValidEnvVarValue(value: string): boolean {
  return /^[\x20-\x7E]+$/.test(value)
}

/**
 * Fetches the MAAP API URL from the MAAP Jupyter server extension endpoint.
 *
 * This function sends a GET request to the backend route
 * `maap-jupyter-server-extension/get-api-url` and attempts to retrieve the
 * `MAAP_API_URL` environment variable from the server. If the variable is not
 * set or an error occurs during the fetch, the function raises an error and
 * returns `null`.
 *
 * @returns {Promise<string | null>} A promise that resolves to the MAAP API URL
 * if successfully retrieved, or `null` if the request fails or the variable is missing.
 *
 * @throws {Error} Throws an error if the HTTP request fails or the variable is missing.
 */
export async function getMaapApiUrl(): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL}maap-jupyter-server-extension/get-api-url`);
    const data = await response.json();

    if (response.status >= 400 || !data?.apiUrl) {
      throw new Error(`Failed to retrieve MAAP_API_URL. ${data?.error ?? ""}`);
    }

    return data.apiUrl;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Retrieves the MAAP authentication token from browser local storage
 * @returns {string | null} The MAAP PGT token string or null if not found or invalid
 * @throws {Error} Throws an error if the token is not valid environment variable value.
 */
export function getMaapTokenFromLocalStorage(): string | null {
  try {
    const token = localStorage.getItem('MAAP_PGT_TOKEN');
    if (!isValidEnvVarValue(token)) {
      throw new Error(`Failed to retrieve MAAP_PGT_TOKEN from browser local storage. Invalid environment variable value: ${token}`);
    }
    return token;
  } catch (error) {
    return null;
  }
};

/**
 * Stores the MAAP authentication token in browser local storage
 * @param token - The MAAP PGT token to store
 * @throws {Error} Throws an error if the token is not a valid environment variable value.
 */
export function setMaapTokenToLocalStorage(token: string): void {
   try {
    if (!isValidEnvVarValue(token)) {
      throw new Error(`Failed to set MAAP_PGT_TOKEN in browser local storage. Invalid environment variable value: ${token}`);
    }
    localStorage.setItem('MAAP_PGT_TOKEN', token);
   } catch (error) {
    console.error(error);
   }
};

/**
 * Retrieves the MAAP_PGT_TOKEN for the current user.
 *
 * This function first attempts to fetch the token from the Jupyter server
 * extension endpoint (`/maap-jupyter-server-extension/get-token`).
 * If the request fails or throws an error, it falls back to retrieving the
 * token from the browser's local storage.
 *
 * @async
 * @function getToken
 * @returns {Promise<string | null>} 
 * Resolves to the MAAP_PGT_TOKEN string if successfully retrieved,
 * otherwise returns `null` if both the server request and local storage
 * retrieval fail.
 *
 * @throws {Error} 
 * Throws an error if the HTTP request fails or the token cannot
 * be retrieved.
 */
export async function getToken(): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL}maap-jupyter-server-extension/get-token`);
    const data = await response.json();

    if (response.status >= 400 || !data?.token) {
      throw new Error(`Failed to retrieve MAAP_PGT_TOKEN environment variable. ${data?.error ?? ""}`);
    }

    return data.token;
  } catch (error) {
    console.error(error);
    
    // Fallback to local storage
    try {
      const token = getMaapTokenFromLocalStorage();
      if (!token) {
        // TODO: if not in local storage, prompt user to set token?
        throw new Error("Failed to retrieve MAAP_PGT_TOKEN from browser local storage.");
      }
      return token;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

/**
 * Attempts to set the `MAAP_PGT_TOKEN` environment variable on the server via a POST request.
 *
 * If the request fails or the server returns an error (e.g. due to invalid JSON,
 * missing token, or a 4xx/5xx status), it falls back to storing the token in
 * the browser's local storage.
 *
 * This function also includes support for CSRF protection using the X-XSRFToken header,
 * and uses `same-origin` credentials to include cookies in the request.
 *
 * @param {string} token - The token string to be stored either in the server's environment
 *                         or in local storage as a fallback.
 * @returns {Promise<void>} Resolves when the token is successfully stored on the server
 *                          or in local storage. Errors are logged to the console but not thrown.
 *
 * @example
 * await setToken("abc123");
 *
 * @throws {Error} If the request to the server fails and storing in local storage also fails,
 *                 the errors are logged but not re-thrown.
 */
export async function setToken(token: string): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}maap-jupyter-server-extension/set-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-XSRFToken": _getXsrfToken() ?? ""
      },
      credentials: "same-origin",
      body: JSON.stringify({ token })
    });
    const data = await response.json();

    if (response.status >= 400 || !data?.message) {
      throw new Error(`Failed to set MAAP_PGT_TOKEN environment variable. ${data?.error ?? ""}`);
    }
  } catch (error) {
    console.error(error);
    
    // Fallback to local storage
    try {
      setMaapTokenToLocalStorage(token);
    } catch (error) {
      console.error(error);
      return null;
    }
  }
};

/**
 * Internal function to make authenticated HTTP requests to MAAP API
 * @param url - The URL to make the request to
 * @param method - HTTP method (defaults to "GET")
 * @param body - Request body data (optional, only included if not null)
 * @returns Promise that resolves to the JSON response
 * @throws Error if authentication token is missing or request fails
 */
async function _request( url: string, method: string = "GET", body?: any ) {
  const controller = new AbortController();
  let message = "";

  const token = await getToken();

  if (!token) {
    message = "No authentication token available.";
    Notification.error(message, { autoClose: false });
    throw new Error(message);
  }

  try {
    const fetchOptions: RequestInit = {
      method: method,
      headers: { cpticket: token, "Content-Type": "application/json" },
      signal: controller.signal
    };

    if (body !== null) {
      fetchOptions.body = body;
    }

    const response: Response = await fetch(url, fetchOptions);

    if (response.status >= 400) throw new Error(`HTTP error ${response.statusText}`);
    return await response.json();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }
};

/**
 * Submits a new job to the MAAP OGC API processes endpoint
 * @param processId - The ID of the process to execute
 * @param data - The job submission data
 * @returns Promise that resolves when job is submitted
 * @throws Error if authentication fails or job submission fails
 */
export async function submitJob(
    processId: string,
    data: any, // TODO: add type
  ){
    try {
      const url = new URL(MAAP_API_URL + MAAP_API_OGC_ENDPOINTS.SUBMIT_JOB.replace("{PROCESS_ID}", processId));
      const response = await _request(url.toString(), "POST", data);

      // Process execution submission is successful if response.processID is present in repsonse
      if (response.processID) {
        const successResponse: ProcessExecutionSuccessResponse = {
            ...response
          };
        Notification.success(successResponse.status, { autoClose: false });
      } else {
        const failureResponse: ProcessExecutionFailureResponse = {
            ...response
          };
        Notification.error(failureResponse.detail, { autoClose: false });
        throw new Error(failureResponse.detail);
      }
    } catch (error) {
        Notification.error(error as string, { autoClose: false });
    }
  };


/**
 * Fetches a list of jobs from the MAAP OGC API processes endpoint
 * @param params - Query parameters to filter jobs (e.g., status, limit, offset)
 * @param jobFields - Array of field names to include in the job object response (joined as comma-separated "fields" parameter)
 * @returns Promise that resolves to JobsListResponse containing the list of jobs
 * @throws Error if the request fails
 */
export async function fetchJobs(
  params: Record<string, string>,
  jobFields: string[] = []
): Promise<JobsListResponse> {
  try {
    const url = new URL(MAAP_API_URL + MAAP_API_OGC_ENDPOINTS.GET_JOB);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value);
    }

    if (jobFields && jobFields.length > 0) {
      url.searchParams.append("fields", jobFields.join(","));
    }

    const response = await _request(url.toString(), "GET");

    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Fetches a specific job by its ID from the MAAP OGC API processes endpoint
 * 
 * Schema defined here:
 * https://github.com/MAAP-Project/joint-open-api-specs/blob/nasa-adaptation/ogc-api-processes/openapi-template/schemas/processes-core/statusInfo.yaml
 * 
 * @param jobId - The unique identifier of the job to fetch
 * @param params - Additional query parameters for the request
 * @param jobFields - Array of field names to include in the response (joined as comma-separated "fields" parameter)
 * @returns Promise that resolves to JobResponse containing the job details
 * @throws Error if job ID is not provided or if the request fails
 */
export async function fetchJob(
  jobId: string,
  params: Record<string, string>,
  jobFields: string[] = []
): Promise<JobResponse> {
  try {
    if (!jobId) {
      throw new Error("Failed to fetch job. Job ID is required.");
    }
    const url = new URL(MAAP_API_URL + MAAP_API_OGC_ENDPOINTS.GET_JOB_BY_ID.replace("{JOB_ID}", jobId));

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value);
    }
    
    if (jobFields && jobFields.length > 0) {
      url.searchParams.append("fields", jobFields.join(","));
    }
  
    const response = await _request(url.toString(), "GET");
    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
}
