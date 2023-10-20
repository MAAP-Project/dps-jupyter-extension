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


export const JobSubmissionForm = () => {

    const [showWaitCursor, setShowWaitCursor] = useState(false)
    const [disableButton, setDisableButton] = useState(false)
    const jobSubmitForm = useRef(null)

    
    useEffect(() => {
        let elems: HTMLCollectionOf<Element> = document.getElementsByClassName("jl-ReactAppWidget")
        console.log("graceal1 in the use effect of show wait cursor");
        
        // Apply the css to the parent div
        if (showWaitCursor) {
            elems[0].classList.add('wait-cursor')
        } else {
            elems[0].classList.remove('wait-cursor')
        }
    }, [showWaitCursor]);
    
    useEffect(() => {
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
    }, [disableButton]);

    const onSubmit = (event: any) => {
        console.log("graceal1 at the beginning of onsubmit");
        event.preventDefault();
        
        console.log("graceal1 at the very bottom of onsubmit");
        setShowWaitCursor(false);
        setDisableButton(false);
    }

    

    console.log("graceal1 in the render of job submission with show wait cursor and disable button as ");
    console.log(showWaitCursor);

    return (
        <div className="submit-wrapper">
            <Form onSubmit={onSubmit} ref={jobSubmitForm}>
            
                <ButtonToolbar>
                    <Button type="submit" onClick={() => {
                        setShowWaitCursor(true);
                        setDisableButton(true);
                    }}>Submit Job</Button>
                    </ButtonToolbar>
            </Form>
        </div>
    )
}