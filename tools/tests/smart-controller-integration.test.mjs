import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const js = readFileSync(new URL('../../static/js/smart-canvas.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../../static/smart-canvas.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../static/css/smart-canvas.css', import.meta.url), 'utf8');

assert.match(html, /id="controllerPanel"\s+class="controller-panel"/, 'smart canvas should include controller floating panel host');
assert.match(html, /data-create-type="controller"/, 'smart canvas create menu should include comprehensive controller');

assert.match(js, /const CONTROLLER_TABS = \['camera', 'angle', 'lighting', 'material'\]/, 'smart canvas should use ordinary canvas controller tabs');
assert.doesNotMatch(js, /const SMART_CONTROLLER_TABS/, 'smart canvas should not keep the simplified smart controller tab model');
assert.doesNotMatch(js, /SMART_CONTROLLER_CAMERA_BODIES|SMART_CONTROLLER_MATERIALS|smartControllerSelectHtml|smartControllerRangeHtml/, 'smart canvas should not use simplified smart controller presets or controls');

assert.match(js, /function defaultControllerState\(/, 'ordinary controller state model should be present');
assert.match(js, /function ensureControllerState\(/, 'ordinary controller state normalizer should be present');
assert.match(js, /function controllerPrompt\(/, 'ordinary controller prompt generator should be present');
assert.match(js, /function controllerPanelContent\(/, 'ordinary controller panel dispatcher should be present');
assert.match(js, /function cameraPanelHtml\(/, 'ordinary camera panel should be present');
assert.match(js, /function anglePanelHtml\(/, 'ordinary angle panel should be present');
assert.match(js, /function lightingPanelHtml\(/, 'ordinary lighting panel should be present');
assert.match(js, /function materialPanelHtml\(/, 'ordinary material panel should be present');
assert.match(js, /function materialDetailPanelHtml\(/, 'ordinary material detail panel should be present');
assert.match(js, /function bindControllerPanel\(/, 'ordinary controller panel binding should be present');

assert.match(js, /佳能 EOS R5/, 'ordinary camera body presets should be migrated');
assert.match(js, /ARRI大师级电影感/, 'ordinary camera vibe presets should be migrated');
assert.match(js, /建筑轴测/, 'ordinary angle presets should be migrated');
assert.match(js, /data-light-native="azimuth"/, 'ordinary lighting native azimuth control should be migrated');
assert.match(js, /data-light-type-select/, 'ordinary lighting type select should be migrated');
assert.match(js, /MATERIAL_CATEGORIES/, 'ordinary material categories should be migrated');
assert.match(js, /data-material-id/, 'ordinary material selection cards should be migrated');
assert.match(js, /data-material-config="normalStrength"/, 'ordinary material detail configuration should be migrated');
assert.match(js, /data-material-hsl="hue"/, 'ordinary material HSL control should be migrated');

assert.match(js, /type:'smart-controller'/, 'smart canvas should still create smart-controller nodes');
assert.match(js, /if\(node\?\.type === 'smart-controller'\) \{[\s\S]*explicitW[\s\S]*explicitW <= 320 \? 290 : explicitW/, 'legacy oversized smart controller nodes should render at the 290px panel width');
assert.match(js, /function createControllerNode\(x, y, options=\{\}\)[\s\S]*w:290,/, 'new smart controller nodes should default to 290px width');
assert.match(js, /if\(upstream\.type === 'smart-controller'\)/, 'smart canvas should collect upstream smart-controller nodes');
assert.match(js, /if\(node\.type === 'smart-controller'\) return smartControllerBodyHtml\(node\)/, 'smart controller nodes should render through the migrated controller body');
assert.match(js, /function updateSmartController\(node, mutator, opts=\{\}\)\{ return updateController\(node, mutator, opts\); \}/, 'smart controller update alias should delegate to ordinary updateController');
assert.match(js, /function refreshControllerDownstream\(\)/, 'smart canvas should provide a downstream refresh adapter for ordinary controller updates');
assert.match(js, /closest\?\.\('\.image-node, \.node'\)/, 'ordinary controller node sizing should adapt to smart canvas image-node shells');
assert.match(js, /querySelector\('\.controller-open-panel'\)/, 'smart controller floating panel button should bind to the ordinary canvas open button class');
assert.doesNotMatch(js, /创作控制器/, 'smart controller switch panel should not be renamed to creation controller');
assert.match(js, /querySelector\('\[data-camera-reset\]'\)\?\.addEventListener\('click'/, 'camera reset button should be bound');
assert.match(js, /querySelectorAll\('\[data-angle-reset\]'\)\.forEach\(btn => btn\.addEventListener\('click'/, 'angle reset buttons should be bound');
assert.match(js, /querySelector\('\[data-light-reset\]'\)\?\.addEventListener\('click'/, 'lighting reset button should be bound');
assert.match(js, /s\.lighting = \{\.\.\.defaults, temperature:defaults\.temperature, shadow:defaults\.shadow\}/, 'lighting reset should explicitly reset temperature and shadow');
assert.match(js, /querySelector\('\[data-material-config-reset\]'\)\?\.addEventListener\('click'/, 'material config reset button should be bound');
assert.match(js, /querySelector\('\[data-material-color-reset\]'\)\?\.addEventListener\('click'/, 'material HSL reset button should be bound');
assert.match(js, /let materialCardClickMemory = \{nodeId:'', materialId:'', time:0\};/, 'material card click memory should make double-click entry robust across hard refreshes');
assert.match(js, /isFastSecondClick[\s\S]*s\.material\.editing = id;/, 'material card fast second click should enter the material detail editor');
assert.match(js, /closest\('\.material-detail, \.material-detail-form'\)/, 'material detail panel wheel events should be routed to a scroll container');
assert.match(js, /function bindSmartControllerNodeControls\(el, node\)[\s\S]*updateController\(node, s => \{[\s\S]*s\.enabled\[tab\] = !s\.enabled\[tab\]/, 'smart canvas DOM-bound controller toggles should use ordinary updateController');
assert.doesNotMatch(js, /bindSmartControllerNodeControls[\s\S]*updateSmartController\(node, s => \{ s\.enabled\[tab\] = !s\.enabled\[tab\]/, 'smart canvas should not use the old smart-controller enable binding');
assert.match(js, /const isControllerPanelDragSurface = nodeForControls\?\.type === 'smart-controller'[\s\S]*e\.target\.closest\('\.controller-body'\)[\s\S]*!e\.target\.closest\('\.controller-tab, \[data-controller-enable\], \.controller-open-panel, select, input, textarea'\)/, 'smart controller panel areas outside the four tab cards should remain draggable');
assert.doesNotMatch(js, /querySelectorAll\('\.controller-body, \.controller-tab, \.controller-open-panel'\)\.forEach\(control => \{\s*control\.addEventListener\('mousedown', e => e\.stopPropagation\(\)\)/, 'smart controller panel body should not block node dragging');
assert.match(js, /if\(from\.type === 'smart-controller'\)/, 'smart controller should connect into smart canvas targets');
assert.match(js, /smartControllerDirectivesForNodeInput\(node, smartControllerGraph\(\)\)/, 'generation prompt should include upstream smart controller directives');
assert.match(js, /function controllerGraph\(\)\{ return \{nodes, connections:canvas\?\.connections \|\| \[\]\}; \}/, 'smart canvas should provide its own controller graph adapter');
assert.match(js, /function controllerMarkerRefsForNode\(node\)/, 'smart canvas should adapt smart-image marker refs for the material controller');
assert.match(js, /node\.type === 'smart-image'[\s\S]*smartRefWithMarkers/, 'smart image upload markers should be expanded into controller marker refs');

assert.match(css, /\.smart-controller-node/, 'smart controller node shell styles should exist');
assert.match(css, /\.controller-panel\.open/, 'controller panel open styles should exist');
assert.match(css, /\.camera-stage/, 'ordinary camera visual styles should be available');
assert.match(css, /\.light-control-grid-3d/, 'ordinary lighting panel styles should be available');
assert.match(css, /\.material-detail-form/, 'ordinary material detail styles should be available');
assert.match(css, /\.controller-enable-row\s*\{[^}]*display:none/, 'floating panel should keep ordinary hidden enable-row layout');
assert.match(css, /\.light-type-select option\s*\{[^}]*background:#18191f;[^}]*color:#fff;/, 'lighting type dropdown options should match the dark controller panel');
assert.match(css, /\.ctrl-slider\.temperature-slider \.ctrl-slider-fill\s*\{[^}]*linear-gradient\(90deg, #6fb6ff, #fff2c2, #ffb060\)/, 'temperature slider fill should use ordinary canvas warm-cool gradient');
assert.match(css, /\.image-node\.smart-controller-node\.controller-node\s*\{[^}]*width:300px;[^}]*max-width:300px;[^}]*min-width:250px;[^}]*min-height:220px;/, 'smart controller switch panel shell should match ordinary canvas dimensions');
assert.match(css, /\.image-node\.smart-controller-node\.controller-node \.controller-tab\s*\{[^}]*height:46px;[^}]*grid-template-columns:minmax\(0,1fr\) 36px;[^}]*padding:7px 7px;/, 'smart controller switch cards should match ordinary canvas dimensions');
assert.match(css, /\.image-node\.smart-controller-node\.controller-node \.controller-tab-switch\s*\{[^}]*width:34px;[^}]*height:20px;[^}]*flex:0 0 34px;/, 'smart controller toggle switch should match ordinary canvas dimensions');
assert.match(css, /\.image-node\.smart-controller-node\.controller-node \.controller-tab-switch::after\s*\{[^}]*left:2px;[^}]*top:2px;[^}]*width:16px;[^}]*height:16px;/, 'smart controller toggle thumb should match ordinary canvas dimensions');
assert.match(css, /\.image-node\.smart-controller-node\.controller-node \.controller-tabs > \.controller-tab\s*\{[^}]*grid-template-columns:minmax\(0, 1fr\) 42px !important;/, 'smart controller tab switch column should fit the 40px control rail');
assert.match(css, /\.image-node\.smart-controller-node\.controller-node \.controller-tabs > \.controller-tab > \.controller-tab-switch,[\s\S]*width:40px !important;[\s\S]*height:24px !important;[\s\S]*flex:0 0 40px !important;/, 'smart controller toggle switch rail should be 40px by 24px');
assert.match(css, /\.image-node\.smart-controller-node\.controller-node \.controller-tabs > \.controller-tab > \.controller-tab-switch::after,[\s\S]*width:18px !important;[\s\S]*height:18px !important;/, 'smart controller toggle thumb should fit the 24px rail height');
assert.match(css, /\.image-node\.smart-controller-node\.controller-node \.controller-tabs > \.controller-tab > \.controller-tab-switch::after,[\s\S]*top:50% !important;[\s\S]*transform:translateY\(-50%\) !important;/, 'smart controller toggle thumb should stay vertically centered in the rail');
assert.match(css, /\.image-node\.smart-controller-node\.controller-node \.controller-tabs > \.controller-tab > \.controller-tab-switch\.active::after,[\s\S]*transform:translate\(16px, -50%\) !important;/, 'smart controller active toggle thumb should move horizontally while staying vertically centered');
assert.match(css, /\.controller-panel\.controller-tab-material\.open \.controller-panel-content\s*\{[^}]*max-height:calc\(100vh - 206px\) !important;[^}]*display:block !important;/, 'smart material controller panel should scroll inside the floating panel instead of overflowing');
assert.match(css, /\.controller-panel\.controller-tab-material\.open \.material-detail\s*\{[^}]*max-height:none !important;[^}]*overflow:visible !important;/, 'smart material detail editor should avoid nested scrollbars and use the panel content scroller');
assert.match(css, /\.image-node\.smart-controller-node\.controller-node\s*\{[^}]*width:290px !important;[^}]*max-width:290px !important;[^}]*min-width:290px !important;/, 'smart controller switch panel should use the requested 290px layout width');
assert.match(css, /\.image-node\.smart-controller-node\.controller-node \.controller-tabs\s*\{[^}]*grid-template-columns:repeat\(2, minmax\(0, 1fr\)\) !important;[^}]*column-gap:6px !important;[^}]*row-gap:6px !important;/, 'smart controller tabs should be equal-width two-column cards within 290px');
assert.match(css, /\.image-node\.smart-controller-node\.controller-node \.controller-node-preview\s*\{[^}]*align-self:stretch !important;[^}]*margin:0 !important;/, 'smart controller preview summary should align with the tab grid width');

const logicStart = js.indexOf("const CONTROLLER_TABS = ['camera', 'angle', 'lighting', 'material'];");
const logicEnd = js.indexOf('function createNode(x, y, images=[], options={})');
assert.ok(logicStart >= 0 && logicEnd > logicStart, 'smart controller logic block should be extractable');
const sandbox = {
    nodes: [],
    canvas: {connections: []},
    imageForDisplay: img => img,
    smartRefWithMarkers(ref, extra={}){ return {...ref, ...extra, markers:ref.markers || extra.markers || []}; },
    console,
};
vm.createContext(sandbox);
vm.runInContext(`${js.slice(logicStart, logicEnd)}\nthis.__exports = { defaultControllerState, materialMarkerTargetsForControllerGraph, generationPromptWithControllerDirectivesCompat, controllerSourceFromNode };`, sandbox);

const controller = {id:'ctrl-smart', type:'smart-controller', controller:sandbox.__exports.defaultControllerState()};
controller.controller.enabled.material = true;
controller.controller.material.selected = ['walnut'];
controller.controller.material.markerTarget = '图1标记2';
const upload = {
    id:'upload-smart',
    type:'smart-image',
    images:[{url:'/uploads/chair.png', name:'chair.png', markers:[
        {number:1, x:0.2, y:0.3, objectName:'沙发', status:'done'},
        {number:2, x:0.6, y:0.4, objectName:'桌面', status:'done'},
    ]}],
};
const gen = {id:'gen-smart', type:'generator'};
const graph = {
    nodes:[controller, upload, gen],
    connections:[{from:'ctrl-smart', to:'gen-smart'}, {from:'upload-smart', to:'gen-smart'}],
    generatorTypes:['generator'],
};
const markerTargets = sandbox.__exports.materialMarkerTargetsForControllerGraph(graph, controller);
assert.equal(JSON.stringify(markerTargets.map(item => item.value)), JSON.stringify(['图1标记1', '图1标记2']), 'smart upload node markers should populate material target options');
assert.ok(markerTargets.some(item => item.label.includes('桌面')), 'material target option should include smart upload marker object name');
const finalPrompt = sandbox.__exports.generationPromptWithControllerDirectivesCompat([
    {id:'upload-smart', type:'image', prompt:'', refs:[{url:'/uploads/chair.png', name:'chair.png', markers:upload.images[0].markers}]},
    sandbox.__exports.controllerSourceFromNode(controller, graph),
], graph, gen);
assert.match(finalPrompt, /图1标记2=桌面/, 'final prompt should include smart upload marker mapping');
assert.match(finalPrompt, /当前材质目标锁定：图1标记2/, 'final prompt should carry the material marker target lock');
assert.match(finalPrompt, /Material Controller/, 'material-only smart controller should emit material directives');
assert.match(finalPrompt, /only the enabled material controller settings/, 'material-only smart constraints should name only material');
assert.doesNotMatch(finalPrompt, /Camera Controller|Angle Controller|Lighting Controller/, 'material-only smart controller should not emit disabled controller sections');
assert.doesNotMatch(finalPrompt, /camera, angle, lighting, and material/, 'smart material-only constraints should not reuse all-controller text');
assert.doesNotMatch(finalPrompt, /coherent lighting|coherent perspective/, 'smart material-only constraints should not introduce lighting or perspective requirements');
assert.doesNotMatch(finalPrompt, /Do not introduce requirements from disabled controllers\./, 'removed disabled-controller sentence should not be emitted');

const apiStart = js.indexOf('async function runApiGeneration(prompt, refs, runSettings=settings)');
const apiEnd = js.indexOf('async function runRunningHubGeneration', apiStart);
assert.ok(apiStart >= 0 && apiEnd > apiStart, 'smart canvas API generation block should be extractable');
const apiPayloads = [];
const apiSandbox = {
    settings:{provider_id:'linapi', model:'gpt-image-2', count:1, quality:'auto'},
    tr:key => key,
    normalizedImageQuality:value => ['low','medium','high'].includes(String(value || 'auto').trim().toLowerCase()) ? String(value || '').trim().toLowerCase() : '',
    sizeForRun:() => '4096x4096',
    imageRefsOnly:refs => (refs || []).filter(ref => (ref.kind || 'image') === 'image'),
    fetch:async (url, options) => {
        apiPayloads.push({url, body:JSON.parse(options.body)});
        return {ok:true, json:async () => ({task_id:'smart-task-1'})};
    },
};
vm.createContext(apiSandbox);
vm.runInContext(`${js.slice(apiStart, apiEnd)}\nthis.__exports = { runApiGeneration };`, apiSandbox);
const smartRefs = [
    {url:'/uploads/source.png', name:'source.png', kind:'image', markers:[{number:1, objectName:'chair'}]},
    {url:'/uploads/source.mp4', name:'source.mp4', kind:'video'},
];
const smartResult = await apiSandbox.__exports.runApiGeneration('prompt with controller directives', smartRefs, apiSandbox.settings);
assert.equal(JSON.stringify(smartResult), JSON.stringify({taskIds:['smart-task-1'], count:1}), 'smart canvas should return submitted canvas image task ids');
assert.equal(apiPayloads.length, 1, 'smart canvas should submit one canvas image task payload');
assert.equal(apiPayloads[0].url, '/api/canvas-image-tasks', 'smart canvas should use the shared canvas image task endpoint');
assert.equal(apiPayloads[0].body.prompt, 'prompt with controller directives', 'smart canvas prompt/controller text should reach the API payload');
assert.equal(apiPayloads[0].body.provider_id, 'linapi', 'smart canvas provider should reach the API payload');
assert.equal(apiPayloads[0].body.model, 'gpt-image-2', 'smart canvas model should reach the API payload');
assert.deepEqual(apiPayloads[0].body.reference_images.map(ref => ref.url), ['/uploads/source.png'], 'smart canvas should send only image refs to image generation payload');

console.log('smart controller integration tests passed');
