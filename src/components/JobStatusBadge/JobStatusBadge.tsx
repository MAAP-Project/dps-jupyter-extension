import React from 'react'
import { Badge } from 'react-bootstrap'
import '../../../style/JobStatusBadge.css'

export const JobStatusBadge = ({ status }) => {
    return (
        <Badge pill className={"job-status-bdg job-" + status.toLowerCase()}>{status}</Badge>
    )
}