import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {spawnSync} from 'node:child_process';

const reportDir = path.join(process.cwd(), 'tools', 'reports');
const reportPath = path.join(reportDir, `baofu-max-probe-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
const step = Number(process.env.BAOFU_PROBE_STEP || 150);
const maxSteps = Number(process.env.BAOFU_PROBE_MAX_STEPS || 12);
const retryFailures = Number(process.env.BAOFU_PROBE_RETRY_FAILURES || 1);

const defaults = {
  '1:1': '4096x4096',
  '2:3': '2720x4080',
  '3:2': '4080x2720',
  '3:4': '3072x4096',
  '4:3': '4032x3024',
  '9:16': '2304x4096',
  '16:9': '4096x2304',
  '21:9': '4095x1755',
  '9:21': '1755x4095',
};

function parseSize(value) {
  const match = String(value || '').match(/^(\d+)x(\d+)$/i);
  if (!match) throw new Error(`Invalid size: ${value}`);
  return {width: Number(match[1]), height: Number(match[2])};
}

function ratioParts(ratio) {
  const [a, b] = String(ratio).split(':').map(Number);
  if (!a || !b) throw new Error(`Invalid ratio: ${ratio}`);
  return {a, b};
}

function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

function sizeFromLongEdge(ratio, longEdge) {
  const {a, b} = ratioParts(ratio);
  let width;
  let height;
  if (a >= b) {
    width = longEdge;
    height = Math.round((longEdge * b) / a);
  } else {
    height = longEdge;
    width = Math.round((longEdge * a) / b);
  }
  const divisor = gcd(width, height);
  const reducedA = width / divisor;
  const reducedB = height / divisor;
  if (reducedA !== a || reducedB !== b) {
    if (a >= b) height = Math.round(width * b / a);
    else width = Math.round(height * a / b);
  }
  return `${width}x${height}`;
}

function longEdgeOf(size) {
  const {width, height} = parseSize(size);
  return Math.max(width, height);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const ratios = [];
  const starts = new Map();
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--ratios' && args[i + 1]) {
      ratios.push(...args[i + 1].split(',').map(item => item.trim()).filter(Boolean));
      i += 1;
    } else if (arg === '--start' && args[i + 1]) {
      const [ratio, size] = args[i + 1].split('=');
      if (ratio && size) starts.set(ratio.trim(), size.trim());
      i += 1;
    }
  }
  return {ratios: ratios.length ? ratios : Object.keys(defaults), starts};
}

function latestReportBefore(filesBefore) {
  const files = fs.readdirSync(reportDir)
    .filter(name => name.startsWith('baofu-4k-matrix-') && name.endsWith('.json'))
    .map(name => path.join(reportDir, name))
    .filter(file => !filesBefore.has(file))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return files[0] || '';
}

function runCandidate(ratio, size) {
  const before = new Set(fs.existsSync(reportDir)
    ? fs.readdirSync(reportDir).filter(name => name.startsWith('baofu-4k-matrix-')).map(name => path.join(reportDir, name))
    : []);
  const result = spawnSync(process.execPath, ['tools/test-baofu-4k-matrix.mjs', '--exact', '--only', ratio, '--size', `${ratio}=${size}`], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 40 * 60 * 1000,
  });
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  const report = latestReportBefore(before);
  let parsed = null;
  if (report) {
    parsed = JSON.parse(fs.readFileSync(report, 'utf8'));
  }
  const item = parsed?.results?.[0] || null;
  return {exitCode: result.status, report, item};
}

function save(report) {
  fs.mkdirSync(reportDir, {recursive: true});
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
}

async function main() {
  const {ratios, starts} = parseArgs();
  const report = {started_at: new Date().toISOString(), step, max_steps: maxSteps, retry_failures: retryFailures, ratios: []};
  for (const ratio of ratios) {
    const startSize = starts.get(ratio) || defaults[ratio];
    let best = startSize;
    let longEdge = longEdgeOf(startSize);
    const ratioReport = {ratio, start_size: startSize, attempts: [], best_size: best};
    for (let index = 0; index < maxSteps; index += 1) {
      longEdge += step;
      const size = sizeFromLongEdge(ratio, longEdge);
      let lastAttempt = null;
      let succeeded = false;
      for (let attemptIndex = 0; attemptIndex <= retryFailures; attemptIndex += 1) {
        const attempt = runCandidate(ratio, size);
        lastAttempt = attempt;
        ratioReport.attempts.push({size, attempt: attemptIndex + 1, report: attempt.report, result: attempt.item});
        save(report);
        if (attempt.item?.status === 'succeeded') {
          succeeded = true;
          best = size;
          ratioReport.best_size = best;
          break;
        }
      }
      if (!succeeded) {
        ratioReport.stop_size = size;
        ratioReport.stop_reason = lastAttempt?.item?.error || 'failed';
        break;
      }
    }
    report.ratios.push(ratioReport);
    save(report);
  }
  report.finished_at = new Date().toISOString();
  save(report);
  console.log(`max_probe_report=${reportPath}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
