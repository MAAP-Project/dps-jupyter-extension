import React from 'react'
import { Button, Nav, Tab } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { GeneralJobInfoTable } from './GeneralJobInfoTable'
import { InputsJobInfoTable } from './InputsJobInfoTable'
import { selectJobs } from '../redux/slices/jobsSlice'
import { MetricsJobInfoTable } from './MetricsJobInfoTable'
import '../../style/JobDetailsContainer.css'
import { ErrorsJobInfoTable } from './ErrorsJobInfoTable'
import { OutputsJobInfoTable } from './OutputsJobInfoTable'
import { JOB_QUEUED, JOB_STARTED } from '../constants'
import { cancelJob } from '../api/maap_py'
import { Notification } from "@jupyterlab/apputils";

export const JobDetailsContainer = ({ jupyterApp }): JSX.Element => {

    // Redux
    const { selectedJob } = useSelector(selectJobs)

    const cancelableStatuses: string[] = [JOB_STARTED, JOB_QUEUED] 

    const handleCancelJob = (job_id: string) => {
        cancelJob(job_id)
          .then((response) => {
            if (response["exception_code"] === "") {
              Notification.success(response["response"], { autoClose: false });
              return;
            }
            Notification.error(response["response"], { autoClose: false });
          })
          .catch((error) => {
            Notification.error(error.message, { autoClose: false });
          });
      };

    return (
      <div className="job-details-container">
        <div>
          <h2>Job Details</h2>
          {selectedJob && cancelableStatuses.includes(selectedJob["jobInfo"]["status"]) ? (
            // TODO
            <Button variant="outline-primary" onClick={() =>
                handleCancelJob(selectedJob["jobInfo"]["payload_id"])
              }>Cancel Job</Button>
          ) : null}
        </div>
        <Tab.Container id="left-tabs-example" defaultActiveKey="general">
          <Nav variant="pills" className="nav-menu">
            <Nav.Item>
              <Nav.Link eventKey="general">General</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="inputs">Inputs</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="outputs">Outputs</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="errors">Errors</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="metrics">Metrics</Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content className="content-padding">
            <Tab.Pane eventKey="general">
              {selectedJob ? (
                <GeneralJobInfoTable />
              ) : (
                <div className="subtext">No job selected</div>
              )}
            </Tab.Pane>
            <Tab.Pane eventKey="inputs">
              {selectedJob ? (
                <InputsJobInfoTable />
              ) : (
                <span className="subtext">No job selected</span>
              )}
            </Tab.Pane>
            <Tab.Pane eventKey="outputs">
              {selectedJob ? (
                <OutputsJobInfoTable jupyterApp={jupyterApp} />
              ) : (
                <span className="subtext">No job selected</span>
              )}
            </Tab.Pane>
            <Tab.Pane eventKey="errors">
              {selectedJob ? (
                <ErrorsJobInfoTable />
              ) : (
                <span className="subtext">No job selected</span>
              )}
            </Tab.Pane>
            <Tab.Pane eventKey="metrics">
              {selectedJob ? (
                <MetricsJobInfoTable />
              ) : (
                <span className="subtext">No job selected</span>
              )}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    );
}