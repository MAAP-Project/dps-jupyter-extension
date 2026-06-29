import React, { useEffect, useState, useMemo } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { Box, CircularProgress, Alert, Tabs, Tab, Chip, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { Notification } from '@jupyterlab/apputils';
import { useMaapApi } from '../../hooks/useMaapApi';
import {
  JobOverviewResponse,
  JobResponse,
  JobResultResponse,
  JobsOverviewResponse,
  LinkObj,
  ProcessResponse,
} from '../../types/api';
import { InitialJobData } from '../../types/types';
import { CopyableField } from '../CopyableField/CopyableField';
import {
  calculateDuration,
  getOutputWorkspacePath,
  handleCopyToClipboard,
  openSubmitJobs,
} from '../../utils/generic';
import { TokenModal } from '../TokenModal/TokenModal';

interface ViewJobsProps {
  app?: JupyterFrontEnd;
}

export const ViewJobs = ({ app }: ViewJobsProps): JSX.Element => {
  const api = useMaapApi();
  const [jobs, setJobs] = useState<JobOverviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobOverviewResponse | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedJobDetails, setSelectedJobDetails] = useState<any | null>(null);
  const [selectedJobProcess, setSelectedJobProcess] = useState<ProcessResponse | null>(null);
  const [loadingJobDetails, setLoadingJobDetails] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedJobResults, setSelectedJobResults] = useState<any | null>(null);
  const [loadingJobResults, setLoadingJobResults] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [showTokenModal, setShowTokenModal] = useState(false);

  const nonterminalJobStatuses = ['accepted', 'running', 'queued'];

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const result: JobsOverviewResponse = await api.fetchJobs({
        fields: 'created,started,finished,tags',
        limit: '250',
      }); // TODO: add processName.
      console.log('Fetching jobs', result.jobs);
      if (result) {
        setJobs(result.jobs);
        setLastRefreshTime(new Date());
      } else {
        setJobs(null);
        setError('Failed to load jobs');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      if (error?.code === 401) {
        setShowTokenModal(true);
      } else {
        const message = error?.message || JSON.stringify(error);
        Notification.error(`Failed to load user jobs: ${message}`, {
          autoClose: false,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [api]);

  const handleTokenSubmitted = () => {
    setShowTokenModal(false);
    loadJobs();
  };

  useEffect(() => {
    if (!selectedJob) {
      setSelectedJobDetails(null);
      return;
    }

    const fetchDetails = async () => {
      setLoadingJobDetails(true);
      try {
        const details = (await api.fetchJobById(selectedJob.jobID, {
          fields: 'inputs,created,started,finished,tags,job_queue',
        })) as JobResponse;
        if (details) {
          setSelectedJobDetails(details);

          // Get process definition of selected job to get input types
          try {
            const process = (await api.fetchProcesses(details.processID)) as ProcessResponse;
            if (process) {
              setSelectedJobProcess(process);
            }
          } catch (error) {
            const message = `Failed to fetch process definition for processID '${selectedJob.processID}': ${error}`;
            Notification.error(message, { autoClose: false });
            throw new Error(message);
          }
        } else {
          setSelectedJobDetails(null);
        }
      } catch (err) {
        setSelectedJobDetails(null);
        console.error('Failed to fetch job details:', err);
      } finally {
        setLoadingJobDetails(false);
      }
    };

    fetchDetails();
  }, [selectedJob, api]);

  useEffect(() => {
    setSelectedJobResults(null);

    if (!selectedJob) {
      return;
    }

    const fetchResults = async () => {
      if (!nonterminalJobStatuses.includes(selectedJob.status)) {
        setLoadingJobResults(true);
        try {
          const result: JobResultResponse = await api.fetchJobResults(selectedJob.jobID);
          if (result) {
            setSelectedJobResults(result);
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          console.error('Failed to fetch results for selected job: ', error);
          const message = error?.detail || JSON.stringify(error);
          Notification.error(`${message}`, { autoClose: false });
        } finally {
          setLoadingJobResults(false);
        }
      }
    };

    fetchResults();
  }, [selectedJob, api]);

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    return date.toISOString().split('.')[0] + 'Z';
  };

  const columns = useMemo<MRT_ColumnDef<JobOverviewResponse>[]>(
    () => [
      {
        accessorKey: 'job_type',
        header: 'Job Type',
      },
      {
        accessorKey: 'tags',
        header: 'Tags',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();
          const statusColors: Record<
            string,
            'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
          > = {
            successful: 'success',
            failed: 'error',
            running: 'info',
            queued: 'warning',
            accepted: 'warning',
            dismissed: 'secondary',
          };
          const color = statusColors[status?.toLowerCase()] || 'default';
          return (
            <Chip
              label={status}
              color={color}
              variant="filled"
              size="small"
              sx={{ color: 'white' }}
            />
          );
        },
        muiTableBodyCellProps: { align: 'center' },
        muiTableHeadCellProps: { align: 'center' },
        enableSorting: false,
        filterVariant: 'select',
        filterSelectOptions: ['successful', 'failed', 'running', 'queued', 'accepted'],
      },
      {
        accessorKey: 'created',
        header: 'Queued',
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          if (!value) return '';
          return formatDateTime(value);
        },
      },
      {
        accessorKey: 'started',
        header: 'Started',
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          if (!value) return '';
          return formatDateTime(value);
        },
      },
      {
        accessorKey: 'finished',
        header: 'Completed',
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          if (!value) return '';
          return formatDateTime(value);
        },
      },
      {
        accessorKey: 'jobID',
        header: 'Job ID',
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: jobs,
    state: {
      isLoading: loading,
    },
    initialState: {
      density: 'compact',
    },
    enableColumnFilters: true,
    enableFullScreenToggle: false,
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <button className="st-button" onClick={loadJobs} disabled={loading}>
          Refresh
        </button>
        {lastRefreshTime && (
          <span style={{ fontSize: '0.85rem', color: '#666' }}>
            Last updated: {lastRefreshTime.toLocaleTimeString()}
          </span>
        )}
      </Box>
    ),
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        console.log('Selected job: ', row.original);
        setSelectedJob(row.original);
      },
      sx: {
        cursor: 'pointer',
        backgroundColor:
          selectedJob?.jobID === row.original.jobID ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
        '&:hover': {
          backgroundColor:
            selectedJob?.jobID === row.original.jobID
              ? 'rgba(33, 150, 243, 0.15)'
              : 'rgba(0, 0, 0, 0.04)',
        },
      },
    }),
  });

  if (error) {
    return (
      <Box sx={{ padding: 2 }}>
        <h2>My MAAP Jobs</h2>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const handleSubmitNewJob = () => {
    if (app) {
      openSubmitJobs(app, null);
    }
  };

  const handleCancelJob = async (jobID: string) => {
    try {
      await api.cancelExecution(jobID);
      Notification.success(`Submitted request to cancel job ${jobID}`, { autoClose: false });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Failed to cancel job: ', error);
      const message = error?.detail || JSON.stringify(error);
      Notification.error(`Failed to cancel job ${jobID}: ${message}`, { autoClose: false });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function navigateToFolder(outputObj: any[]): Promise<void> {
    const contents = app.serviceManager.contents;

    const outputPath = getOutputWorkspacePath(outputObj);
    if (outputPath) {
      contents
        .get(outputPath)
        .then(() => {
          app.shell.activateById('filebrowser');
          app.commands.execute('filebrowser:go-to-path', {
            path: outputPath,
          });
        })
        .catch((error) => {
          const errorMessage = `Error navigating to folder: ${error.message}`;
          console.error(errorMessage);
          Notification.error(errorMessage, { autoClose: false });
        });
    } else {
      Notification.error('No S3 path to outputs found.', { autoClose: false });
    }
  }

  return (
    <>
      <TokenModal
        open={showTokenModal}
        message="A token is required to view your jobs."
        onClose={() => setShowTokenModal(false)}
        onSubmit={handleTokenSubmitted}
      />
      <Box sx={{ padding: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 2,
          }}
        >
          <h2 style={{ margin: 0 }}>My MAAP Jobs</h2>
          <button className="st-button" onClick={handleSubmitNewJob}>
            Submit New Job
          </button>
        </Box>
        <MaterialReactTable table={table} />
        {selectedJob && (
          <Box
            sx={{
              marginTop: 3,
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              border: '1px solid #ddd',
            }}
          >
            <Box
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                padding: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <h3 style={{ margin: 0 }}>Job Details</h3>
                {selectedJob && nonterminalJobStatuses.includes(selectedJob.status) ? (
                  <button
                    className="st-button"
                    onClick={(e) => {
                      handleCancelJob(selectedJob.jobID);
                      e.currentTarget.blur();
                    }}
                  >
                    Cancel Job
                  </button>
                ) : null}
              </Box>
              <IconButton size="small" onClick={() => setSelectedJob(null)} sx={{ color: '#666' }}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                backgroundColor: 'white',
              }}
            >
              <Tab label="General" />
              <Tab label="Inputs" />
              <Tab label="Outputs" />
              <Tab label="Errors" />
            </Tabs>

            <Box sx={{ padding: 2 }}>
              {activeTab === 0 && (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <CopyableField label="Job ID" value={selectedJob.jobID} />
                  <CopyableField
                    label="Queued"
                    value={
                      selectedJobDetails?.created
                        ? formatDateTime(selectedJobDetails.created)
                        : selectedJob.created
                          ? formatDateTime(selectedJob.created)
                          : '-'
                    }
                  />
                  <CopyableField label="Process ID" value={selectedJobDetails?.processID} />
                  <CopyableField
                    label="Started"
                    value={
                      selectedJobDetails?.started
                        ? formatDateTime(selectedJobDetails.started)
                        : selectedJob.started
                          ? formatDateTime(selectedJob.started)
                          : '-'
                    }
                  />
                  <CopyableField label="Status" value={selectedJob.status} />
                  <CopyableField
                    label="Completed"
                    value={
                      selectedJobDetails?.finished
                        ? formatDateTime(selectedJobDetails.finished)
                        : selectedJob.finished
                          ? formatDateTime(selectedJob.finished)
                          : '-'
                    }
                  />
                  <CopyableField label="Tags" value={selectedJob.tags?.join(', ') || '-'} />
                  <CopyableField
                    label="Duration"
                    value={calculateDuration(
                      selectedJobDetails?.started || selectedJob.started,
                      selectedJobDetails?.finished || selectedJob.finished
                    )}
                  />
                  <CopyableField label="Resource" value={selectedJobDetails?.job_queue} />
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  {loadingJobDetails ? (
                    <p style={{ color: '#666' }}>Loading inputs...</p>
                  ) : selectedJobDetails?.inputs ? (
                    <>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr',
                          gap: 2,
                          alignItems: 'start',
                        }}
                      >
                        <Box
                          sx={{
                            fontWeight: 'bold',
                            paddingBottom: 1,
                            borderBottom: '1px solid #ddd',
                          }}
                        >
                          Input Name
                        </Box>
                        <Box
                          sx={{
                            fontWeight: 'bold',
                            paddingBottom: 1,
                            borderBottom: '1px solid #ddd',
                          }}
                        >
                          Type
                        </Box>
                        <Box
                          sx={{
                            fontWeight: 'bold',
                            paddingBottom: 1,
                            borderBottom: '1px solid #ddd',
                          }}
                        >
                          Value
                        </Box>
                        {Array.isArray(selectedJobDetails.inputs) ? (
                          selectedJobDetails.inputs.map(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (input: any, index: number) => (
                              <React.Fragment key={index}>
                                <Box sx={{ fontWeight: 'bold' }}>
                                  {input.name || `Input ${index}`}
                                </Box>

                                <Box sx={{ fontSize: '0.9rem' }}>
                                  {selectedJobProcess?.inputs?.[input.name]?.type || '-'}
                                </Box>

                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    '&:hover .copy-button': { opacity: 1 },
                                  }}
                                >
                                  <span>
                                    {typeof input.value === 'string'
                                      ? input.value
                                      : JSON.stringify(input.value)}
                                  </span>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleCopyToClipboard(
                                        typeof input.value === 'string'
                                          ? input.value
                                          : JSON.stringify(input.value)
                                      )
                                    }
                                    sx={{
                                      opacity: 0,
                                      transition: 'opacity 0.2s',
                                      padding: '2px',
                                      '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                      },
                                    }}
                                    className="copy-button"
                                  >
                                    <ContentCopyIcon sx={{ fontSize: '1rem' }} />
                                  </IconButton>
                                </Box>
                              </React.Fragment>
                            )
                          )
                        ) : typeof selectedJobDetails.inputs === 'object' ? (
                          Object.entries(selectedJobDetails.inputs).map(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            ([key, value]: [string, any]) => (
                              <React.Fragment key={key}>
                                <Box sx={{ fontWeight: 'bold' }}>{key}</Box>

                                <Box sx={{ color: '#666', fontSize: '0.9rem' }}>
                                  {typeof value === 'string'
                                    ? 'string'
                                    : typeof value === 'number'
                                      ? 'number'
                                      : typeof value === 'boolean'
                                        ? 'boolean'
                                        : 'object'}
                                </Box>

                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    '&:hover .copy-button': { opacity: 1 },
                                  }}
                                >
                                  <span>
                                    {typeof value === 'string' ? value : JSON.stringify(value)}
                                  </span>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleCopyToClipboard(
                                        typeof value === 'string' ? value : JSON.stringify(value)
                                      )
                                    }
                                    sx={{
                                      opacity: 0,
                                      transition: 'opacity 0.2s',
                                      padding: '2px',
                                      '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                      },
                                    }}
                                    className="copy-button"
                                  >
                                    <ContentCopyIcon sx={{ fontSize: '1rem' }} />
                                  </IconButton>
                                </Box>
                              </React.Fragment>
                            )
                          )
                        ) : (
                          <Box sx={{ gridColumn: '1 / -1', color: '#666' }}>
                            No input data available
                          </Box>
                        )}
                      </Box>
                    </>
                  ) : (
                    <p style={{ color: '#666' }}>No input data available</p>
                  )}

                  {selectedJob && app && !loadingJobDetails && (
                    <Box sx={{ marginTop: 2 }}>
                      <Tooltip title="Configure a new job using these inputs.">
                        <button
                          className="st-button"
                          onClick={() => {
                            const initialData: InitialJobData = {
                              initialInputs: selectedJobDetails?.inputs,
                              queue: selectedJobDetails?.job_queue,
                              processID: selectedJobDetails?.processID,
                            };
                            app.commands.execute('jobs_submit:open', {
                              ...initialData,
                            });
                          }}
                        >
                          Configure New Job
                        </button>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  {loadingJobResults ? (
                    <p style={{ color: '#666' }}>Loading output data...</p>
                  ) : selectedJobResults?.additionalProp1 ? (
                    selectedJobResults.additionalProp1.id &&
                    selectedJobResults.additionalProp1.links && (
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
                        <Box
                          key={selectedJobResults.additionalProp1.id}
                          sx={{
                            padding: 2,
                            border: '1px solid #ddd',
                            borderRadius: 1,
                            backgroundColor: '#fafafa',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            Output ID: {selectedJobResults.additionalProp1.id}
                            <button
                              className="st-button"
                              onClick={() =>
                                navigateToFolder(selectedJobResults.additionalProp1.links)
                              }
                            >
                              Open in Workspace
                            </button>
                          </Box>
                          {Array.isArray(selectedJobResults.additionalProp1.links) && (
                            <Box sx={{ marginTop: 1 }}>
                              <Box sx={{ marginTop: 1, display: 'grid', gap: 1 }}>
                                {selectedJobResults.additionalProp1.links.map(
                                  (link: LinkObj, linkIndex: number) => (
                                    <Box
                                      key={linkIndex}
                                      sx={{
                                        padding: 1,
                                        backgroundColor: 'white',
                                        border: '1px solid #eee',
                                        borderRadius: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                      }}
                                    >
                                      <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          flex: 1,
                                          color: '#1976d2',
                                          textDecoration: 'none',
                                          wordBreak: 'break-all',
                                          fontSize: '0.85rem',
                                        }}
                                      >
                                        {link.href}
                                      </a>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleCopyToClipboard(link.href)}
                                        sx={{
                                          padding: '2px',
                                          flexShrink: 0,
                                          '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                          },
                                        }}
                                      >
                                        <ContentCopyIcon sx={{ fontSize: '1rem' }} />
                                      </IconButton>
                                    </Box>
                                  )
                                )}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    )
                  ) : (
                    <p style={{ color: '#666' }}>No output data available</p>
                  )}
                </Box>
              )}

              {activeTab === 3 && (
                <Box>
                  {loadingJobResults ? (
                    <p style={{ color: '#666' }}>Loading error information...</p>
                  ) : selectedJobResults?.detail ? (
                    <>
                      {selectedJobResults?.detail ? (
                        <Box
                          sx={{
                            padding: 2,
                            backgroundColor: '#ffebee',
                            border: '1px solid #ef5350',
                            borderRadius: 1,
                            marginBottom: 2,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: 1,
                            }}
                          >
                            <strong style={{ color: '#c62828' }}>Error:</strong>
                            <IconButton
                              size="small"
                              onClick={() => handleCopyToClipboard(selectedJobResults.detail)}
                              sx={{
                                padding: '4px',
                                '&:hover': {
                                  backgroundColor: 'rgba(198, 40, 40, 0.1)',
                                },
                              }}
                            >
                              <ContentCopyIcon sx={{ fontSize: '1rem', color: '#c62828' }} />
                            </IconButton>
                          </Box>
                          <p style={{ margin: 0, color: '#c62828', whiteSpace: 'pre-wrap' }}>
                            {selectedJobResults.detail}
                          </p>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            padding: 2,
                            backgroundColor: '#e8f5e9',
                            border: '1px solid #66bb6a',
                            borderRadius: 1,
                          }}
                        >
                          <strong style={{ color: '#2e7d32' }}>No errors detected</strong>
                          <p style={{ margin: '8px 0 0 0', color: '#2e7d32' }}>
                            Job completed successfully
                          </p>
                        </Box>
                      )}
                    </>
                  ) : (
                    <p style={{ color: '#666' }}>No error information available</p>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};
