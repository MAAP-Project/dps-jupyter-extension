import React from 'react'
import { Nav, Tab } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import '../../../style/JobDetailsContainer.css'
import { GeneralJobInfo } from '../GeneralJobInfo/GeneralJobInfo'
import { InputsJobDetailsTable } from '../InputsJobDetailsTable/InputsJobDetailsTable'
import { selectJobs } from '../../redux/slices/jobsSlice'
import { MetricsJobDetailsTable } from '../MetricsJobDetailsTable/MetricsJobDetailsTable'

export const JobDetailsContainer = (): JSX.Element => {

    // Redux
    const { selectedJob } = useSelector(selectJobs)

    return (
        <div className="job-details-container">
            <h2>Job Details</h2>
            <Tab.Container id="left-tabs-example" defaultActiveKey="general">
                <Nav variant="pills" className="nav-menu">
                    <Nav.Item>
                        <Nav.Link eventKey="general">General</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="inputs">Inputs</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="metrics">Metrics</Nav.Link>
                    </Nav.Item>
                </Nav>
                <Tab.Content>
                    <Tab.Pane eventKey="general">
                        {selectedJob ? <GeneralJobInfo /> : <span className='no-job-selected'>No job selected</span>}
                    </Tab.Pane>
                    <Tab.Pane eventKey="inputs">
                        {selectedJob ? <InputsJobDetailsTable /> : <span className='no-job-selected'>No job selected</span>}
                    </Tab.Pane>
                    <Tab.Pane eventKey="metrics">
                        {selectedJob ? <MetricsJobDetailsTable /> : <span className='no-job-selected'>No job selected</span>}
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </div>
    )
}