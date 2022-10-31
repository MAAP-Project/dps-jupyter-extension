import { JupyterFrontEnd, JupyterFrontEndPlugin, ILayoutRestorer } from '@jupyterlab/application'
import { ICommandPalette, MainAreaWidget, WidgetTracker } from '@jupyterlab/apputils'
import { EXTENSION_ID, EXTENSION_NAME, OPEN_COMMAND } from './constants'
import { ReactAppWidget } from './classes/App'
import { reactIcon } from '@jupyterlab/ui-components';
import { ILauncher } from '@jupyterlab/launcher';


/**
 * The command IDs used by the react-widget plugin.
 */
namespace CommandIDs {
  export const create = 'create-react-widget';
}

/**
 * Initialization data for the react-widget extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: EXTENSION_ID,
  autoStart: true,
  optional: [ILauncher],
  activate: (app: JupyterFrontEnd, launcher: ILauncher, palette: ICommandPalette) => {
    const { commands } = app;

    const command = OPEN_COMMAND;
    commands.addCommand(command, {
      caption: 'View and submit user jobs',
      label: EXTENSION_NAME,
      icon: (args) => (args['isPalette'] ? null : reactIcon),
      execute: () => {
        const content = new ReactAppWidget();
        const widget = new MainAreaWidget<ReactAppWidget>({ content });
        widget.title.label = EXTENSION_NAME;
        widget.title.icon = reactIcon;
        app.shell.add(widget, 'main');
      },
    });

    if (launcher) {
      launcher.add({
        command,
      });
    }
  },
};

export default extension;
