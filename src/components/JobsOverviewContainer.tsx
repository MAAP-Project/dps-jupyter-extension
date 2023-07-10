import React, { useMemo, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectJobsContainer, JobsContainerActions } from '../redux/slices/JobsContainerSlice'
import { useTable, useGlobalFilter, useSortBy, usePagination, useAsyncDebounce } from 'react-table';
import { Pagination, FormControl, InputGroup, Spinner, Table, Button } from 'react-bootstrap';
import { getUserJobs } from '../api/maap_py';
import { jobsActions, selectJobs } from '../redux/slices/jobsSlice';
import { BsArrowClockwise } from 'react-icons/bs'
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";
import { JobStatusBadge } from './JobStatusBadge';
import { parseJobData } from '../utils/mapping'
import { Search } from 'react-bootstrap-icons';
import "../../style/JobsOverview.css"
import { selectUserInfo } from '../redux/slices/userInfoSlice';

const GlobalFilter = ({
    preGlobalFilteredRows,
    globalFilter,
    setGlobalFilter,
}: any) => {
    const [value, setValue] = React.useState(globalFilter)

    const onChange = useAsyncDebounce(value => {
        setGlobalFilter(value || undefined)
    }, 200)


    return (
        <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1"><Search /></InputGroup.Text>
            <FormControl
                type="search"
                key="globalSearch"
                placeholder={`Search records...`}
                aria-label="Search"
                aria-describedby="basic-addon1"
                value={value || ""}
                onChange={e => {
                    setValue(e.target.value);
                    onChange(e.target.value);
                }}
            />
        </InputGroup>
    )
}

