import { JupyterFrontEnd, JupyterFrontEndPlugin, ILayoutRestorer } from '@jupyterlab/application'
import { ICommandPalette, MainAreaWidget, WidgetTracker } from '@jupyterlab/apputils'
import { JUPYTER_EXT } from './constants'
import { maapIcon } from './icons/icons';
import { ILauncher } from '@jupyterlab/launcher';
import { IStateDB } from '@jupyterlab/statedb';
import { SubmitJobsReactAppWidget, ViewJobsReactAppWidget } from './classes/App';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

const sharedSettingsPluginId = 'maap-jupyter-server-extension:plugin';
const jobsSettingsPluginId = 'maap-dps-jupyter-extension:plugin';

/**
 * Load settings from the shared settings plugin, falling back to the jobs plugin settings.
 * The MAAP Jupyter shared settings will be attempted first. If these settings do not exist,
 * the settings for this collection of algorithm plugins will be loaded instead.
 * Returns null if neither settings can be loaded.
 */
async function loadSettings(registry: ISettingRegistry): Promise<ISettingRegistry.ISettings | null> {
  let loadedId = sharedSettingsPluginId;
  let settings: ISettingRegistry.ISettings | null = null;

  try {
    settings = await registry.load(loadedId);
    console.log(`Settings loaded from: ${loadedId}`);
    return settings;
  } catch (err) {
    console.warn(`Did not load settings for "${loadedId}": ${err}`);
  }

  loadedId = jobsSettingsPluginId;
  try {
    settings = await registry.load(loadedId);
    console.log(`Settings loaded from: ${loadedId}`);
    return settings;
  } catch (err2) {
    console.warn(`Failed to load fallback settings "${loadedId}": ${err2}`);
    console.warn('Plugins will work without settings');
    return null;
  }
}

// Submit Jobs plugin
const jobs_submit_plugin: JupyterFrontEndPlugin<void> = {
  id: JUPYTER_EXT.SUBMIT_JOBS_PLUGIN_ID,
  autoStart: true,
  requires: [ILauncher, ICommandPalette, IStateDB, ILayoutRestorer, ISettingRegistry],
  activate: async (app: JupyterFrontEnd,
             launcher: ILauncher,
             palette: ICommandPalette,
             state: IStateDB,
             restorer: ILayoutRestorer,
             settingRegistry: ISettingRegistry) => {

    const { commands } = app;

    // Load settings on startup
    const settings = await loadSettings(settingRegistry);

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
      icon: (args) => (args['isPalette'] ? null : maapIcon),
      execute: async (args) => {
        const initialData = args && typeof args === 'object' ? args : undefined;
        const content = new SubmitJobsReactAppWidget(settings, app, initialData);
        let submitJobsWidget = new MainAreaWidget<SubmitJobsReactAppWidget>({ content });
        submitJobsWidget.title.label = JUPYTER_EXT.SUBMIT_JOBS_NAME;
        submitJobsWidget.title.icon = maapIcon;
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
        category: "MAAP Plugins",
        rank: 0
      });
    }
    console.log('JupyterLab MAAP submit-jobs is activated!');
  }
};

// View Jobs plugin
const jobs_view_plugin: JupyterFrontEndPlugin<void> = {
  id: JUPYTER_EXT.VIEW_JOBS_PLUGIN_ID,
  autoStart: true,
  requires: [ILauncher, ICommandPalette, IStateDB, ILayoutRestorer, ISettingRegistry],
  activate: async (app: JupyterFrontEnd,
             launcher: ILauncher,
             palette: ICommandPalette,
             state: IStateDB,
             restorer: ILayoutRestorer,
             settingRegistry: ISettingRegistry) => {

    const { commands } = app;

    // Load settings on startup
    const settings = await loadSettings(settingRegistry);

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
      icon: (args) => (args['isPalette'] ? null : maapIcon),
      execute: async () => {
        const content = new ViewJobsReactAppWidget(settings, app);
        let viewJobsWidget = new MainAreaWidget<ViewJobsReactAppWidget>({ content });
        viewJobsWidget.title.label = JUPYTER_EXT.VIEW_JOBS_NAME;
        viewJobsWidget.title.icon = maapIcon;
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
        category: "MAAP Plugins",
      });
    }
    console.log('JupyterLab MAAP plugin view-jobs is activated!');
  }
};

export default [jobs_submit_plugin, jobs_view_plugin];
