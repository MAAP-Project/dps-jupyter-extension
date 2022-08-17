import React from 'react'
import { EXTENSION_CSS_CLASSNAME } from '../../enums'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Tabs, Tab } from 'react-bootstrap'
import { JobSubmissionForm } from '../JobSubmissionForm/JobSubmissionForm'
import { JobsView } from '../JobsView/JobsView'

export const JobsApp = (): JSX.Element => {
  return (
    <div className={EXTENSION_CSS_CLASSNAME}>
      <Tabs defaultActiveKey="view-jobs" id="jobs-widget-tabs" className="mb-3">
        <Tab eventKey="view-jobs" title="View">
          <JobsView/>
        </Tab>
        <Tab eventKey="submit-jobs" title="Submit">
          <JobSubmissionForm />
        </Tab>
      </Tabs>
    </div>
  )
}
