import React from 'react'
import { ReactWidget } from '@jupyterlab/apputils'
import { Provider } from 'react-redux'
import { JobsApp } from '../components/JobsApp'
import { JUPYTER_EXT } from '../constants'
import store from '../redux/store'
import 'regenerator-runtime/runtime'
import { JobSubmissionForm } from '../components/JobSubmissionForm'

export class ReactAppWidget extends ReactWidget {
  uname: string
  constructor(uname: string) {
    super()
    this.addClass(JUPYTER_EXT.EXTENSION_CSS_CLASSNAME)
    this.uname = uname
  }

  render(): JSX.Element {
    return (
      <Provider store={store}>
        <JobsApp uname={this.uname}/>
      </Provider>
    )
  }
}

export class SubmitJobReactAppWidget extends ReactWidget {
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
