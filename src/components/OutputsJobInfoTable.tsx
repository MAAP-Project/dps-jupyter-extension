import React from 'react'
import { useSelector } from 'react-redux'
import { getProducts } from '../utils/utils'
import { selectJobs } from '../redux/slices/jobsSlice'
import { OUTPUTS_JOBS_INFO } from '../templates/OutputsJobInfoTable'
import { EMPTY_FIELD_CHAR } from '../constants'
import { Button } from 'react-bootstrap'
import { FaFolder } from "react-icons/fa"
import { ContentsManager } from '@jupyterlab/services'
import { JupyterFrontEnd } from '@jupyterlab/application'

async function navigateToFolder(folderPath: string, jupyterApp: JupyterFrontEnd): Promise<void> {
    console.log("graceal1 in navigate to folder function");
    folderPath = "/testingFolder/testingFolder2/untitled.txt";

    const contents = jupyterApp.serviceManager.contents;

    // Check if the folder exists
    contents.get(folderPath).then(() => {
        // Navigate to the folder
        jupyterApp.shell.activateById('filebrowser');
        jupyterApp.commands.execute('filebrowser:go-to-path', { path: folderPath });
    }).catch(error => {
        console.error(`Error navigating to folder: ${error.message}`);
        console.log("graceal1 in the error catch of navigateToFolder with");
        console.log(error);
    });
  }

export const OutputsJobInfoTable = ({ jupyterApp }): JSX.Element => {

    // Redux
    const { selectedJob } = useSelector(selectJobs)

    console.log("graceal1 in outputs job info table with ");
    console.log(selectedJob);
    console.log(selectedJob['jobInfo']);
    console.log("graceal1 in the render for outputs job info table and trying to print product file path");
    console.log(selectedJob['jobInfo']['products']);
    
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
                    <Button variant="primary" onClick={() => navigateToFolder("", jupyterApp)}><FaFolder /> Open in Folder</Button>
                </tr>
            </tbody>
        </table>
    )
}