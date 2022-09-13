/**
 * IJob
 */
export interface IJob {
  job_id?: string,
  tags?: string[],
  name?: string,
  job_type?: string,
  username?: string,
  command?: string,
  disk_usage?: string
  params?: [],
  ec2_instance_type?: string,
  ec2_instance_id?: string
  time_end?: string,
  time_start?: string,
  time_queued?: string,
  status?: string,
  error?: string,
  products?: string,
  queue?: string,
  duration?: string,
  version?: string
}


/**
 * Job Info Table Template
 * 
 * @param header - human-friendly field name to be displayed in table row
 * @param accessor - path to field data, relative to IJob
 * @param type - field data type
 * 
 */
export interface IJobInfoTable {
  header: string,
  accessor: string,
  type?: string
}


/**
 * Algorithm Input Param
 * 
 * @param name - algorithm input param name
 * @param value - algorithm input param value
 * @param destination - algorithm input param destination
 * 
 */
export interface IInputParam {
  name: string,
  value: string,
  destination: string
}