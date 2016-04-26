export const OPEN_FILE_DIALOG = 'fd_OPEN_FILE_DIALOG';
export const CLOSE_FILE_DIALOG = 'fd_CLOSE_FILE_DIALOG';

export function openFileDialog() {
  return { type: OPEN_FILE_DIALOG };
}

export function closeFileDialog() {
  return { type: CLOSE_FILE_DIALOG };
}
