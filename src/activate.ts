import { JupyterFrontEnd, ILayoutRestorer } from '@jupyterlab/application'
import { ICommandPalette, MainAreaWidget, WidgetTracker } from '@jupyterlab/apputils'
import { EXTENSION_ID, EXTENSION_NAME, OPEN_COMMAND } from './enums'
import { ReactAppWidget } from './classes/App'

// export var getUserInfo = function(callback) {
//   console.log("Window creds:")
//   console.log(window.parent);
//   // window.parent.loadUserInfo().success(function(profile) {
//   //   console.log(profile);
//   //   // key = profile['public_ssh_keys'];
//   //   callback(profile);

//   // }).error(function() {
//   //   console.log('Failed to load profile.');
//   //   return "error";
//   // });
// };

export const activate = (app: JupyterFrontEnd, palette: ICommandPalette, restorer: ILayoutRestorer): void => {
  console.log(`JupyterLab extension ${EXTENSION_ID} is activated!`)

  // Create a single widget
  let widget: MainAreaWidget<ReactAppWidget>

  // Add an application command
  const command = OPEN_COMMAND
  app.commands.addCommand(command, {
    label: EXTENSION_NAME,
    execute: () => {
      if (!widget || widget.isDisposed) {
        const content = new ReactAppWidget()
        widget = new MainAreaWidget({ content })
        widget.id = EXTENSION_ID
        widget.title.label = EXTENSION_NAME
        widget.title.closable = true
      }
      if (!tracker.has(widget)) {
        tracker.add(widget)
      }
      if (!widget.isAttached) {
        // Attach the widget to the main work area if it's not there
        app.shell.add(widget, 'main')
      }

      // getUserInfo(function (profile: any) {
      //   let uname, ticket = ""
      //   if (profile['cas:username'] === undefined) {
      //     console.log("Profile failed")
      //   } else {
      //     uname = profile['cas:username'];
      //     ticket = profile['proxyGrantingTicket'];
      //     console.log("Got profile: ")
      //     console.log(uname)
      //     // callback(uname, ticket);
      //   }
      // });

      // Activate the widget
      app.shell.activateById(widget.id)
    },
  })

  // Add the command to the palette.
  palette.addItem({ command, category: 'React Redux Extension' })

  const tracker = new WidgetTracker<MainAreaWidget<ReactAppWidget>>({
    namespace: EXTENSION_ID,
  })

  restorer.restore(tracker, {
    command: OPEN_COMMAND,
    name: () => EXTENSION_ID,
  })
}
