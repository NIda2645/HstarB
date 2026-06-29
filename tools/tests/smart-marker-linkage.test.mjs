import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../../static/js/smart-canvas.js', import.meta.url), 'utf8');

const names = [
  'cloneSmartMarkers',
  'smartRefWithMarkers',
  'compactSmartRef',
  'uniqueReferenceImages',
  'smartPromptMarkerReferenceDirective',
  'snapshotRunMeta',
  'attachRunMeta',
];

let bundle = '';
for (const name of names) {
  const re = new RegExp(`function ${name}\\([^]*?\\n\\}`, 'm');
  const match = source.match(re);
  assert.ok(match, `${name} should exist`);
  bundle += `${match[0]}\n`;
}

const sandbox = {
  normalizeMarkerObjectName(value){ return Array.from(String(value || '').trim()).slice(0, 18).join(''); },
  cleanDataImageUrl(value){ return String(value || '').trim(); },
  mediaKindForItem(){ return 'image'; },
  promptPlainText(){ return 'use marker'; },
  promptHtmlWithMentionTokens(){ return ''; },
  stripImageGenerationMeta(img){ return img; },
  promptInput:{innerHTML:'use marker'},
  settings:{engine:'api'},
  JSON,
  Date,
};
vm.createContext(sandbox);
vm.runInContext(`${bundle}\nthis.__exports = { cloneSmartMarkers, smartRefWithMarkers, compactSmartRef, uniqueReferenceImages, smartPromptMarkerReferenceDirective, snapshotRunMeta, attachRunMeta };`, sandbox);

const marker = {id:'m1', number:1, x:0.25, y:0.5, objectName:'红色按钮', status:'done', thumbnail:'data:image/jpeg;base64,abc'};
const ref = sandbox.__exports.smartRefWithMarkers({url:'/uploads/source.png', name:'source.png', nodeId:'n1', imageIndex:0, markers:[marker]});
assert.equal(ref.markers[0].objectName, '红色按钮');
assert.equal(ref.markers[0].x, 0.25);

const directive = sandbox.__exports.smartPromptMarkerReferenceDirective([ref]);
assert.match(directive, /图1标记1=红色按钮/);
assert.match(directive, /位置25%,50%/);

const meta = sandbox.__exports.snapshotRunMeta('prompt', 'node-a', 'display', [ref]);
assert.equal(meta.promptRefs[0].markers[0].objectName, '红色按钮');
assert.equal(meta.inputRefs[0].markers[0].objectName, '红色按钮');

const target = {images:[]};
sandbox.__exports.attachRunMeta(target, meta);
assert.equal(target.runPromptRefs[0].markers[0].objectName, '红色按钮');
assert.equal(target.runInputRefs[0].markers[0].objectName, '红色按钮');

console.log('smart marker linkage tests passed');
