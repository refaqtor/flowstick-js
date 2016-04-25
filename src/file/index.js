/* @flow */
import { remote } from 'electron';

import Promise from 'bluebird';

export function escapeFilename(filename: string): string {
  return filename.replace(/\//g, '%2F');
}

export function getFilenameFromUserPrompt(): Promise<string> {
  return new Promise((resolve, reject) => {
    remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
      properties: ['openFile'],
      title: 'Open XPDL',
      filters: [
        { name: 'XPDLs', extensions: ['xpdl'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    }, filenames => {
      if (filenames && filenames.length) {
        resolve(filenames[0]);
      } else {
        reject(new Error('No filename was selected.'));
      }
    });
  });
}
