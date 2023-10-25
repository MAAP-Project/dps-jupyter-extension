import React from 'react'
import { useSelector } from 'react-redux'
import { getProducts } from '../utils/utils'
import { selectJobs } from '../redux/slices/jobsSlice'
import { OUTPUTS_JOBS_INFO } from '../templates/OutputsJobInfoTable'
import { EMPTY_FIELD_CHAR } from '../constants'

export const OutputsJobInfoTable = (): JSX.Element => {

    // Redux
    const { selectedJob } = useSelector(selectJobs)

    console.log("graceal1 in outputs job info table with ");
    console.log(selectedJob);
    console.log(selectedJob['jobInfo']);
    
    return (
        <table className='table'>
            <tbody>
                {OUTPUTS_JOBS_INFO.map((field) => {
                    {
                        if (selectedJob['jobInfo'][field.accessor]) {
                            return <tr>
                            <th>{field.header}</th>
                            <td style={{ whiteSpace: 'pre' }}>
                                {getProducts(selectedJob['jobInfo'][field.accessor])}
                            </td>
                        </tr>
                        } else {
                            return <tr>
                                <th>{field.header}</th>
                                <td>{EMPTY_FIELD_CHAR}</td>
                            </tr>
                        }
                    }
                })}
                <tr>
                    <th>cd in terminal</th>
                    <td style={{ whiteSpace: 'pre' }}>
                        cd ~/testFolder1/testFolder2
                    </td>
                </tr>
            </tbody>
        </table>
    )
}