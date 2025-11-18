import React from 'react'
import { ReactWidget } from '@jupyterlab/apputils'
import { JupyterFrontEnd } from '@jupyterlab/application';
import { ViewJobs } from '../components/ViewJobs';
import { SubmitJobs } from '../components/SubmitJobs';


export class ViewJobsReactAppWidget extends ReactWidget {
  constructor() {
    super()
  }

  render(): JSX.Element {
    return (
        <ViewJobs />
    )
  }
}

export class SubmitJobsReactAppWidget extends ReactWidget {
  constructor() {
    super()
  }

  render(): JSX.Element {
    return (
        <SubmitJobs />
    )
  }
}
