import React, { useEffect } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import { JobSubmissionForm } from './JobSubmissionForm'
import { JobsView } from './JobsView'
import { EXTENSION_CSS_CLASSNAME } from '../constants'
import 'bootstrap/dist/css/bootstrap.min.css'
import { useDispatch, useSelector } from 'react-redux'
import { selectUserInfo, userInfoActions } from '../redux/slices/userInfoSlice'

export const JobsApp = ({ uname }): JSX.Element => {

  // Redux
  const dispatch = useDispatch()
  const { setUsername } = userInfoActions
  const { username } = useSelector(selectUserInfo)

  useEffect(() => {
    dispatch(setUsername(uname))
  }, []);

  return (
    <div className={EXTENSION_CSS_CLASSNAME}>
      {username ? <Tabs defaultActiveKey="view-jobs" id="jobs-widget-tabs" className="mb-3">
        <Tab eventKey="view-jobs" title="View">
          <JobsView />
        </Tab>
        <Tab eventKey="submit-jobs" title="Submit">
          <JobSubmissionForm />
        </Tab>
      </Tabs> : ''}
    </div>
  )
}
