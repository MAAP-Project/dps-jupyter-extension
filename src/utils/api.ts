import { MAAP_API_ENDPOINTS } from '../constants';
import {
  JobResponse,
  JobResultResponse,
  ProcessExecutionFailureResponse,
  ProcessExecutionSuccessResponse,
  ProcessListResponse,
  ProcessResponse,
  ResourceResponse,
} from '../types/api';
import { PageConfig } from '@jupyterlab/coreutils';

export const BASE_URL = PageConfig.getBaseUrl();

type MaapSettings = {
  maapApiUrl: string;
  maapToken: string;
};

export type GetLatestSettings = () => Promise<MaapSettings>;

type RequestOptions = Omit<RequestInit, 'headers'> & {
  endpoint?: string;
  url?: string;
  auth?: boolean;
  headers?: Record<string, string>;
  rawBody?: boolean;
};

function joinUrl(base: string, path: string): string {
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

export function createMaapApi(getLatestSettings: GetLatestSettings) {
  /**
   * Single request helper: always reads latest settings right before calling fetch.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function request<T = any>(opts: RequestOptions): Promise<T> {
    const { maapApiUrl, maapToken } = await getLatestSettings();

    if (!maapApiUrl) {
      throw new Error(
        'Request failed because no MAAP API URL was specified. Open Jupyter Settings and specify MAAP API URL.'
      );
    }

    const finalUrl = opts.url ?? (opts.endpoint ? joinUrl(maapApiUrl, opts.endpoint) : undefined);

    if (!finalUrl) {
      throw new Error('request() requires either url or endpoint');
    }

    const headers: Record<string, string> = {
      ...(opts.headers ?? {}),
    };

    // Only set JSON content-type by default when caller is NOT sending raw body
    if (!opts.rawBody && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (opts.auth) {
      headers['cpticket'] = maapToken;
    }

    const response = await fetch(finalUrl, {
      ...opts,
      headers,
    });

    if (!response.ok) {
      const details = await response.json();
      throw details;
    }

    // Try JSON first; fall back to text if no JSON
    const ct = response.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      return (await response.json()) as T;
    }

    // If it isn't JSON, return text (as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await response.text()) as any as T;
  }

  // -------------------------
  // API methods
  // -------------------------

  /********************************************************************************
   * Submit a job to the Data Processing System (DPS).
   * @param processId OGC process ID
   * @param data
   * @returns
   */
  async function submitJob(
    processId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ): Promise<ProcessExecutionSuccessResponse | ProcessExecutionFailureResponse> {
    const endpoint = MAAP_API_ENDPOINTS.SUBMIT_JOB.replace('{PROCESS_ID}', processId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await request<any>({
      endpoint,
      method: 'POST',
      auth: true,
      body: JSON.stringify(data),
    });

    // Process execution submission is successful if response.processID is present
    if (response.processID) {
      const successResponse: ProcessExecutionSuccessResponse = {
        ...response,
      };
      return successResponse;
    } else {
      // Response code is okay, but process failed to execute
      const failureResponse: ProcessExecutionFailureResponse = {
        ...response,
      };
      return failureResponse;
    }
  }

  /********************************************************************************
   * Fetch Processes
   * @param id
   * @returns
   */
  async function fetchProcesses(
    id?: string | number
  ): Promise<ProcessListResponse | ProcessResponse | unknown> {
    try {
      const endpoint = id
        ? `${MAAP_API_ENDPOINTS.GET_PROCESSES}/${id}`
        : MAAP_API_ENDPOINTS.GET_PROCESSES;

      if (id) {
        return await request<ProcessResponse>({
          endpoint,
          method: 'GET',
          auth: true,
        });
      } else {
        return await request<ProcessListResponse>({
          endpoint,
          method: 'GET',
          auth: true,
        });
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /********************************************************************************
   * Fetch Jobs
   * @param params
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function fetchJobs(params: Record<string, string> = {}): Promise<any> {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const endpoint = MAAP_API_ENDPOINTS.GET_JOBS + (queryString ? `?${queryString}` : '');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await request<any>({
      endpoint,
      method: 'GET',
      auth: true,
    });
  }

  /********************************************************************************
   *
   * @param jobId Fetch Jobs by ID
   * @param params
   * @returns
   */
  async function fetchJobById(
    jobId: string,
    params: Record<string, string> = {}
  ): Promise<JobResponse | unknown> {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const endpoint =
      MAAP_API_ENDPOINTS.GET_JOB_BY_ID.replace('{JOB_ID}', jobId) +
      (queryString ? `?${queryString}` : '');

    return await request<JobResponse>({
      endpoint,
      method: 'GET',
      auth: true,
    });
  }

  /********************************************************************************
   *
   * @param jobId Fetch Job results
   * @returns
   */
  async function fetchJobResults(jobId: string): Promise<JobResultResponse> {
    const endpoint = MAAP_API_ENDPOINTS.GET_JOB_RESULTS.replace('{JOB_ID}', jobId);
    return await request<JobResultResponse>({
      endpoint,
      method: 'GET',
      auth: true,
    });
  }

  /********************************************************************************
   *
   * @returns Fetch resources
   */
  async function fetchResources(): Promise<ResourceResponse | unknown> {
    const endpoint = MAAP_API_ENDPOINTS.GET_RESOURCES;
    return await request<ResourceResponse>({
      endpoint,
      method: 'GET',
      auth: true,
    });
  }

  /********************************************************************************
   * Cancel exec
   * @param jobId
   * @returns
   */
  // TODO: update response type
  async function cancelExecution(
    jobId: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any | unknown> {
    const endpoint = MAAP_API_ENDPOINTS.CANCEL_EXECUTION.replace('{JOB_ID}', jobId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await request<any>({
      endpoint,
      method: 'POST',
      auth: true,
    });
  }

  return {
    request,
    submitJob,
    fetchProcesses,
    fetchJobs,
    fetchJobById,
    fetchJobResults,
    fetchResources,
    cancelExecution,
  };
}

export type MaapApi = ReturnType<typeof createMaapApi>;
