import React from 'react'
import { useSelector } from 'react-redux'
import { selectJobs } from '../redux/slices/jobsSlice'
import { INPUTS_JOBS_INFO } from '../templates/InputsJobInfoTable'
import { IInputParam } from '../types/types'
//import ReactJson from 'react-json-view'

export const InputsJobInfoTable = (): JSX.Element => {

    // Redux
    const { selectedJob } = useSelector(selectJobs)
    console.log("graceal1 printing input.value for src that needs to be valid JSON");
    console.log(selectedJob['jobInfo'][INPUTS_JOBS_INFO.accessor]);
    selectedJob['jobInfo'][INPUTS_JOBS_INFO.accessor].forEach((input: IInputParam) => {
        console.log(typeof(input.value));
        console.log(typeof(input.value) === 'string');
        console.log(input.value);
    });

    return (
        <table className='table'>
            <tbody>
                { // If the job is in a queued state, the inputs (if there are any) are not provided
                  // in the API response, so we have to check they exist first.
                  selectedJob['jobInfo'][INPUTS_JOBS_INFO.accessor] ?
                  selectedJob['jobInfo'][INPUTS_JOBS_INFO.accessor].map((input: IInputParam) => {
                    return <tr key={input.name}>
                        <th>{input.name}</th>
                        { input.value ? 
                            <td>{input.value}</td>
                            : <td>-</td> }
                    </tr>
                }) : <></>}
            </tbody>
        </table>
    )

    /*return (
        <table className='table'>
            <tbody>
                { // If the job is in a queued state, the inputs (if there are any) are not provided
                  // in the API response, so we have to check they exist first.
                  selectedJob['jobInfo'][INPUTS_JOBS_INFO.accessor] ?
                  selectedJob['jobInfo'][INPUTS_JOBS_INFO.accessor].map((input: IInputParam) => {
                    return <tr key={input.name}>
                        <th>{input.name}</th>
                        { input.value ? 
                            (typeof(input.value) === 'string' || typeof(input.value) === 'number') ?
                                <td>{input.value}</td>
                                : <td><ReactJson src={input.value} theme="summerfruit:inverted" collapsed={true} displayDataTypes={false}/></td> 
                            : <td>-</td> }
                    </tr>
                }) : <></>}
            </tbody>
        </table>
    )*/
}