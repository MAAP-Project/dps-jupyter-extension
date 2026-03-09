import { Notification } from '@jupyterlab/apputils';
import { JUPYTER_EXT } from '../constants';

/**
 * Converts seconds to a human-readable string using this format:
 * HHh MMm SSs
 *
 * @param seconds - string
 */
export const secondsToReadableString = (seconds: string) => {
  const d = Number(seconds);
  if (isNaN(d)) {
    return '';
  }

  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor((d % 3600) % 60);
  const str = h + 'h ' + m + 'm ' + s + 's ';
  return str;
};

export const getProducts = (products: []) => {
  // if (products.length !> 0) {
  //     return ""
  // }

  const urls = new Set();
  // note that currently there should only be one element in products
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products.forEach((product: any) => {
    product['urls'].forEach((url) => {
      urls.add(url);
    });
  });

  const urls_str = Array.from(urls).join('\r\n');
  return urls_str;
};

/**
 * If there is more than one product folder path, print to console because that shouldn't be the case and we will need
 * to revisit if it is. Only take the first folder path if that is the case though.
 * @param products list of products - should only be be one because only one element in products_staged right now
 * @returns A single folder path
 */
export const getProductFolderPath = (products: []) => {
  const productFolderPaths = new Set();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products.forEach((product: any) => {
    productFolderPaths.add(product['product_folder_path']);
  });

  const productFolderPathsArr = Array.from(productFolderPaths);
  if (productFolderPathsArr.length > 1) {
    console.error(
      'Folder path length was ' +
        productFolderPathsArr.length +
        '. We are only looking at the first element.'
    );
  }

  return productFolderPathsArr.length ? productFolderPathsArr[0] : null;
};

// Copies jupyter notebook command or product folder path to user clipboard
export async function copyTextToClipboard(text: string, successMessage: string) {
  try {
    await navigator.clipboard.writeText(text).then(() => {
      Notification.success(successMessage, { autoClose: 3000 });
    });
  } catch (error) {
    console.warn('Copy failed', error);
  }
}

export const openSubmitJobs = (jupyterApp, data) => {
  if (jupyterApp.commands.hasCommand(JUPYTER_EXT.SUBMIT_JOBS_OPEN_COMMAND)) {
    if (data == null) {
      jupyterApp.commands.execute(JUPYTER_EXT.SUBMIT_JOBS_OPEN_COMMAND, null);
    } else {
      jupyterApp.commands.execute(JUPYTER_EXT.SUBMIT_JOBS_OPEN_COMMAND, data);
    }
  }
};

export const openViewJobs = (jupyterApp, data) => {
  if (jupyterApp.commands.hasCommand(JUPYTER_EXT.VIEW_JOBS_OPEN_COMMAND)) {
    if (data == null) {
      jupyterApp.commands.execute(JUPYTER_EXT.VIEW_JOBS_OPEN_COMMAND, null);
    } else {
      jupyterApp.commands.execute(JUPYTER_EXT.VIEW_JOBS_OPEN_COMMAND, data);
    }
  }
};

export const handleCopyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const calculateDuration = (
  started: string | undefined,
  finished: string | undefined
): string => {
  if (!started || !finished) return '-';
  const startDate = new Date(started);
  const finishDate = new Date(finished);
  const durationMs = finishDate.getTime() - startDate.getTime();

  if (durationMs < 0) return '-';

  const seconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};
