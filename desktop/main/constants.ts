import path from 'path';
import { app } from 'electron';

export const MINUTE = 60 * 1000;

// Linux: ~/.config/<App Name>
// Mac OS: ~/Library/Application Support/<App Name>
// Windows: C:\Users\<user>\AppData\Local\<App Name>
export const USERDATA_DIR = app.getPath('userData');

export const DOCUMENTS_DIR = app.getPath('documents');

export const NODE_CONFIG_FILE = path.resolve(USERDATA_DIR, 'node-config.json');
