import React from 'react'
import { useSelector } from 'react-redux'
import { getProducts, getProductFilePaths } from '../utils/utils'
import { selectJobs } from '../redux/slices/jobsSlice'
import { OUTPUTS_JOBS_INFO } from '../templates/OutputsJobInfoTable'
import { EMPTY_FIELD_CHAR } from '../constants'
import { Button } from 'react-bootstrap'
import { FaFolder } from "react-icons/fa"
import { JupyterFrontEnd } from '@jupyterlab/application'

async function navigateToFolder(folderPath: Array<any>, jupyterApp: JupyterFrontEnd): Promise<void> {
    const contents = jupyterApp.serviceManager.contents;
    if (folderPath.length > 1) console.error("Folder path was "+folderPath.length+". We are only looking at the first element.");

    if (folderPath.length > 0) {
        // Check if the folder exists
        contents.get(folderPath[0]).then(() => {
            // Navigate to the folder
            jupyterApp.shell.activateById('filebrowser');
            jupyterApp.commands.execute('filebrowser:go-to-path', { path: folderPath[0] });
        }).catch(error => {
            console.error(`Error navigating to folder: ${error.message}`);
        });
    }
  }

export const OutputsJobInfoTable = ({ jupyterApp }): JSX.Element => {

    // Redux
    const { selectedJob } = useSelector(selectJobs)

    return (
        <table className='table'>
            <tbody>
                {OUTPUTS_JOBS_INFO.map((field) => {
                    {
                        if (selectedJob['jobInfo'][field.accessor]) {
                            return <>
                                <tr>
                                    <th style={{ whiteSpace: 'pre', verticalAlign: 'middle' }}>{field.header+ " urls"}</th>
                                    <td style={{ whiteSpace: 'pre', verticalAlign: 'middle' }}>
                                        {getProducts(selectedJob['jobInfo'][field.accessor])}
                                    </td>
                                </tr> 
                                <tr>
                                    <th style={{ whiteSpace: 'pre', verticalAlign: 'middle' }}>{field.header+ " file paths"}</th>
                                    <td style={{ whiteSpace: 'pre', verticalAlign: 'middle' }}>
                                        {getProductFilePaths(selectedJob['jobInfo'][field.accessor])+"               "}
                                        <Button variant="primary" onClick={() => navigateToFolder(getProductFilePaths(selectedJob['jobInfo'][field.accessor]), jupyterApp)}><FaFolder />   Open in File Browser</Button>
                                    </td>
                                    <td style={{ whiteSpace: 'pre', verticalAlign: 'middle' }}>
                                        
                                    </td>
                                </tr>
                            </>
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