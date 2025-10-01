import { JupyterFrontEnd, JupyterFrontEndPlugin, ILayoutRestorer } from '@jupyterlab/application'
import { ICommandPalette, MainAreaWidget, WidgetTracker } from '@jupyterlab/apputils'
import { JUPYTER_EXT } from './constants'
import { reactIcon } from '@jupyterlab/ui-components';
import { ILauncher } from '@jupyterlab/launcher';
import { IStateDB } from '@jupyterlab/statedb';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { Menu } from '@lumino/widgets';
import { submitJob } from './utils/api';

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

    commands.addCommand(JUPYTER_EXT.SUBMIT_JOBS_OPEN_COMMAND, {
      label: JUPYTER_EXT.SUBMIT_JOBS_NAME,
      execute: async () => {
        console.log("submit job plugin")
      }
    });

    palette.addItem({command: JUPYTER_EXT.SUBMIT_JOBS_OPEN_COMMAND, category: 'MAAP Plugins'});

    if (launcher) {
      launcher.add({
        command: JUPYTER_EXT.SUBMIT_JOBS_OPEN_COMMAND,
        category: "MAAP Plugins"
      });
    }
    console.log('JupyterLab MAAP Submit Jobs plugin is activated!');
  }
};

export default [jobs_submit_plugin];
