import React from 'react'
import { useSelector } from 'react-redux'
import { selectJobs } from '../redux/slices/jobsSlice'
import { INPUTS_JOBS_INFO } from '../templates/InputsJobInfoTable'
import { IInputParam } from '../types/types'
import ReactJson from 'react-json-view'
import { isPlainObject } from '@reduxjs/toolkit';

export const InputsJobInfoTable = (): JSX.Element => {

    // Redux
    const { selectedJob } = useSelector(selectJobs)

    return (
        <table className='table'>
            <tbody>
                { selectedJob['jobInfo'][INPUTS_JOBS_INFO.accessor].map((input: IInputParam) => {
                    return <tr>
                        <th>{input.name}</th>
                        { input.value ? 
                            typeof(input.value) === 'string' ?
                                <td>{input.value}</td>
                                : <td><ReactJson src={input.value} theme="summerfruit:inverted" collapsed={true} displayDataTypes={false}/></td> 
                            : <td>-</td> }
                    </tr>
                })}
            </tbody>
        </table>
    )
}