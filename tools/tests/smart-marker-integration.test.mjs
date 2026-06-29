import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../../static/smart-canvas.html', import.meta.url), 'utf8');
const js = readFileSync(new URL('../../static/js/smart-canvas.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../static/css/smart-canvas.css', import.meta.url), 'utf8');
const canvasI18n = readFileSync(new URL('../../static/js/i18n/canvas.js', import.meta.url), 'utf8');

const previewIndex = html.indexOf('data-image-edit-mode="preview"');
const markerIndex = html.indexOf('data-image-edit-mode="marker"');
const cropIndex = html.indexOf('data-image-edit-mode="crop"');
assert.ok(previewIndex >= 0, 'smart image editor should keep preview mode');
assert.ok(markerIndex > previewIndex, 'marker mode should be placed after preview');
assert.ok(cropIndex > markerIndex, 'marker mode should be placed before crop');
assert.match(html, /id="imageMarkerTools"/, 'smart image editor should expose marker tools');
assert.match(html, /id="imageMarkerPanel"/, 'smart image editor should expose marker panel');
assert.match(html, /id="imageMarkerLayer"/, 'smart image editor should overlay marker layer on the crop image');
assert.match(html, /id="markerResetBtn"[\s\S]*onclick="resetImageMarkers\(\)"/, 'smart marker reset button should clear all markers');
assert.doesNotMatch(html, /id="markerUndoBtn"/, 'smart marker toolbar should not expose the old undo button');
assert.match(html, /<label><span>API<\/span> <select id="markerProviderSelect"/, 'smart marker toolbar should match normal canvas API selector layout');
assert.match(html, /<label><span>模型<\/span> <select id="markerModelSelect"/, 'smart marker toolbar should match normal canvas model selector layout');
assert.match(html, /smart-canvas\.js\?v=\d+/, 'smart canvas script should use a bumped numeric cache version');
assert.match(html, /i18n\.js\?v=\d+/, 'smart canvas i18n loader should use a bumped numeric cache version');

assert.match(js, /imageEditMode = \['preview','marker','crop','outpaint','mask','brush','grid'\]/, 'smart image editor should accept marker mode');
assert.match(js, /function currentMarkerImage\(\)/, 'smart marker logic should target the current edited image');
assert.match(js, /IMAGE_MARKER_ICON_SVG[\s\S]*fill="#008AFF"/, 'smart marker pin should use the same blue icon as normal canvas');
assert.match(js, /function resetImageMarkers\(\)[\s\S]*image\.markers = \[\]/, 'smart marker reset should clear all markers on the current image');
assert.match(js, /fetch\('\/api\/image-marker\/identify'/, 'smart marker identify should use the existing marker API');
assert.match(js, /function smartPromptMarkerReferenceDirective\(/, 'smart prompt request should include marker reference directives');
assert.match(js, /prompt-inline-marker/, 'smart prompt input should support inline marker chips');
assert.match(js, /markerDirective/, 'smart prompt request should append marker directives to generated prompts');
const inputMentionTab = js.indexOf('data-mention-source="input"');
const markerMentionTab = js.indexOf('data-mention-source="marker"');
const assetMentionTab = js.indexOf('data-mention-source="asset"');
assert.ok(inputMentionTab >= 0, 'smart @ picker should keep input image tab');
assert.ok(markerMentionTab > inputMentionTab, 'smart @ picker marker tab should be between input and assets');
assert.ok(assetMentionTab > markerMentionTab, 'smart @ picker asset tab should come after marker tab');
assert.match(js, /<span>标记<\/span>/, 'smart @ picker marker tab should display Chinese label');
assert.match(js, /mention-marker-list[\s\S]*prompt-marker-pill[\s\S]*prompt-marker-name/, 'smart @ picker marker page should render capsule marker rows like normal canvas');

assert.match(css, /\.crop-canvas\.marker-mode \.image-marker-layer/, 'smart marker layer should receive pointer events in marker mode');
assert.match(css, /\.prompt-inline-marker/, 'smart prompt marker chips should be styled');
assert.match(css, /\.prompt-marker-pill/, 'smart marker mention menu should style marker token capsules');
assert.match(css, /\.image-marker-refresh-btn[\s\S]*width:26px/, 'smart marker reset and refresh buttons should use normal canvas compact icon button class');
assert.match(css, /\.image-marker-refresh-btn i,\.image-marker-refresh-btn svg[\s\S]*width:13px/, 'smart marker reset and refresh icons should be compact');
assert.match(css, /\.image-marker-panel\.active \{ display:grid; grid-template-columns:repeat\(7, minmax\(0, 1fr\)\)/, 'smart marker panel should use normal canvas compact marker grid');
assert.match(css, /\.image-marker-row \{ min-width:0; display:grid; grid-template-columns:22px 18px minmax\(0, 1fr\) 22px 22px/, 'smart marker rows should use normal canvas compact point layout');
assert.match(css, /\.image-marker-tools\.active \{ height:auto; min-height:34px; flex:0 0 auto;/, 'smart marker toolbar should expand instead of clipping marker panel');
assert.match(css, /\.image-marker-status \{ display:none !important;/, 'smart marker status text should not overlap compact marker rows');
assert.match(canvasI18n, /"canvas\.modeMarker"\s*:\s*\{\s*zh:\s*"标记"/, 'marker mode should have a Chinese i18n label');

console.log('smart marker integration tests passed');
