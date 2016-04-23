/* @flow */
import { readFile as fsReadFile } from 'fs';
import { promisify } from 'bluebird';
import type Promise from 'bluebird';

export function escapeFilename(filename: string): string {
  return filename.replace(/\//g, '%2F');
}

export const readFile: (fn: string) => Promise<Buffer> = promisify(fsReadFile);
