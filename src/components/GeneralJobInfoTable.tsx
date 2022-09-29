import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectJobs } from '../redux/slices/jobsSlice'
import { GENERAL_JOBS_INFO } from '../templates/GeneralJobInfoTable'
import { secondsToReadableString } from '../utils/utils'

export const GeneralJobInfoTable = (): JSX.Element => {

    // Redux
    const { selectedJob } = useSelector(selectJobs)


    // Local component variables
    const [expandError, setExpandError] = useState(false)

    return (
        <table className='table'>
            <tbody>
                {GENERAL_JOBS_INFO.map((field) => {
                    {
                        switch (field.accessor) {
                            case "error": return <tr>
                                <th>{field.header}</th>
                                <td>
                                    <div onClick={() => setExpandError(!expandError)} className={expandError ? "show-content clickable" : "hide-content clickable"}>{selectedJob['jobInfo'][field.accessor]}</div>
                                </td>
                            </tr>
                            case "duration": return <tr>
                                <th>{field.header}</th>
                                <td>
                                    {console.log(selectedJob['jobInfo'][field.accessor])}
                                    {secondsToReadableString(selectedJob['jobInfo'][field.accessor])}
                                </td>
                            </tr>
                            default: return <tr>
                                <th>{field.header}</th>
                                {selectedJob['jobInfo'][field.accessor] ? <td>{selectedJob['jobInfo'][field.accessor]}</td> : <td>-</td>}
                            </tr>
                        }
                    }
                })}
            </tbody>
        </table>
    )
}