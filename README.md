# DPS Jupyter Extension

Frontend extension that allows users to interact with the Data Processing System (DPS) by viewing and submitting jobs.  

To activate the UI, navigate to `View -> Activate Command Palette -> View & Submit Jobs`.
&nbsp;
## Requirements

- JupyterLab >= 3.4
- [jupyter-server-extension](https://github.com/MAAP-Project/jupyter-server-extension)  
&nbsp;
## Install

To install the extension, execute:

```bash
pip install maap-dps-jupyter-extension
```  
&nbsp;
## Uninstall

To remove the extension, execute:

```bash
pip uninstall maap-dps-jupyter-extension
```  
&nbsp;
## Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the dps_jupyter_extension directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```  
&nbsp;
## Development uninstall

```bash
pip uninstall maap_dps_jupyter_extension
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `dps_jupyter_extension` within that folder.  
&nbsp;

## Contributing
Refer to the contributing guidelines [here](https://github.com/MAAP-Project/dps-jupyter-extension/blob/main/CONTRIBUTING.md).

## Questions?
Refer to the [Q&A discussion board](https://github.com/MAAP-Project/dps-jupyter-extension/discussions).
