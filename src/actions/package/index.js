import { loadPackageXPDL } from '../../xpdl';
import type Promise from 'bluebird';

export const START_PACKAGE_LOAD = 'START_PACKAGE_LOAD';
export const FINISH_PACKAGE_LOAD_SUCCESS = 'FINISH_PACKAGE_LOAD_SUCCESS';
export const FINISH_PACKAGE_LOAD_FAILURE = 'FINISH_PACKAGE_LOAD_FAILURE';

export function loadPackage(filename: string): (f: Function) => Promise<void> {
  return dispatch => {
    dispatch({ type: START_PACKAGE_LOAD, filename });
    return loadPackageXPDL(filename)
      .then(data => {
        dispatch({ type: FINISH_PACKAGE_LOAD_SUCCESS, ...data });
      }, () => {
        dispatch({ type: FINISH_PACKAGE_LOAD_FAILURE });
      });
  };
}
