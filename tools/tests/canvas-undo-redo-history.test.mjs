import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const canvasJs = readFileSync('static/js/canvas.js', 'utf8');
const smartJs = readFileSync('static/js/smart-canvas.js', 'utf8');

for (const [name, js] of [['ordinary canvas', canvasJs], ['smart canvas', smartJs]]) {
  assert.match(js, /const\s+(?:CANVAS_)?UNDO_MAX\s*=\s*10|const\s+UNDO_LIMIT\s*=\s*10/, `${name} should limit undo history to 10 entries`);
  assert.match(js, /redoStack/, `${name} should keep a redo stack`);
  assert.match(js, /canvasId\s*:\s*(?:canvas\?\.id|canvasId)/, `${name} snapshots should carry the current canvas id`);
  assert.match(js, /state\.canvasId\s*!==\s*(?:canvas\?\.id|canvasId)|snap\.canvasId\s*!==\s*(?:canvas\?\.id|canvasId)/, `${name} restore should reject snapshots from another canvas`);
  assert.match(js, /function\s+resetCanvasHistory\(/, `${name} should reset undo and redo stacks when a canvas is opened or loaded`);
  assert.match(js, /function\s+performRedo\(/, `${name} should implement redo`);
  assert.match(js, /matchShortcutEvent\(e,\s*'undo'\)/, `${name} should route configured undo shortcut through the keydown handler`);
  assert.match(js, /matchShortcutEvent\(e,\s*'redo'\)/, `${name} should route configured redo shortcut through the keydown handler`);
  assert.match(js, /if\(e\.repeat\) return;/, `${name} should ignore repeated keydown events for undo or redo`);
}

assert.match(canvasJs, /pushUndo\(\)[\s\S]*redoStack\s*=\s*\[\]/, 'ordinary canvas should clear redo when a new undo snapshot is pushed');
assert.match(smartJs, /pushUndo\(\)[\s\S]*redoStack\.length\s*=\s*0/, 'smart canvas should clear redo when a new undo snapshot is pushed');

console.log('canvas undo/redo history tests passed');
