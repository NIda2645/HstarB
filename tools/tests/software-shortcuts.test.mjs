import assert from 'node:assert/strict';
import fs from 'node:fs';

const settingsHtml = fs.readFileSync('static/software-settings.html', 'utf8');

assert.doesNotMatch(settingsHtml, /undo\s*:\s*\{\s*label\s*:\s*['"]撤销['"]/u, 'software settings should not expose an undo shortcut action');
assert.doesNotMatch(settingsHtml, /accelerator\s*:\s*['"]Ctrl\+Z['"]/u, 'software settings should not expose Ctrl+Z as a configurable shortcut');
assert.match(settingsHtml, /function sanitizeShortcuts\(shortcuts\)[\s\S]*delete next\.undo/u, 'software settings should filter stale locally saved undo shortcut data');
assert.match(settingsHtml, /api\.saveShortcuts\(sanitizeShortcuts\(shortcutState\)\)/u, 'software settings should not save stale undo shortcut data through the desktop API');

console.log('Software shortcut settings tests passed');
