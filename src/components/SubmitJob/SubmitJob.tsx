import React, { useEffect, useState } from 'react';
import { Notification } from '@jupyterlab/apputils';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { Autocomplete, TextField, Tooltip, Switch, Box } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useMaapApi } from '../../hooks/useMaapApi';
import {
  ProcessExecutionSuccessResponse,
  ProcessListResponse,
  ProcessResponse,
  ProcessSummary,
} from '../../types/api';
import { TokenModal } from '../TokenModal/TokenModal';
import { InitialJobData } from '../../types/types';

interface SubmitJobsProps {
  app?: JupyterFrontEnd;
  initialData?: InitialJobData;
}

export const SubmitJobs = ({ app, initialData }: SubmitJobsProps): JSX.Element => {
  const api = useMaapApi();
  const [processes, setProcesses] = useState<ProcessSummary[]>([]);
  const [selectedProcessName, setSelectedProcessName] = useState<string>('');
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [processDetails, setProcessDetails] = useState<ProcessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formInputs, setFormInputs] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [jobTag, setJobTag] = useState<string>('');
  const [queues, setQueues] = useState<string[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<string>('');
  const [loadingQueues, setLoadingQueues] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);

  const loadProcesses = async () => {
    setLoading(true);
    const result = (await api.fetchProcesses()) as ProcessListResponse;
    console.log('Process list: ', result.processes);
    if (result) {
      // Extract process ID from the process links for easy access
      const processesExtended = result.processes.map((process) => ({
        ...process,
        processID: getProcessIdFromLinks(process),
      }));
      console.log('Process list with metadata: ', processesExtended);
      setProcesses(processesExtended);
    }
    setLoading(false);
  };

  /**
   *
   * @param process
   * @returns
   */
  const getProcessIdFromLinks = (process: ProcessSummary): number | undefined => {
    const selfLink = process.links?.find((link) => link.rel === 'self');
    if (selfLink?.href) {
      const match = selfLink.href.match(/processes\/([^/]+)$/);
      return match ? parseInt(match[1], 10) : undefined;
    }
    return process.processID;
  };

  /**
   * Fetch resource queues user has access to. If response indicates invalid authorization,
   * display a modal prompting user to enter their token. All other failures will be
   * captured as a toast.
   */
  const loadQueues = async () => {
    setLoadingQueues(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await api.fetchResources();
      if (!result.queues || result.queues.length === 0) {
        throw new Error('No queues returned.');
      }
      setQueues(result.queues.sort());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      if (error?.code === 401) {
        setShowTokenModal(true);
      } else {
        const message = error?.message || JSON.stringify(error);
        Notification.error(`Failed to load resource queues: ${message}`, {
          autoClose: false,
        });
      }
    } finally {
      setLoadingQueues(false);
    }
  };

  useEffect(() => {
    loadProcesses();
    loadQueues();
  }, [api]);

  // Get unique versions for the selected process
  const getVersionsForProcess = (processName: string): string[] => {
    return [...new Set(processes.filter((p) => p.id === processName).map((p) => p.version))].sort();
  };

  useEffect(() => {
    const versions = getVersionsForProcess(selectedProcessName);
    setAvailableVersions(versions);
  }, [selectedProcessName, processes]);

  // If opening submit jobs ui with args passed in, set the process
  useEffect(() => {
    if (initialData && processes.length > 0) {
      console.log('The initial data: ', initialData);
      if (initialData.processID) {
        // Confirm the process that was passed in exists in the list of registered processes
        const matchingProcess: ProcessSummary = processes.find(
          (p) => p.processID === initialData.processID
        );
        if (!matchingProcess) {
          Notification.error(`Process with ID "${initialData.processID}" not found`, {
            autoClose: false,
          });
          return;
        }
        setSelectedProcessName(matchingProcess.id);
      }
    }
  }, [processes, initialData]);

  // If opening submit jobs ui with args passed in, set the version of the process
  useEffect(() => {
    if (initialData && availableVersions.length > 0) {
      if (initialData.processID) {
        const matchingProcess: ProcessSummary = processes.find(
          (p) => p.processID === initialData.processID
        );
        if (!matchingProcess) {
          Notification.error(`Process with ID "${initialData.processID}" not found`, {
            autoClose: false,
          });
          return;
        }
        const version = availableVersions.find((v) => v === matchingProcess.version);
        if (!version) {
          Notification.error(`Process  "${initialData.processID}" not found`, {
            autoClose: false,
          });
          return;
        }
        setSelectedVersion(version);
      }
    }
  }, [availableVersions, processes]);

  // Reset form when user selects a new process
  useEffect(() => {
    setSelectedVersion('');
    setFormInputs({});
    setValidationErrors({});
  }, [selectedProcessName]);

  const loadProcessDetails = async () => {
    if (!selectedProcessName || !selectedVersion) {
      setProcessDetails(null);
      return;
    }

    const selectedProcess = processes.find(
      (p) => p.id === selectedProcessName && p.version === selectedVersion
    );

    if (!selectedProcess || !selectedProcess.processID) {
      setProcessDetails(null);
      return;
    }

    setLoadingDetails(true);
    const details = (await api.fetchProcesses(selectedProcess.processID)) as ProcessResponse;
    setProcessDetails(details);
    setLoadingDetails(false);
  };

  // Fetch process details when both process and version are selected
  useEffect(() => {
    loadProcessDetails();
  }, [selectedProcessName, selectedVersion, processes, api]);

  const setFormProcessInputDefaults = () => {
    if (processDetails && processDetails.inputs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const initialInputs: Record<string, any> = {};
      Object.entries(processDetails.inputs).forEach(([key, input]) => {
        if (input.default !== undefined && input.default !== null) {
          switch (input.type?.toLowerCase()) {
            case 'boolean':
              initialInputs[key] = String(input.default).toLowerCase() === 'true' ? true : false;
              break;
            case 'number':
              initialInputs[key] = Number(input.default);
              break;
            default:
              initialInputs[key] = String(input.default);
          }
        } else {
          initialInputs[key] = null;
        }
      });
      setFormInputs((prev) => ({
        ...initialInputs,
        ...prev,
      }));
    }
  };

  // Initialize form inputs with default values from process details
  useEffect(() => {
    setFormProcessInputDefaults();
  }, [processDetails]);

  const handleTokenSubmitted = () => {
    setShowTokenModal(false);
    loadQueues();
  };

  useEffect(() => {
    if (initialData && formInputs) {
      if (initialData.initialInputs && processDetails?.inputs) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const initialInputs: Record<string, any> = {};
        Object.entries(initialData.initialInputs).forEach(([key, inputObj]) => {
          console.log(key);
          const inputName = inputObj.name;
          const inputDef = processDetails.inputs[inputName];
          if (inputDef) {
            // Type cast based on the input definition
            switch (inputDef.type?.toLowerCase()) {
              case 'boolean':
                initialInputs[inputName] =
                  String(inputObj.value).toLowerCase() === 'true' ? true : false;
                break;
              case 'number':
                initialInputs[inputName] = Number(inputObj.value);
                break;
              default:
                initialInputs[inputName] = String(inputObj.value);
            }
          }
        });
        setFormInputs((prev) => ({
          ...prev,
          ...initialInputs,
        }));
      }
    }
  }, [initialData, processDetails]);

  // Get unique processes names
  const uniqueProcessNames = Array.from(new Map(processes.map((p) => [p.id, p])).values()).sort(
    (a, b) => a.id.localeCompare(b.id)
  );

  const validateInputs = (): boolean => {
    const errors: Record<string, string> = {};

    console.log('Validating form inputs: ', formInputs);

    if (!selectedProcessName) {
      errors.process = 'Process is required';
    }
    if (!selectedVersion) {
      errors.version = 'Version is required';
    }
    if (!selectedQueue) {
      errors.queue = 'Queue is required';
      setShowTokenModal(true);
    }

    if (processDetails && processDetails.inputs) {
      Object.entries(processDetails.inputs).forEach(([key, input]) => {
        const value = formInputs[key] || null;

        // Make sure required fields are not null
        if (!input?.optional && value == null) {
          console.log('Value is null and should not be: ', key, value);
          errors[key] = `Input value required. Cannot be null.`;
        }

        // Validate process inputs against their types defined in the process definition
        if (value) {
          switch (input.type?.toLowerCase()) {
            case 'number':
              if (isNaN(Number(value))) {
                errors[key] = `Incorrect type: expected number`;
              }
              break;
            case 'boolean':
              if (typeof value !== 'boolean') {
                errors[key] = `Incorrect type: expected boolean`;
              }
              break;
            case 'text':
              if (typeof value !== 'string') {
                errors[key] = `Incorrect type: expected string`;
              }
              break;
            default:
              break;
          }
        }
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) {
      return;
    }

    setSubmitting(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inputParams: Record<string, any> = {};
    Object.entries(formInputs).forEach(([key, value]) => {
      const inputDef = processDetails?.inputs?.[key];
      const isOptional = inputDef?.optional === true;

      // If value is null/empty and field is optional, skip it
      if ((value === null || value === '' || value === undefined) && isOptional) {
        return;
      }
      inputParams[key] = value;
    });

    console.log('Input params to use: ', inputParams);

    try {
      const response = (await api.submitJob(processDetails.processID.toString(), {
        inputs: inputParams,
        queue: selectedQueue,
        job_tag: jobTag,
      })) as ProcessExecutionSuccessResponse;
      setFormInputs({});
      setValidationErrors({});
      Notification.success(`Job submitted successfully. Job ID: \n ${response.jobID}`, {
        autoClose: false,
        actions: [
          {
            label: 'View Jobs',
            callback: () => {
              app.commands.execute('jobs_view:open');
            },
          },
        ],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.title || error?.detail || 'Failed to submit job.';
      Notification.error(message, { autoClose: false });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <TokenModal
        open={showTokenModal}
        message="A token is required to submit jobs."
        onClose={() => setShowTokenModal(false)}
        onSubmit={handleTokenSubmitted}
      />
      <div className="submit-jobs-container">
        <h2>Submit MAAP Jobs</h2>
        <div style={{ display: 'flex', gap: '32px' }}>
          <div style={{ flex: '0 0 280px' }}>
            <div className="form-group">
              <Autocomplete
                disabled={loading}
                options={uniqueProcessNames.map((p) => p.id)}
                value={selectedProcessName || null}
                onChange={(_, value) => {
                  setSelectedProcessName(value || '');
                }}
                noOptionsText={loading ? 'Loading processes...' : 'No processes found'}
                loading={loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      <span>
                        Process <span style={{ color: 'red' }}>*</span>
                      </span>
                    }
                    placeholder="Select a process"
                    size="small"
                    error={!!validationErrors.process}
                    helperText={validationErrors.process}
                  />
                )}
              />
            </div>

            <div className="form-group">
              <Autocomplete
                disabled={!selectedProcessName || availableVersions.length === 0}
                options={availableVersions}
                value={selectedVersion || null}
                onChange={(_, value) => {
                  setSelectedVersion(value || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      <span>
                        Version <span style={{ color: 'red' }}>*</span>
                      </span>
                    }
                    placeholder="Select a version"
                    size="small"
                    error={!!validationErrors.version}
                    helperText={validationErrors.version}
                  />
                )}
              />
            </div>

            <div className="form-group">
              <Autocomplete
                disabled={loadingQueues || queues.length === 0}
                options={queues}
                value={selectedQueue || null}
                onChange={(_, value) => {
                  setSelectedQueue(value || '');
                }}
                loading={loadingQueues}
                noOptionsText={loadingQueues ? 'Loading queues...' : 'No queues available'}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      <span>
                        Queue <span style={{ color: 'red' }}>*</span>
                      </span>
                    }
                    placeholder="Select a queue"
                    size="small"
                    error={!!validationErrors.queue}
                    helperText={validationErrors.queue}
                  />
                )}
              />
            </div>

            <div className="form-group">
              <TextField
                id="job-tag"
                label="Job tag"
                type="text"
                size="small"
                value={jobTag}
                onChange={(e) => setJobTag(e.target.value)}
                sx={{ width: '100%' }}
              />
            </div>
          </div>

          {selectedVersion && processDetails && (
            <div style={{ flex: 1, paddingTop: '8px' }}>
              {processDetails.description && (
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }}
                >
                  <h4
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    Algorithm Description
                  </h4>
                  <p
                    style={{
                      margin: '0 0 10px 0',
                      fontSize: '12px',
                      lineHeight: 1.5,
                      color: '#666',
                    }}
                  >
                    {processDetails.description}
                  </p>
                  <p
                    style={{
                      margin: '0 0 4px 0',
                      fontSize: '12px',
                      lineHeight: 1.5,
                      color: '#666',
                    }}
                  >
                    Source code:
                  </p>
                  {processDetails.githubUrl && (
                    <a
                      href={processDetails.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '12px',
                        color: '#1976d2',
                        textDecoration: 'none',
                        wordBreak: 'break-all',
                      }}
                    >
                      {processDetails.githubUrl}
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {selectedVersion && loadingDetails && (
          <div className="loading-message">
            <p>Loading process details...</p>
          </div>
        )}

        {selectedVersion && processDetails && processDetails.inputs && (
          <div className="st-card process-inputs-card">
            <h3 style={{ textTransform: 'none' }}>
              {selectedProcessName}:{selectedVersion} inputs
            </h3>
            {Object.entries(processDetails.inputs).map(([inputKey, input]) => (
              <div key={inputKey} className="form-group">
                <label
                  htmlFor={inputKey}
                  className="form-label"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {input.name}
                  {!input?.optional ? (
                    <span style={{ color: 'red', marginLeft: '-4px' }}>*</span>
                  ) : (
                    ''
                  )}
                  {input.description && (
                    <Tooltip title={input.description}>
                      <InfoIcon
                        sx={{
                          fontSize: '1rem',
                          color: '#999',
                          cursor: 'pointer',
                        }}
                      />
                    </Tooltip>
                  )}
                </label>
                {input.type?.toLowerCase() === 'boolean' ? (
                  <Box>
                    <Switch
                      checked={Boolean(formInputs[inputKey])}
                      onChange={(e) => {
                        setFormInputs((prev) => ({
                          ...prev,
                          [inputKey]: e.target.checked ? true : false,
                        }));
                        // Clear error for this field when user toggles
                        if (validationErrors[inputKey]) {
                          setValidationErrors((prev) => {
                            const updated = { ...prev };
                            delete updated[inputKey];
                            return updated;
                          });
                        }
                      }}
                    />
                    {validationErrors[inputKey] && (
                      <p
                        style={{
                          margin: '4px 0 0 0',
                          fontSize: '11px',
                          color: '#ef5350',
                        }}
                      >
                        {validationErrors[inputKey]}
                      </p>
                    )}
                  </Box>
                ) : (
                  <TextField
                    id={inputKey}
                    type="text"
                    placeholder={input.placeholder}
                    size="small"
                    defaultValue={input.default ?? null}
                    value={formInputs[inputKey]}
                    onChange={(e) => {
                      setFormInputs((prev) => ({
                        ...prev,
                        [inputKey]: e.target.value,
                      }));
                      if (validationErrors[inputKey]) {
                        setValidationErrors((prev) => {
                          const updated = { ...prev };
                          delete updated[inputKey];
                          return updated;
                        });
                      }
                    }}
                    error={!!validationErrors[inputKey]}
                    helperText={validationErrors[inputKey]}
                    sx={{ width: '100%' }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="form-actions">
          <div className="form-actions-left">
            <button className="st-button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Job'}
            </button>
            <button
              className="st-button secondary"
              onClick={() => {
                setFormInputs({});
                setSelectedVersion('');
                setSelectedProcessName('');
                setProcessDetails(null);
                setJobTag('');
                setSelectedQueue('');
                setValidationErrors({});
              }}
              disabled={submitting}
            >
              Clear
            </button>
          </div>

          <div className="form-actions-right">
            {/* <button
              disabled={true}
              className="st-button secondary"
              onClick={() => {}}
            >
              Copy Jupyter Notebook Code
            </button> */}
            <button
              className="st-button secondary"
              onClick={() => {
                if (app) {
                  app.commands.execute('jobs_view:open');
                }
              }}
            >
              View Jobs
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
