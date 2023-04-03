import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { EMPTY_FIELD_CHAR } from '../constants'
import { selectJobs } from '../redux/slices/jobsSlice'
import { ERRORS_JOBS_INFO } from '../templates/ErrorsJobInfoTable'

export const ErrorsJobInfoTable = (): JSX.Element => {

    // Redux
    const { selectedJob } = useSelector(selectJobs)

    // Component local state
    const [expandError, setExpandError] = useState(false)

    return (
        <table className='table'>
            <tbody>
                {ERRORS_JOBS_INFO.map((field) => {
                    {
                        // The 'errors' key exists only if there are errors
                        if (selectedJob['jobInfo'][field.accessor]) {
                            return <tr>
                                <th>{field.header}</th>
                                <td>
                                    <div onClick={() => setExpandError(!expandError)} className={expandError ? "show-content clickable" : "hide-content clickable"}>{selectedJob['jobInfo'][field.accessor]}</div>
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
            </tbody>
        </table>
    )
}