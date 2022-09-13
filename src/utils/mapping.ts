import { IJob } from '../types/types'

export const parseJobData = (data: any) => {

    let tmpJobs: IJob[] = []

    data.map((job: any) => {

        let tmpJob: IJob = {}
        let tmp = Object.entries(job)

        if (tmp[0][0]) {
            tmpJob.job_id = tmp[0][0]
        }

        if (tmp[0][1]) {
            tmpJob.name = tmp[0][1]['name']
            tmpJob.job_type = tmp[0][1]['type']
            tmpJob.status = tmp[0][1]['status']
            tmpJob.tags = tmp[0][1]['tags']
            tmpJob.error = tmp[0][1]['error']

            if (tmp[0][1]['job']) {
                tmpJob.username = tmp[0][1]['job']['username']

                if (tmp[0][1]['job']['job_info']) {
                    tmpJob.queue = tmp[0][1]['job']['job_info']['job_queue']
                    tmpJob.time_end = tmp[0][1]['job']['job_info']['time_end']
                    tmpJob.time_start = tmp[0][1]['job']['job_info']['time_start']
                    tmpJob.time_queued = tmp[0][1]['job']['job_info']['time_queued']
                    tmpJob.duration = tmp[0][1]['job']['job_info']['duration']

                    if (tmp[0][1]['job']['job_info']['facts']) {
                        tmpJob.ec2_instance_id = tmp[0][1]['job']['job_info']['facts']['ec2_instance_id']
                        tmpJob.ec2_instance_type = tmp[0][1]['job']['job_info']['facts']['ec2_instance_type']
                    }
                }
            }

            if (tmp[0][1]['job']['context']) {
                tmpJob.command = tmp[0][1]['job']['context']['_command']
                tmpJob.disk_usage = tmp[0][1]['job']['context']['_disk_usage']

                if (tmp[0][1]['job']['context']['job_specification']) {
                    tmpJob.params = tmp[0][1]['job']['context']['job_specification']['params']
                }
            }
        }

        // TODO: run a job that produces products.
        tmpJob.products = ''
        
        tmpJobs.push(tmpJob)

    })

    return tmpJobs
}