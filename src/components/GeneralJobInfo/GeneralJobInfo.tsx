import React from 'react'
import { useSelector } from 'react-redux'
import { selectJobs } from '../../redux/slices/jobsSlice'
import { JobStatusBadge } from '../JobStatusBadge/JobStatusBadge'
import '../../../style/GeneralJobInfo.css'

export const GeneralJobInfo = (): JSX.Element => {

    // Redux
    const { selectedJob } = useSelector(selectJobs)

    const getError = () => {
        if (selectedJob.jobInfo['info']['wps:Result']['wps:Output']['@id'] && 
            selectedJob.jobInfo['info']['wps:Result']['wps:Output']['@id'] === "traceback") {
                return selectedJob.jobInfo['info']['wps:Result']['wps:Output']['wps:Data']
        }
        return "-"
    }

    return (
        <table className='table'>
            <tbody>
                <tr>
                    <td>Tag</td>
                    <td></td>
                </tr>
                <tr>
                    <td>Job ID</td>
                    <td>{selectedJob.jobID}</td>
                </tr>
                <tr>
                    <td>Status</td>
                    <td><JobStatusBadge status={selectedJob.jobInfo.status} /></td>
                </tr>
                <tr>
                    <td>Start Time</td>
                    <td>{selectedJob.jobInfo.starttime}</td>
                </tr>
                <tr>
                    <td>End Time</td>
                    <td>{selectedJob.jobInfo.timeend}</td>
                </tr>
                <tr>
                    <td>Duration</td>
                    <td>{selectedJob.jobInfo.duration}</td>
                </tr>
                <tr>
                    <td>Worker</td>
                    <td>{selectedJob.jobInfo.ec2_instance_type}</td>
                </tr>
                <tr>
                    <td>Products</td>
                    <td></td>
                </tr>
                <tr>
                    <td className='align-top'>Error</td>
                    {/* <td className='block-text'>{getError()}</td> */}
                </tr>
            </tbody>
        </table>
    )
}