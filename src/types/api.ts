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
    id: string;
    title?: string;
    description?: string;
    keywords?: string[];
    metadata?: any[];
    processID?: number;
    type?: string | null;
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

/** TODO: update jobs type
 * Schema defined here:
 * https://github.com/MAAP-Project/joint-open-api-specs/blob/nasa-adaptation/ogc-api-processes/openapi-template/schemas/processes-core/jobList.yaml
 */
export interface JobsListResponse {
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
    request?: any;
    status?: string;
    message?: string;
    created?: string;
    started?: string;
    updated?: string;
    finished?: string;
    links?: JobLink[];
    progress?: number;
    outputs?: any[];
    exception?: any; //TODO: implement exception type
}