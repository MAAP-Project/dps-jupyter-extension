import React, { useMemo, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { selectJobsContainer } from '../../redux/slices/JobsContainerSlice'
import { useTable, useGlobalFilter, useSortBy, usePagination } from 'react-table';
import { Button, Table } from 'react-bootstrap';
import { getJobMetrics, getJobResult, getJobStatus, getUserJobs } from '../../api/maap_py';
import { jobsActions, selectJobs } from '../../redux/slices/jobsSlice';
import { BsArrowClockwise } from 'react-icons/bs'
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdLastPage, MdFirstPage } from "react-icons/md";
import { JobStatusBadge } from '../JobStatusBadge/JobStatusBadge';
import '../../../style/base.css'


export const JobsOverviewContainer = (): JSX.Element => {

    // Redux
    const dispatch = useDispatch()

    const { itemSize } = useSelector(selectJobsContainer)
    const { userJobIDs, userJobStatuses, selectedJob } = useSelector(selectJobs)

    const { setUserJobIDs, setUserJobs, setJobStatuses, setSelectedJob } = jobsActions

    // Local component variables
    const [refreshTimestamp, setRefreshTimestamp] = useState(null)

    useEffect(() => {
        // List all jobs for a given user
        let response = getUserJobs("anonymous")
        response.then((data) => {
            dispatch(setUserJobIDs(data["response"]["jobs"]))
        })

    }, []);


    const getStatuses = () => {
        setRefreshTimestamp(new Date().toUTCString())
        if (userJobStatuses) {
            let tmpJobStatuses = []
            userJobIDs.map(jobID => {
                let tmp = { 'jobID': null, 'status': null, 'info': null, 'metrics': null, 'tag': null, 'algorithm': null }
                getJobStatus(jobID).then((data) => {
                    let response = JSON.parse(data["response"])
                    tmp.jobID = response['wps:StatusInfo']['wps:JobID']
                    tmp.status = response['wps:StatusInfo']['wps:Status']
                }).then(() => {
                    switch (tmp.status) {
                        case "Failed":
                        case "Succeeded":
                            Promise.allSettled([getJobResult(tmp.jobID), getJobMetrics(tmp.jobID)])
                                .then(results => {
                                    //console.log(results)
                                    tmp.info = JSON.parse(results[0]["value"]["response"])
                                    tmp.metrics = JSON.parse(results[1]["value"]["response"])
                                    tmpJobStatuses = [...tmpJobStatuses, tmp]
                                    dispatch(setJobStatuses(tmpJobStatuses))
                                })

                        default:
                            console.log("Status not failed or succeed.")
                    }
                })
            })
        }
        //const response = await Promise.allSettled([]);
    }


    useEffect(() => {
        getStatuses()
    }, [userJobIDs]);



    useEffect(() => {
        setPageSize(itemSize)
    }, [itemSize]);


    const handleRowClick = (row) => {
        userJobStatuses.map(job => {
            if (job["jobID"] === row.values.jobID) {
                dispatch(setSelectedJob({ rowIndex: row.index, jobID: row.values.jobID, jobInfo: job }))
                return
            }
        })
    }

    const data = useMemo(() => userJobStatuses, [userJobStatuses])


    const columns = useMemo(
        () => [
            {
                Header: 'Tag',
                accessor: 'tag' as const
            },
            {
                Header: 'Algorithm',
                accessor: 'algorithm' as const
            },
            {
                Header: 'Status',
                accessor: 'status' as const,
                Cell: ({ cell: { row: { values: { status } } } }: any) => <JobStatusBadge status={status} />,
            },
            {
                Header: 'Job ID',
                accessor: 'jobID' as const
            },
            {
                Header: 'Start Time',
                accessor: (row) => {
                    return row['metrics']['metrics']['job_start_time']
                }
            }
        ],
        []
    )

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        // rows,
        page,
        prepareRow,
        state,
        preGlobalFilteredRows,
        setGlobalFilter,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        visibleColumns,
        state: { pageIndex, pageSize }
    } = useTable({ columns, data: data, initialState: { pageIndex: 0, pageSize: itemSize } }, useGlobalFilter, useSortBy, usePagination, useSortBy)

    return (
        <>
            <div className="refresh-info">
                <BsArrowClockwise className="clickable" onClick={getStatuses} size={28} />
                <div className="refresh-timestamp">Last updated: {refreshTimestamp}</div>
            </div>
            <Table {...getTableProps()} >
                <thead >
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()}>
                                    {column.render('Header')}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()} >
                    {page.map(row => {
                        prepareRow(row)
                        return (
                            <tr className={ selectedJob && (selectedJob.rowIndex  === row.index) ? "selected-row" : "" } onClick={() => handleRowClick(row)}>
                                {row.cells.map(cell => {
                                    return (
                                        <td{...cell.getCellProps()}>
                                            {cell.render('Cell')}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
            <div className='overview-footer'>
                <div>
                    Page {pageIndex + 1} of {pageOptions.length}
                </div>{" "}
                <div>
                    <Button variant="outline-primary" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                    <MdFirstPage size={24} />
                </Button>{" "}
                    <Button variant="outline-primary" onClick={() => previousPage()} disabled={!canPreviousPage}>
                        <MdKeyboardArrowLeft size={24} />
                </Button>{" "}
                    <Button variant="outline-primary" onClick={() => nextPage()} disabled={!canNextPage}>
                        <MdKeyboardArrowRight size={24} />
                </Button>{" "}
                    <Button
                        variant="outline-primary"
                        onClick={() => gotoPage(pageCount - 1)}
                        disabled={!canNextPage}
                    >
                        <MdLastPage size={24} />
                </Button>{" "}
                </div>
            </div>
        </>
    )
}