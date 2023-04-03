/**
 * Describes the fields to be displayed in the GeneralJobsInfo table component.
 * The accessors are relative to the IJob type.
 */

import { STYLE_TYPE } from "../constants";
import { IJobInfoTable } from "../types/types";

export const ERRORS_JOBS_INFO: IJobInfoTable[] = [
    {
        header: "Errors",
        accessor: "error",
        type: STYLE_TYPE.CODE
    }
]