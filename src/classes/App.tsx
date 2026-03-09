import React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { ViewJobs } from '../components/ViewJobs/ViewJobs';
import { SubmitJobs } from '../components/SubmitJob/SubmitJob';
import { MaapProvider } from '../MaapContext';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { InitialJobData } from '../types/types';

export class ViewJobsReactAppWidget extends ReactWidget {
  settings: ISettingRegistry.ISettings | null;
  app: JupyterFrontEnd;

  constructor(settings: ISettingRegistry.ISettings | null, app: JupyterFrontEnd) {
    super();
    this.settings = settings;
    this.app = app;
  }

  render(): JSX.Element {
    if (!this.settings) {
      return <div>Settings not available</div>;
    }
    return (
      <MaapProvider settings={this.settings}>
        <ViewJobs app={this.app} />
      </MaapProvider>
    );
  }
}

export class SubmitJobsReactAppWidget extends ReactWidget {
  settings: ISettingRegistry.ISettings | null;
  app: JupyterFrontEnd;
  initialData?: InitialJobData;

  constructor(
    settings: ISettingRegistry.ISettings | null,
    app: JupyterFrontEnd,
    initialData?: InitialJobData
  ) {
    super();
    this.settings = settings;
    this.app = app;
    this.initialData = initialData;
  }

  render(): JSX.Element {
    if (!this.settings) {
      return <div>Settings not available</div>;
    }
    return (
      <MaapProvider settings={this.settings}>
        <SubmitJobs app={this.app} initialData={this.initialData} />
      </MaapProvider>
    );
  }
}
