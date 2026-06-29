import assert from 'node:assert/strict';
import fs from 'node:fs';

const canvasJs = fs.readFileSync('static/js/canvas.js', 'utf8');
const smartCanvasJs = fs.readFileSync('static/js/smart-canvas.js', 'utf8');

assert.doesNotMatch(canvasJs, /smart-canvas\.html\?id=\$\{encodeURIComponent\(id\)\}&v=\d+/, 'canvas should not navigate to smart canvas with a stale fixed cache version');
assert.match(canvasJs, /smart-canvas\.html\?id=\$\{encodeURIComponent\(id\)\}&v=\$\{Date\.now\(\)\}/, 'canvas should bust smart canvas navigation cache with Date.now()');
assert.doesNotMatch(smartCanvasJs, /canvas\.html\?v=\d+/, 'smart canvas should not return to canvas with a stale fixed cache version');
assert.match(smartCanvasJs, /canvas\.html\?v=\$\{Date\.now\(\)\}/, 'smart canvas should bust canvas navigation cache with Date.now()');

console.log('canvas cache busting tests passed');
