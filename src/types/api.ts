/**
 * Schema defined here:
 * https://raw.githubusercontent.com/MAAP-Project/joint-open-api-specs/refs/heads/nasa-adaptation/ogc-api-processes/openapi-template/schemas/common-core/link.yaml?token=GHSAT0AAAAAADHRRGGMBURECIJ47XPIVTBU2GLKSXQ
 */
export interface JobLink {
  href: string;
  rel?: string;
  type?: string;
  hreflang?: string;
  title?: string;
}

/**
 *  Schema defined here:
 *  https://raw.githubusercontent.com/MAAP-Project/joint-open-api-specs/refs/heads/nasa-adaptation/ogc-api-processes/openapi-template/schemas/processes-core/submittedJob.yaml?token=GHSAT0AAAAAADHRRGGMUURGUBMKZFHZQ55S2GLKJGA
 */
export interface ProcessExecutionSuccessResponse {
  jobID: string;
  title?: string;
  description?: string;
  keywords?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any[];
  processID?: number;
  type?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request?: any | null;
  status?: string;
  message?: string | null;
  created?: string;
  updated?: string | null;
  links?: JobLink[];
}

/**
 * Schema defined here:
 * https://raw.githubusercontent.com/MAAP-Project/joint-open-api-specs/refs/heads/nasa-adaptation/ogc-api-processes/openapi-template/schemas/common-core/exception.yaml?token=GHSAT0AAAAAADHRRGGMB4YS3QWLXMJBJY6O2GLKCSQ
 */
export interface ProcessExecutionFailureResponse {
  status: number;
  type?: string;
  title?: string;
  detail?: string;
  instance?: string;
}

export interface Job {
  jobID: string;
  type: string;
  status: string;
  processID?: number;
}

export interface JobOverviewResponse extends Job {
  created: string;
  started: string;
  finished: string;
  //processName: string;
  tags: string[];
}

export interface JobsOverviewResponse {
  jobs: JobOverviewResponse[];
  links: JobLink[];
}

/**
 * Schema defined here:
 * https://github.com/MAAP-Project/joint-open-api-specs/blob/nasa-adaptation/ogc-api-processes/openapi-template/schemas/processes-core/jobList.yaml
 */
export interface JobsListResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jobs: any[];
  links: JobLink[];
}

/**
 * Schema defined here:
 * https://github.com/MAAP-Project/joint-open-api-specs/blob/nasa-adaptation/ogc-api-processes/openapi-template/schemas/processes-core/statusInfo.yaml
 */
export interface JobResponse {
  id: string;
  processID?: number;
  type?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request?: any;
  status?: string;
  message?: string;
  created?: string;
  started?: string;
  updated?: string;
  finished?: string;
  links?: JobLink[];
  progress?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  outputs?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exception?: any; //TODO: implement exception type
}

/**
 * Schema defined here:
 * https://github.com/MAAP-Project/joint-open-api-specs/blob/nasa-adaptation/ogc-api-processes/openapi-template/schemas/processes-core/processSummary.yaml
 */
export interface ProcessSummary {
  title?: string;
  deployedBy?: string;
  description?: string;
  keywords?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any[];
  id: string;
  version: string;
  processID?: number;
  cwlLink?: JobLink;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jobControlOptions?: any[];
  links?: JobLink[];
}

/**
 * Schema defined here:
 * https://github.com/MAAP-Project/joint-open-api-specs/blob/nasa-adaptation/ogc-api-processes/openapi-template/schemas/processes-core/processList.yaml
 */
export interface ProcessListResponse {
  processes: ProcessSummary[];
  links: JobLink[];
}

export interface ProcessResponse {
  title?: string;
  description?: string;
  keywords?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any[];
  id?: string;
  processID?: string | number;
  version?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jobControlOptions?: any[];
  author?: string;
  deployedBy?: string;
  githubUrl?: string;
  gitCommitHash?: string | null;
  cwlLink?: string | JobLink;
  ramMin?: number;
  coresMin?: number;
  baseCommand?: string;
  links?: JobLink[];
  inputs?: InputObj;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export interface ProcessInput {
  name: string;
  description: string;
  type: string;
  placeholder: string; // placeholder is what HySDS stores label as
  default?: string | number | boolean;
  optional?: boolean;
}

export interface InputObj {
  [key: string]: ProcessInput;
}

export interface ResourceResponse {
  message: string;
  code: number;
  queues?: string[];
}

export interface JobResultResponse {
  detail?: string;
  additionalProp1: { links?: JobLink[]; id?: string };
}

export type JobResultResponseOutputs = Pick<JobResultResponse, 'additionalProp1'>;

export interface OgcApiError {
  type?: string | null;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}

export interface LinkObj {
  href: string;
}

export interface JobResultObj {
  id: string;
  links: LinkObj[];
}
