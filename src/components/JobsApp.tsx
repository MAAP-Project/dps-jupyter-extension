import React, { useEffect } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import { JobSubmissionForm } from './JobSubmissionForm'
import { JobsView } from './JobsView'
import { EXTENSION_CSS_CLASSNAME } from '../constants'
import 'bootstrap/dist/css/bootstrap.min.css'
import { useDispatch } from 'react-redux'
import { userInfoActions } from '../redux/slices/userInfoSlice'

export const JobsApp = ({ uname }): JSX.Element => {

  // Redux
  const dispatch = useDispatch()
  const { setUsername } = userInfoActions

  useEffect(() => {
    dispatch(setUsername(uname))
  }, []);

  return (
    <div className={EXTENSION_CSS_CLASSNAME}>
      <Tabs defaultActiveKey="view-jobs" id="jobs-widget-tabs" className="mb-3">
        <Tab eventKey="view-jobs" title="View">
          <JobsView />
        </Tab>
        <Tab eventKey="submit-jobs" title="Submit">
          <JobSubmissionForm />
        </Tab>
      </Tabs>
    </div>
  )
}
