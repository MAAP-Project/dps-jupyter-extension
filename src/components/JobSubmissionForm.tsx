import React from 'react'
import { Button, ButtonToolbar, Form } from 'react-bootstrap'
import { AlgorithmDetailsBox } from './AlgorithmDetailsBox'
import { AlertBox } from './Alerts'
import { useSelector, useDispatch } from 'react-redux'
import AsyncSelect from 'react-select/async';
import { useEffect, useState, useRef } from 'react'
import { selectCMRSwitch, CMRSwitchActions } from '../redux/slices/CMRSwitchSlice'
import { getAlgorithms, describeAlgorithms, getResources, getCMRCollections, submitJob, getUserJobs } from '../api/maap_py'
import { algorithmsActions, selectAlgorithms } from '../redux/slices/algorithmsSlice'
import { parseScienceKeywords } from '../utils/ogc_parsers'
import '../../style/JobSubmission.css'
import { Notification } from "@jupyterlab/apputils"
import { selectUserInfo } from '../redux/slices/userInfoSlice'
import { jobsActions } from '../redux/slices/jobsSlice'
import { parseJobData } from '../utils/mapping'
import { copyNotebookCommand } from '../utils/utils'
import { SUBMITTING_JOB_TEXT, SUBMITTED_JOB_SUCCESS, SUBMITTED_JOB_FAIL } from '../constants'