export const JobsOverviewContainer = (): JSX.Element => {

    // Redux
    const dispatch = useDispatch()

    const { itemSize } = useSelector(selectJobsContainer)
    const { selectedJob, userJobInfo, formattedJobsInfo, jobRefreshTimestamp } = useSelector(selectJobs)
    const { username } = useSelector(selectUserInfo)

    const { setSelectedJob, setUserJobInfo, setFormattedJobsInfo, setJobRefreshTimestamp } = jobsActions

    // Local component variables
    const [showSpinner, setShowSpinner] = useState(false)

    const getJobInfo = () => {

        setShowSpinner(true)

        // List all jobs for a given user
        let response = getUserJobs(username)

        response.then((data) => {
            dispatch(setUserJobInfo(parseJobData(data["response"]["jobs"])))
        }).finally(() => {
            setShowSpinner(false)
            dispatch(setJobRefreshTimestamp(new Date().toUTCString()))
            setGlobalFilter(state.globalFilter)
        })
    }

    useEffect(() => {
        getJobInfo()
    }, []);


    useEffect(() => {
        setPageSize(itemSize)
    }, [itemSize]);


    const handleRowClick = (row) => {
        userJobInfo.map(job => {
            if (job['payload_id'] === row.values.payload_id) {
                dispatch(setSelectedJob({ rowIndex: row.index, jobID: row.values.payload_id, jobInfo: job }))
                return
            }
        })
    }

    const dateSort = useMemo(
        () => (rowA, rowB, columnId) => {

            // TODO: case where endtime is null but start time is not.

            if (rowA.values[columnId] === "") {
                const a = new Date(rowA.values["time_queued"]);
                const b = new Date(rowB.values[columnId]);
                return a > b ? 1 : -1;
                //return -1
            }

            if (rowB.values[columnId] === "") {
                const a = new Date(rowA.values[columnId]);
                const b = new Date(rowB.values["time_queued"]);
                return a > b ? 1 : -1;
                //return 1
            }

            const a = new Date(rowA.values[columnId]);
            const b = new Date(rowB.values[columnId]);



            return a > b ? 1 : -1;
        },
        []
    );

    const testSort = (canSort, isSortedDesc) => {
        if (canSort) {
            if (isSortedDesc) {
                return <MdKeyboardArrowUp size={24} />
            } else {
                return <MdKeyboardArrowDown size={24} />
            }
        }
    }

    const data = useMemo(() => userJobInfo, [userJobInfo])
    const columns = useMemo(
        () => [
            {
                Header: 'Tag',
                accessor: 'tags' as const,
                disableSortBy: true,
                maxWidth: 350,
            },
            {
                Header: 'Job Type',
                accessor: 'job_type' as const,
                disableSortBy: true,
                maxWidth: 300,
            },
            {
                Header: 'Status',
                accessor: 'status' as const,
                disableSortBy: true,
                maxWidth: 300,
                Cell: ({ cell: { row: { values: { status } } } }: any) => <JobStatusBadge status={status} />,
            },
            {
                Header: 'Queued Time',
                accessor: 'time_queued' as const,
                sortType: dateSort,
                //disableSortBy: true,
                // enableSortingRemoval: false,
                sortDescFirst: true,
                maxWidth: 300,
            },
            {
                Header: 'Start Time',
                accessor: 'time_start' as const,
                sortType: dateSort,
                sortDescFirst: true,
                maxWidth: 300,
                // sortUndefined: -1
                //sortType: 'datetime',
                //Cell: ({ cell: { row: { values: { time_sort } } } }: any) => time_sort,

            },
            {
                Header: 'End Time',
                accessor: 'time_end' as const,
                sortType: dateSort,
                sortDescFirst: true,
                //disableSortBy: true,
                maxWidth: 300,
            },
            {
                Header: 'Payload ID',
                accessor: 'payload_id' as const,
                disableSortBy: true,
                maxWidth: 300,
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
        state: { pageIndex, pageSize, sortBy }
    } = useTable({
        columns, data: data, disableSortRemove: true, initialState: {
            pageIndex: 0, pageSize: itemSize, sortBy: [
                {
                    id: "time_start",
                    desc: true
                },
            ],
        }
    }, useGlobalFilter, useSortBy, usePagination)

    return (
        <div>
            <div className="overview-header">
                <div className="margin-1rem">
                    <h1>My Jobs</h1>
                </div>
                <div className="refresh-info">
                    <Button onClick={getJobInfo} ><BsArrowClockwise className="clickable" size={24} />Refresh</Button>
                    {jobRefreshTimestamp ? <div className="refresh-timestamp">Last updated: {jobRefreshTimestamp}</div> : ""}
                </div>
            </div>
            <div className="global-filter">
                <GlobalFilter
                    preGlobalFilteredRows={preGlobalFilteredRows}
                    globalFilter={state.globalFilter}
                    setGlobalFilter={setGlobalFilter}
                />
            </div>

            <div className='pagination'>
                <Pagination>
                    <Pagination.First onClick={() => gotoPage(0)} disabled={!canPreviousPage} />
                    <Pagination.Prev onClick={() => previousPage()} disabled={!canPreviousPage} />
                    <Pagination.Next onClick={() => nextPage()} disabled={!canNextPage} />
                    <Pagination.Last onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} />
                </Pagination>
                <span>Page {pageOptions.length === 0 ? 0 : pageIndex + 1} of {pageOptions.length}</span>
            </div>

            <div className="table-container">
                <Table {...getTableProps()} >
                    <thead >
                        {headerGroups.map(headerGroup => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map(column => (
                                    <th {...column.getHeaderProps()}
                                    >
                                        <span {...column.getSortByToggleProps()}>
                                            {testSort(column.canSort, column.isSortedDesc)}
                                            {/* {column.canSort ? (column.isSortedDesc ? <MdKeyboardArrowUp size={24} /> : <MdKeyboardArrowDown size={24} />) : ""} */}
                                        </span>
                                        {column.render('Header')}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    {showSpinner ? <tbody><tr><td colSpan={columns.length} style={{ textAlign: "center" }}><Spinner animation="border" variant="primary" /></td></tr></tbody> :
                        <tbody {...getTableBodyProps()} >
                            {page.map(row => {
                                prepareRow(row)
                                return (
                                    <tr className={selectedJob && (selectedJob.rowIndex === row.index) ? "selected-row" : ""} onClick={() => handleRowClick(row)}>
                                        {row.cells.map(cell => {
                                            return (
                                                <td className="cell-overflow" {...cell.getCellProps({
                                                    style: {
                                                        maxWidth: cell.column.maxWidth
                                                    }
                                                })}>
                                                    {cell.render('Cell')}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>}
                </Table>
            </div>
        </div>
    )
}