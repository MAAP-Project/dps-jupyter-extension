import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectJobs } from '../redux/slices/jobsSlice'
import { GENERAL_JOBS_INFO } from '../templates/GeneralJobInfoTable'
import { getProducts, secondsToReadableString } from '../utils/utils'
import { EMPTY_FIELD_CHAR } from '../constants'

export const GeneralJobInfoTable = (): JSX.Element => {

    // Redux
    const { selectedJob } = useSelector(selectJobs)


    // Component local state
    const [expandError, setExpandError] = useState(false)

    return (
        <table className='table'>
            <tbody>
                {GENERAL_JOBS_INFO.map((field) => {
                    {
                        if (selectedJob['jobInfo'][field.accessor]) {
                            switch (field.accessor) {
                                case "products": return <tr>
                                    <th>{field.header}</th>
                                    <td style={{ whiteSpace: 'pre' }}>
                                        {getProducts(selectedJob['jobInfo'][field.accessor])}
                                    </td>
                                </tr>
                                case "error": return <tr>
                                    <th>{field.header}</th>
                                    <td>
                                        <div onClick={() => setExpandError(!expandError)} className={expandError ? "show-content clickable" : "hide-content clickable"}>{selectedJob['jobInfo'][field.accessor]}</div>
                                    </td>
                                </tr>
                                case "duration": return <tr>
                                    <th>{field.header}</th>
                                    <td>
                                        {secondsToReadableString(selectedJob['jobInfo'][field.accessor])}
                                    </td>
                                </tr>
                                default: return <tr>
                                    <th>{field.header}</th>
                                    <td>{selectedJob['jobInfo'][field.accessor]}</td>
                                </tr>
                            }
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