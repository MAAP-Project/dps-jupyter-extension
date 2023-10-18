import { JupyterFrontEnd, JupyterFrontEndPlugin, ILayoutRestorer } from '@jupyterlab/application'
import { ICommandPalette, MainAreaWidget, WidgetTracker } from '@jupyterlab/apputils'
import { EXTENSION_ID, EXTENSION_NAME, JUPYTER_EXT, OPEN_COMMAND } from './constants'
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
      OPEN_COMMAND,
    ].forEach(command => {
      jobsMenu.addItem({ command });
    });
    mainMenu.addMenu(jobsMenu)
  }
};

/**
 * Initialization data for the react-widget extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: EXTENSION_ID,
  autoStart: true,
  optional: [ILauncher, ICommandPalette, IStateDB],
  // requires: [ICommandPalette, IStateDB],
  activate: (app: JupyterFrontEnd, launcher: ILauncher, palette: ICommandPalette, state: IStateDB) => {
    const { commands } = app;
    console.log("graceal1 in index.ts activate of dps jupyter extension");

    const command = OPEN_COMMAND;
    commands.addCommand(command, {
      caption: 'View and submit user jobs',
      label: EXTENSION_NAME,
      icon: (args) => (args['isPalette'] ? null : reactIcon),
      execute: () => {
        getUsernameToken(state, profileId, function (uname: string, ticket: string) {
          console.log("Got username: ", uname)
          const content = new ReactAppWidget(uname);
          const widget = new MainAreaWidget<ReactAppWidget>({ content });
          widget.title.label = EXTENSION_NAME;
          widget.title.icon = reactIcon;
          app.shell.add(widget, 'main');
        });

      },
    });

    palette.addItem({command: OPEN_COMMAND, category: 'MAAP Extensions'});

    if (launcher) {
      launcher.add({
        command,
        category: "MAAP Extensions"
      });
    }
  },
};

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
        // const content = new SubmitJobReactAppWidget("");
        // const widget = new MainAreaWidget<SubmitJobReactAppWidget>({ content });
        // widget.title.label = "Submit Job";
        // widget.title.icon = reactIcon;
        // app.shell.add(widget, 'main');
        getUsernameToken(state, profileId, function (uname: string, ticket: string) {
          console.log("Got username: ", uname)
          const content = new SubmitJobReactAppWidget("");
          const widget = new MainAreaWidget<SubmitJobReactAppWidget>({ content });
          widget.title.label = "Submit Job";
          widget.title.icon = reactIcon;
          app.shell.add(widget, 'main');
        }).catch((error) => console.log(error));
      },
    });

    if (launcher) {
      launcher.add({
        command,
        category: "MAAP Extensions"
      });
    }

    console.log('JupyterLab jobs-submit plugin is activated!');
  }
};

export default [extension, jobsMenuext, jobs_submit_plugin];
