/**
 * Describes the fields to be displayed in the MetricsJobsInfo table component.
 * 
 */

import { IJobInfoTable } from "../types/types";

export const METRICS_JOBS_INFO: IJobInfoTable[] = [
    {
        header: "Disk Usage",
        accessor: "disk_usage",
    },
    {
        header: "Instance Type",
        accessor: "ec2_instance_type",
    },
    {
        header: "Instance ID",
        accessor: "ec2_instance_id",
    },
    {
        header: "Command",
        accessor: "command",
        type: "code"
    }
]