import React from 'react'
import { useSelector } from 'react-redux'
import { getProducts, getProductFilePaths } from '../utils/utils'
import { selectJobs } from '../redux/slices/jobsSlice'
import { OUTPUTS_JOBS_INFO } from '../templates/OutputsJobInfoTable'
import { EMPTY_FIELD_CHAR } from '../constants'
import { Button } from 'react-bootstrap'
import { FaFolder } from "react-icons/fa"
import { ContentsManager } from '@jupyterlab/services'
import { JupyterFrontEnd } from '@jupyterlab/application'

async function navigateToFolder(folderPath: Array<any>, jupyterApp: JupyterFrontEnd): Promise<void> {
    console.log("graceal1 in navigate to folder function with ");
    console.log(folderPath);
    folderPath[0] = "my-private-bucket/dps_output/dps_tutorial_graceal/main/test55/2023/12/04/17/30/05/708167";
    console.log("graceal1 trying to go to folder path "+folderPath[0]);

    const contents = jupyterApp.serviceManager.contents;
    if (folderPath.length > 1) {
        console.error("graceal1 folder path is greater than 1!!! length is "+folderPath.length);
    }

    if (folderPath.length > 0) {
        // Check if the folder exists
        contents.get(folderPath[0]).then(() => {
            // Navigate to the folder
            jupyterApp.shell.activateById('filebrowser');
            jupyterApp.commands.execute('filebrowser:go-to-path', { path: folderPath[0] });
        }).catch(error => {
            console.error(`Error navigating to folder: ${error.message}`);
            console.log("graceal1 in the error catch of navigateToFolder with");
            console.log(error);
        });
    }
  }

export const OutputsJobInfoTable = ({ jupyterApp }): JSX.Element => {

    // Redux
    const { selectedJob } = useSelector(selectJobs)

    console.log("graceal1 in outputs job info table with ");
    console.log(selectedJob);
    console.log(selectedJob['jobInfo']);
    console.log("graceal1 in the render for outputs job info table and trying to print product file path");
    //let temp = ["http://maap-dit-workspace.s3-website-us-west-2.amazonaws.com/grallewellyn/dps_output/aimee-dps-test_ubuntu/segundo/2024/01/10/23/08/53/536069","s3://s3-us-west-2.amazonaws.com:80/maap-dit-workspace/grallewellyn/dps_output/aimee-dps-test_ubuntu/segundo/2024/01/10/23/08/53/536069"].join('\r\n');

    // example where open in file browser is right next to file paths 
    /*return (
        <table className='table'>
            <tbody>
                <tr>
                    <th style={{ whiteSpace: 'pre', verticalAlign: 'middle' }}>{"Product urls"}</th>
                    <td style={{ whiteSpace: 'pre', verticalAlign: 'middle' }}>
                        {temp}
                    </td>
                </tr> 
                <tr>
                    <th style={{ whiteSpace: 'pre', verticalAlign: 'middle' }}>{"Product file paths"}</th>
                    <td style={{ whiteSpace: 'pre', verticalAlign: 'middle' }}>
                        {"dps_output/aimee-dps-test_ubuntu/segundo/2024/01/10/23/08/53/536069               "}
                        <Button variant="primary" onClick={() => navigateToFolder(["t"], jupyterApp)}>
                            <FaFolder />   Open in File Browser
                        </Button>
                    </td>
                </tr>
            </tbody>
        </table> 
    )*/
    // good example where open in file browser is in a different section
    /*return (
        <table className='table'>
            <tbody>
                <tr>
                    <th style={{ whiteSpace: 'pre', verticalAlign: 'middle' }}>{" urls"}</th>
                    <td style={{ whiteSpace: 'pre', verticalAlign: 'middle' }}>
                        {"Testing"}
                    </td>
                </tr> 
                <tr>
                    <th style={{ whiteSpace: 'pre', verticalAlign: 'middle' }}>{" file paths"}</th>
                    <td style={{ whiteSpace: 'pre', verticalAlign: 'middle' }}>
                        {"Testing output"}
                    </td>
                    <td style={{ whiteSpace: 'pre', verticalAlign: 'middle' }}>
                        <Button variant="primary" onClick={() => navigateToFolder(["t"], jupyterApp)}>
                            <FaFolder />   Open in File Browser
                        </Button>
                    </td>
                </tr>
            </tbody>
        </table> 
    )*/
    
    // one example where the UI looks good 
    /*return (
        <table className='table'>
            <tbody>
                <tr>
                    <th>{" urls"}</th>
                    <td style={{ whiteSpace: 'pre' }}>
                        {"Testing"}
                    </td>
                </tr> 
                <tr>
                    <td><b>{" file paths"}</b></td>
                    <td style={{ whiteSpace: 'pre' }}>
                        {"Testing output"}
                    </td>
                    <td style={{ whiteSpace: 'pre' }}>
                        <Button variant="primary" onClick={() => navigateToFolder(["t"], jupyterApp)}><FaFolder />   Open in File Browser</Button>
                    </td>
                </tr>
            </tbody>
        </table> 
    )*/
    
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