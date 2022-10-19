import { JupyterFrontEnd, JupyterFrontEndPlugin, ILayoutRestorer } from '@jupyterlab/application'
import { ICommandPalette, MainAreaWidget, WidgetTracker } from '@jupyterlab/apputils'
import { EXTENSION_ID, EXTENSION_NAME, OPEN_COMMAND } from './enums'
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

// export const activate = (app: JupyterFrontEnd, palette: ICommandPalette, restorer: ILayoutRestorer, launcher: ILauncher): void => {
//   console.log(`JupyterLab extension ${EXTENSION_ID} is activated!`)

//   // Create a single widget
//   let widget: MainAreaWidget<ReactAppWidget>

//   // Add an application command
//   const command = OPEN_COMMAND
//   app.commands.addCommand(command, {
//     label: EXTENSION_NAME,
//     execute: () => {
//       if (!widget || widget.isDisposed) {
//         const content = new ReactAppWidget()
//         widget = new MainAreaWidget({ content })
//         widget.id = EXTENSION_ID
//         widget.title.label = EXTENSION_NAME
//         widget.title.closable = true
//         widget.title.icon = reactIcon
//         app.shell.add(widget, 'main')
//       }
//       if (!tracker.has(widget)) {
//         tracker.add(widget)
//       }

//       // Activate the widget
//       app.shell.activateById(widget.id)
//     },
//   })

//   if (launcher) {
//     launcher.add({
//       command,
//     });
//   }

//   // Add the command to the palette.
//   palette.addItem({ command, category: 'React Redux Extension' })

//   const tracker = new WidgetTracker<MainAreaWidget<ReactAppWidget>>({
//     namespace: EXTENSION_ID,
//   })

//   restorer.restore(tracker, {
//     command: OPEN_COMMAND,
//     name: () => EXTENSION_ID,
//   })
// }
