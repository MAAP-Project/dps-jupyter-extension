import { JupyterFrontEnd, JupyterFrontEndPlugin, ILayoutRestorer } from '@jupyterlab/application'
import { ICommandPalette, MainAreaWidget, ReactWidget, WidgetTracker } from '@jupyterlab/apputils'
import { JUPYTER_EXT } from './constants'
import { reactIcon } from '@jupyterlab/ui-components';
import { ILauncher } from '@jupyterlab/launcher';
import { IStateDB } from '@jupyterlab/statedb';
import { SubmitJobsReactAppWidget, ViewJobsReactAppWidget } from './classes/App';

// Submit Jobs plugin
const jobs_submit_plugin: JupyterFrontEndPlugin<void> = {
  id: JUPYTER_EXT.SUBMIT_JOBS_PLUGIN_ID,
  autoStart: true,
  optional: [ILauncher, ICommandPalette, IStateDB, ILayoutRestorer],
  activate: (app: JupyterFrontEnd, 
             launcher: ILauncher, 
             palette: ICommandPalette, 
             state: IStateDB, 
             restorer: ILayoutRestorer) => {

    const { commands } = app;

    // Make sure plugin persists browser refresh
    const submitJobsTracker = new WidgetTracker<MainAreaWidget<SubmitJobsReactAppWidget>>({
      namespace: 'submit-jobs-tracker'
    });

    if (restorer) {
      restorer.restore(submitJobsTracker, {
        command: JUPYTER_EXT.SUBMIT_JOBS_OPEN_COMMAND,
        name: () => 'submit-jobs-tracker'
      });
    }

    commands.addCommand(JUPYTER_EXT.SUBMIT_JOBS_OPEN_COMMAND, {
      label: JUPYTER_EXT.SUBMIT_JOBS_NAME,
      icon: (args) => (args['isPalette'] ? null : reactIcon),
      execute: async () => {
        const content = new SubmitJobsReactAppWidget();
        let submitJobsWidget = new MainAreaWidget<SubmitJobsReactAppWidget>({ content });
        submitJobsWidget.title.label = JUPYTER_EXT.SUBMIT_JOBS_NAME;
        submitJobsWidget.title.icon = reactIcon;
        app.shell.add(submitJobsWidget, 'main');

        // Add widget to the tracker so it will persist on browser refresh
        submitJobsTracker.save(submitJobsWidget)
        submitJobsTracker.add(submitJobsWidget)
      }
    });

    // Add plugin to the dropdown in the main ribbon
    palette.addItem({command: JUPYTER_EXT.SUBMIT_JOBS_OPEN_COMMAND, category: 'MAAP Plugins'});

    // Add plugin to the launcher panel
    if (launcher) {
      launcher.add({
        command: JUPYTER_EXT.SUBMIT_JOBS_OPEN_COMMAND,
        category: "MAAP Plugins"
      });
    }
    console.log('JupyterLab MAAP submit-jobs is activated!');
  }
};

// View Jobs plugin
const jobs_view_plugin: JupyterFrontEndPlugin<void> = {
  id: JUPYTER_EXT.VIEW_JOBS_PLUGIN_ID,
  autoStart: true,
  optional: [ILauncher, ICommandPalette, IStateDB, ILayoutRestorer],
  activate: (app: JupyterFrontEnd, 
             launcher: ILauncher, 
             palette: ICommandPalette, 
             state: IStateDB, 
             restorer: ILayoutRestorer) => {

    const { commands } = app;

    const viewJobsTracker = new WidgetTracker<MainAreaWidget<ViewJobsReactAppWidget>>({
      namespace: 'view-jobs-tracker'
    });

    if (restorer) {
      restorer.restore(viewJobsTracker, {
        command: JUPYTER_EXT.VIEW_JOBS_OPEN_COMMAND,
        name: () => 'view-jobs-tracker'
      });
    }

    commands.addCommand(JUPYTER_EXT.VIEW_JOBS_OPEN_COMMAND, {
      label: JUPYTER_EXT.VIEW_JOBS_NAME,
      icon: (args) => (args['isPalette'] ? null : reactIcon),
      execute: async () => {
        const content = new ViewJobsReactAppWidget();
        let viewJobsWidget = new MainAreaWidget<ViewJobsReactAppWidget>({ content });
        viewJobsWidget.title.label = JUPYTER_EXT.VIEW_JOBS_NAME;
        viewJobsWidget.title.icon = reactIcon;
        app.shell.add(viewJobsWidget, 'main');

        // Add widget to the tracker so it will persist on browser refresh
        viewJobsTracker.save(viewJobsWidget)
        viewJobsTracker.add(viewJobsWidget)
      }
    });

    // Add plugin to the dropdown in the main ribbon
    palette.addItem({command: JUPYTER_EXT.VIEW_JOBS_OPEN_COMMAND, category: 'MAAP Plugins'});

    // Add plugin to the launcher panel
    if (launcher) {
      launcher.add({
        command: JUPYTER_EXT.VIEW_JOBS_OPEN_COMMAND,
        category: "MAAP Plugins"
      });
    }
    console.log('JupyterLab MAAP plugin view-jobs is activated!');
  }
};

export default [jobs_submit_plugin, jobs_view_plugin];
