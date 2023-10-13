import { JupyterFrontEnd, JupyterFrontEndPlugin, ILayoutRestorer } from '@jupyterlab/application'
import { ICommandPalette, MainAreaWidget, WidgetTracker } from '@jupyterlab/apputils'
import { JUPYTER_EXT } from './constants'
import { ReactAppWidget, SubmitJobReactAppWidget } from './classes/App'
import { reactIcon } from '@jupyterlab/ui-components';
import { ILauncher } from '@jupyterlab/launcher';
import { getUsernameToken } from './utils/utils';
import { IStateDB } from '@jupyterlab/statedb';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { Menu } from '@lumino/widgets';


/**
 * The command IDs used by the react-widget plugin.
 */
namespace CommandIDs {
  export const create = 'create-react-widget';
}

const profileId = 'maapsec-extension:IMaapProfile';


// Add View Jobs and Submit Jobs plugins to the jupyter lab menu
const jobsMenuext: JupyterFrontEndPlugin<void> = {
  id: 'jobs-menu',
  autoStart: true,
  requires: [IMainMenu],
  activate: (app: JupyterFrontEnd, mainMenu: IMainMenu) => {
    const { commands } = app;
    let jobsMenu = new Menu({ commands });
    jobsMenu.id = 'jobs-menu';
    jobsMenu.title.label = 'Jobs';
    [
      JUPYTER_EXT.VIEW_JOBS_OPEN_COMMAND,
      JUPYTER_EXT.SUBMIT_JOBS_OPEN_COMMAND
    ].forEach(command => {
      jobsMenu.addItem({ command });
    });
    mainMenu.addMenu(jobsMenu)
  }
};


// View Jobs plugin
const jobs_view_plugin: JupyterFrontEndPlugin<void> = {
  id: JUPYTER_EXT.VIEW_JOBS_PLUGIN_ID,
  autoStart: true,
  optional: [ILauncher, ICommandPalette, IStateDB],
  // requires: [ICommandPalette, IStateDB],
  activate: (app: JupyterFrontEnd, launcher: ILauncher, palette: ICommandPalette, state: IStateDB) => {
    const { commands } = app;

    const command = JUPYTER_EXT.VIEW_JOBS_OPEN_COMMAND;
    commands.addCommand(command, {
      caption: JUPYTER_EXT.VIEW_JOBS_NAME,
      label: JUPYTER_EXT.VIEW_JOBS_NAME,
      icon: (args) => (args['isPalette'] ? null : reactIcon),
      execute: () => {
        getUsernameToken(state, profileId, function (uname: string, ticket: string) {
          console.log("Got username: ", uname)
          const content = new ReactAppWidget(uname);
          const widget = new MainAreaWidget<ReactAppWidget>({ content });
          widget.title.label = JUPYTER_EXT.VIEW_JOBS_NAME;
          widget.title.icon = reactIcon;
          app.shell.add(widget, 'main');
        });

      },
    });

    palette.addItem({command: JUPYTER_EXT.VIEW_JOBS_OPEN_COMMAND, category: 'MAAP Extensions'});

    if (launcher) {
      launcher.add({
        command,
        category: "MAAP Extensions"
      });
    }

    console.log('JupyterLab View Jobs plugin is activated!');
  },
};

// Submit Jobs plugin
const jobs_submit_plugin: JupyterFrontEndPlugin<void> = {
  id: JUPYTER_EXT.SUBMIT_JOBS_PLUGIN_ID,
  autoStart: true,
  optional: [ILauncher, ICommandPalette, IStateDB],
  activate: (app: JupyterFrontEnd, launcher: ILauncher, palette: ICommandPalette, state: IStateDB) => {
    const { commands } = app;
    const command = JUPYTER_EXT.SUBMIT_JOBS_OPEN_COMMAND;

    commands.addCommand(command, {
      caption: JUPYTER_EXT.SUBMIT_JOBS_NAME,
      label: JUPYTER_EXT.SUBMIT_JOBS_NAME,
      icon: (args) => (args['isPalette'] ? null : reactIcon),
      execute: () => {
        getUsernameToken(state, profileId, function (uname: string, ticket: string) {
          console.log("Got username: ", uname)
          const content = new SubmitJobReactAppWidget("");
          const widget = new MainAreaWidget<SubmitJobReactAppWidget>({ content });
          widget.title.label = JUPYTER_EXT.SUBMIT_JOBS_NAME;
          widget.title.icon = reactIcon;
          app.shell.add(widget, 'main');
        }).catch((error) => console.log(error));
      },
    });

    palette.addItem({command: JUPYTER_EXT.SUBMIT_JOBS_OPEN_COMMAND, category: 'MAAP Extensions'});

    if (launcher) {
      launcher.add({
        command,
        category: "MAAP Extensions"
      });
    }

    console.log('JupyterLab Submit Jobs plugin is activated!');
  }
};

export default [jobs_view_plugin, jobsMenuext, jobs_submit_plugin];
