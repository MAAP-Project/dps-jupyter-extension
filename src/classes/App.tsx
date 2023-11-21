import React from 'react'
import { ReactWidget } from '@jupyterlab/apputils'
import { Provider } from 'react-redux'
import { JobsApp } from '../components/JobsApp'
import { JUPYTER_EXT } from '../constants'
import store from '../redux/store'
import 'regenerator-runtime/runtime'
import { JobSubmissionForm } from '../components/JobSubmissionForm'
import { JupyterFrontEnd } from '@jupyterlab/application';

export class ViewJobsReactAppWidget extends ReactWidget {
  uname: string
  jupyterApp: JupyterFrontEnd
  constructor(uname: string, jupyterApp: JupyterFrontEnd) {
    super()
    this.addClass(JUPYTER_EXT.EXTENSION_CSS_CLASSNAME)
    console.log("graceal1 in the constructor of ViewJobsReactAppWidget with uname");
    console.log(uname);
    this.uname = uname
    this.jupyterApp = jupyterApp
  }

  render(): JSX.Element {
    console.log("graceal1 in render of ViewJobsReactAppWidget and about to render JobsApp with uname");
    console.log(this.uname);
    return (
      <Provider store={store}>
        <JobsApp uname={this.uname} jupyterApp={this.jupyterApp} />
      </Provider>
    )
  }
}

export class SubmitJobsReactAppWidget extends ReactWidget {
  data: any
  constructor(data: any) {
    super()
    this.addClass(JUPYTER_EXT.EXTENSION_CSS_CLASSNAME)
    this.data = data
  }

  render(): JSX.Element {
    return (
      <Provider store={store}>
        {/* <div>This is the jobs submission plugin</div> */}
        <JobSubmissionForm />
        {/* <Registering /> */}
      </Provider>
    )
  }
}
