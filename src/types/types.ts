/**
 * IJob
 */
export interface IJob {
  payload_id?: string,
  job_id?: string,
  tags?: string[],
  name?: string,
  container_image_url?: string,
  container_image_name?: string,
  job_type?: string,
  username?: string,
  command?: string,
  disk_usage?: string,
  params?: [],
  ec2_instance_type?: string,
  ec2_instance_id?: string,
  ec2_availability_zone?: string,
  job_dir_size?: string,
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