export const JobSubmissionForm = () => {

    // Redux
    const dispatch = useDispatch()

    const { setAlgorithm, setResource, setAlgorithmMetadata, setCMRCollection } = algorithmsActions
    const { setUserJobInfo, setJobRefreshTimestamp } = jobsActions
    const { selectedAlgorithm, selectedResource, selectedAlgorithmMetadata, selectedCMRCollection } = useSelector(selectAlgorithms)

    const { username } = useSelector(selectUserInfo)

    const { toggleValue, toggleDisabled } = CMRSwitchActions
    const { switchIsChecked, switchIsDisabled } = useSelector(selectCMRSwitch)


    // Local state variables
    const [jobTag, setJobTag] = useState('')
    const [command, setCommand] = useState('')
    const [showWaitCursor, setShowWaitCursor] = useState(false)
    //const [disableButton, setDisableButton] = useState(false)
    const jobSubmitForm = useRef(null)

    useEffect(() => {
        if (selectedAlgorithm != null) {
            let res = describeAlgorithms(selectedAlgorithm["value"])
            res.then((data) => {
                dispatch(setAlgorithmMetadata(data))
            })
        }
    }, [selectedAlgorithm]);

    useEffect(() => {
        if (command != '') {
            copyNotebookCommand(command)
        }
    }, [command]);


    
    useEffect(() => {
        let elems: HTMLCollectionOf<Element> = document.getElementsByClassName("jl-ReactAppWidget")
        let pElement: HTMLElement = document.getElementById("submitting_job_text")
        console.log("graceal1 pElement is ");
        console.log(pElement);
        //let elemsButtons: HTMLCollectionOf<Element> = document.getElementsByClassName("btn btn-primary");
        console.log("graceal1 in the use effect of show wait cursor");
        
        // Apply the css to the parent div
        if (showWaitCursor) {
            elems[0].classList.add('wait-cursor')
            pElement.textContent = SUBMITTING_JOB_TEXT;
        } else {
            elems[0].classList.remove('wait-cursor')
        }
    }, [showWaitCursor]);
    
    /*useEffect(() => {
        console.log("graceal1 in use effect of disable button");
        let elems: HTMLCollectionOf<Element> = document.getElementsByClassName("btn btn-primary");
            
        if (disableButton) {
            for (let i=0;i<elems.length;i++){
                console.log(elems[i]);
                console.log(elems[i].getAttribute("type"));
                if (elems[i].getAttribute("type") === "submit") {
                    elems[i].setAttribute("disabled", "true");
                    console.log("graceal1 disabled button in useEffect");
                    console.log(elems[i]);
                }
            }
        } else {
            for (let i=0;i<elems.length;i++){
                console.warn("graceal1 in else ");
                if (elems[i].getAttribute("type") === "submit" && elems[i].hasAttribute("disabled")) {
                    console.warn("graceal1 in if statement of the else statement");
                    elems[i].removeAttribute("disabled");
                    console.log("graceal1 enabled button in useEffect");
                    console.log(elems[i]);
                }
            }

        }
        console.log("graceal1 printing elems in use effect");
        console.log(elems);
        console.log(disableButton);
    }, [disableButton]);*/

    const handleAlgorithmChange = value => {
        dispatch(setAlgorithm(value))
    }

    const handleResourceChange = value => {
        dispatch(setResource(value))
    }

    const handleCMRCollectionChange = value => {
        dispatch(setCMRCollection(value))
    }

    /*const handleButtonClickSubmit = (event) => {
        event.preventDefault();
        setShowWaitCursor(true);
        setDisableButton(true);
        console.log("graceal1 in handle button click submit");
        if (jobSubmitForm.current) {
            console.log("graceal1 jobSubmitForm.current true");
            jobSubmitForm.current.submit(); // Programmatically submit the form
        }
    }*/
    const disableSubmitButton = () => {
        let elemsButtons: HTMLCollectionOf<Element> = document.getElementsByClassName("btn btn-primary");
        for (let i=0;i<elemsButtons.length;i++){
            console.log(elemsButtons[i]);
            console.log(elemsButtons[i].getAttribute("type"));
            if (elemsButtons[i].getAttribute("type") === "submit") {
                elemsButtons[i].setAttribute("disabled", "true");
                console.log("graceal1 disabled button in onSubmit");
                console.log(elemsButtons[i]);
            }
        }
    }

    const enableSubmitButton = () => {
        let elemsButtons: HTMLCollectionOf<Element> = document.getElementsByClassName("btn btn-primary");
        for (let i=0;i<elemsButtons.length;i++){
            if (elemsButtons[i].getAttribute("type") === "submit" && elemsButtons[i].hasAttribute("disabled")) {
                console.log("graceal1 in if statement of the else statement");
                elemsButtons[i].removeAttribute("disabled");
                console.log("graceal1 enabled button in useEffect");
                console.log(elemsButtons[i]);
            }
        }
    }

    const setSubmittedJobText = (success: boolean, id: string, errorMessage: string) => {
        let pElement: HTMLElement = document.getElementById("submitting_job_text")
        console.log("graceal1 pElement is ");
        console.log(pElement);
        if (success) {
            pElement.textContent = SUBMITTED_JOB_SUCCESS.replace("{TIME}", new Date().toUTCString()).replace("{ID}", id);
        } else {
            pElement.textContent = SUBMITTED_JOB_FAIL.replace("{TIME}", new Date().toUTCString()).replace("{ERROR}", errorMessage);
        }
    }

    const onSubmit = (event: any) => {
        console.log("graceal1 at the beginning of onsubmit");
        disableSubmitButton();
        //setDisableButton(true);
        event.preventDefault();
        

        /*const start = Date.now();
        while (Date.now() - start < 1000) {
            // This loop will keep the CPU busy for about 1 second.
            console.log("in blocking loop");
        }
        console.log("End of blocking code execution");*/
        var jobParams = {
            algo_id: null,
            version: null,
            queue: null,
            username: null,
            identifier: null
        }
        
        if (selectedAlgorithm) {
            let algorithm = selectedAlgorithm.value.split(':')
            jobParams.algo_id = algorithm[0]
            jobParams.version = algorithm[1]
        }
        console.log("graceal1 after selectedAlg if statement");

        if (selectedResource) {
            jobParams.queue = selectedResource.value
        }

        jobParams.username = username
        jobParams.identifier = jobTag

        let data = new FormData(event.target)

        for (const input of data.entries()) {
            jobParams[input[0]] = input[1]
        }

        console.log("graceal1 right before form validation");
        let formValidation = validateForm(jobParams)
        console.log("graceal1 right after form validation");

        
        if (!formValidation) {

            // Submit job
            console.log("graceal1 in !formValidation if statement about to submit job with jobParams");
            console.log(jobParams);
            
            submitJob(jobParams).then((data) => {
                console.log("graceal1 in the then of submitjob with ");
                console.log(data);
                setShowWaitCursor(false);
                console.log("graceal1 trying to enable button in onSubmit because already submitted job");
                enableSubmitButton();
                setSubmittedJobText(true, data['response'], null);
                let msg = " Job submitted successfully. " + data['response']
                Notification.success(msg, { autoClose: false })
            }).catch(error => {
                Notification.error(error.message, { autoClose: false })
                console.log("graceal1 in catch of submit job");
                setShowWaitCursor(false);
                enableSubmitButton();
                setSubmittedJobText(false, null, error.message);
            })

            // Refresh job list once job has been submitted
            let response = getUserJobs(username)
            console.log("graceal1 and response is ");
            console.log(response);

            response.then((data) => {
                console.log("graceal1 in then of response");
                console.log(data);
                dispatch(setUserJobInfo(parseJobData(data["response"]["jobs"])))
            }).finally(() => {
                console.log("graceal1 in finally of response");
                dispatch(setJobRefreshTimestamp(new Date().toUTCString()))
            })
            
        }else {
            console.log("graceal1 in else of !formValidation");
            Notification.error("Job failed to submit because "+formValidation, { autoClose: false })
            setShowWaitCursor(false);
            enableSubmitButton();
            setSubmittedJobText(false, null, formValidation);
        }
        console.log("graceal1 at the very bottom of onsubmit");
    }

    const validateForm = (params) => {
        let errorMsg = ""

        if (!params.algo_id) {
            errorMsg = "missing algorithm selection."
        }else if (!params.identifier) {
            errorMsg = "missing job tag."
        }else if (!params.queue) {
            errorMsg = "missing resource selection."
        }

        return errorMsg
    }

    // Reset job form
    const clearForm = () => {
        dispatch(setAlgorithm(null))
        dispatch(setResource(null))
        dispatch(setAlgorithmMetadata(null))

        setJobTag('')

        if (!switchIsDisabled) {
            dispatch(toggleDisabled())
        }

        if (switchIsChecked) {
            dispatch(toggleValue())
        }

    }

    // Build job submission jupyter notebook command from user-provided selections
    const buildNotebookCommand = () => {
        // maap.submitJob({"algo_id": "test_algo", "username": "anonymous", "queue": "geospec-job_worker-32gb"})
        let jobParams = {
            algo_id: null,
            version: null,
            queue: null,
            username: null,
            identifier: null
        }
        
        if (selectedAlgorithm) {
            let algorithm = selectedAlgorithm.value.split(':')
            jobParams.algo_id = algorithm[0]
            jobParams.version = algorithm[1]
        }

        if (selectedResource) {
            jobParams.queue = selectedResource.value
        }

        jobParams.username = username
        jobParams.identifier = jobTag

        let data = new FormData(jobSubmitForm.current)
        

        let inputStr = ""
        for (const input of data.entries()) {
            jobParams[input[0]] = input[1]
            if (inputStr == "") {
                inputStr = input[0] + "=" + "\"" + input[1] + "\""
            } else {
                inputStr = inputStr + ",\n    " + input[0] + "=" + "\"" + input[1] + "\""
            }
        }

        let tmp = "maap.submitJob(identifier=\"" + jobParams.identifier + "\",\n    " + 
                    "algo_id=\"" + jobParams.algo_id + "\",\n    " + 
                    "version=\"" + jobParams.version + "\",\n    " + 
                    "username=\"" + jobParams.username + "\",\n    " + 
                    "queue=\"" + jobParams.queue + "\",\n    " + inputStr + ")"

        setCommand(tmp)
    }

    console.log("graceal1 in the render of job submission with show wait cursor and disable button as ");
    console.log(showWaitCursor);

    return (
        <div className="submit-wrapper">
            <Form onSubmit={onSubmit} ref={jobSubmitForm}>
            <h5>1. General Information</h5>
                <Form.Group className="mb-3 algorithm-input">
                    <Form.Label>Algorithm</Form.Label>
                    <AsyncSelect
                        menuPortalTarget={document.querySelector('body')}
                        cacheOptions
                        defaultOptions
                        value={selectedAlgorithm}
                        loadOptions={getAlgorithms}
                        onChange={handleAlgorithmChange}
                        placeholder="Select algorithm..."
                    />
                </Form.Group>
                <Form.Group className="mb-3 algorithm-input">
                    <Form.Label>Job Tag</Form.Label>
                    <Form.Control type="text" value={jobTag} placeholder="Enter job tag..." onChange={event => setJobTag(event.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3 algorithm-input">
                    <Form.Label>Resource</Form.Label>
                    <AsyncSelect
                        cacheOptions
                        defaultOptions
                        value={selectedResource}
                        loadOptions={getResources}
                        onChange={handleResourceChange}
                        placeholder="Select resource..."
                    />
                </Form.Group>

                {selectedAlgorithmMetadata ?
                    
                    // If user has selected an algorithm, render inputs and CMR info
                    <><h5>2. Algorithm Inputs</h5>
                        {Array.isArray(selectedAlgorithmMetadata.inputs) ? 
                        selectedAlgorithmMetadata.inputs.map((item, index) => {
                            switch (item["ows:Title"]) {
                                case "publish_to_cmr":
                                    if (switchIsDisabled) {
                                        dispatch(toggleDisabled())
                                    }
                                    return "publish to cmr"
                                case "queue_name":
                                    return "" // already integrated above using the resource async select
                                default:
                                    return <div key={`${item["ows:Title"]}_${index}`}>
                                        <Form.Group className="algorithm-input">
                                            <Form.Label>{`${item["ows:Title"]}`}</Form.Label>
                                            <Form.Control
                                                // value={item["ows:Title"]}
                                                name={item["ows:Title"]}
                                                placeholder={`Enter ${item["ows:Title"]}...`}
                                                required={false}
                                            />
                                        </Form.Group>
                                    </div>}}) : <AlertBox text="No inputs defined for selected algorithm." variant="primary" />}
                        <div className="cmr">
                            <div style={{ display: 'flex' }}>
                                <h5>3. Publish to Content Metadata Repository (CMR)?</h5>
                                <Form.Group>
                                    <Form.Switch
                                        custom
                                        disabled={switchIsDisabled}
                                        type="switch"
                                        checked={switchIsChecked}
                                        onChange={() => dispatch(toggleValue())}
                                    />
                                </Form.Group>
                            </div>
                            {switchIsChecked ?
                                <Form.Group className="mb-3 algorithm-input">
                                    <Form.Label>CMR Collections</Form.Label>
                                    <AsyncSelect
                                        cacheOptions
                                        defaultOptions
                                        value={selectedCMRCollection}
                                        loadOptions={getCMRCollections}
                                        onChange={handleCMRCollectionChange}
                                        placeholder="Select CMR collection..."
                                    />
                                </Form.Group>
                                : null}
                            {selectedCMRCollection && switchIsChecked ?
                                <table className="cmr-table">
                                    <tr>
                                        <td>Concept ID</td>
                                        <td>{selectedCMRCollection["concept-id"]}</td>
                                    </tr>
                                    <tr>
                                        <td>Name</td>
                                        <td>{selectedCMRCollection["ShortName"]}</td>
                                    </tr>
                                    <tr>
                                        <td>Description</td>
                                        <td>{selectedCMRCollection["Description"]}</td>
                                    </tr>
                                    <tr>
                                        <td>Science Keywords</td>
                                        {parseScienceKeywords(selectedCMRCollection["ScienceKeywords"]).map((item) => item + ", ")}
                                    </tr>
                                </table> : null}
                            {switchIsDisabled ? <AlertBox text="CMR publication not available for selected algorithm." variant="primary" /> : null}
                        </div></> : null}

                <hr />
                <ButtonToolbar>
                    <Button type="submit" onClick={() => {
                        setShowWaitCursor(true);
                    }}>Submit Job</Button>
                    <Button variant="outline-secondary" onClick={clearForm}>Clear</Button>
                    <Button variant="outline-primary" style={{marginLeft: 'auto'}} onClick={buildNotebookCommand}>Copy as Jupyter Notebook Code</Button>
                </ButtonToolbar>
                <br />
                <p id="submitting_job_text"></p>
            </Form>
        </div>
    )
}