import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const script = String.raw`
import json
import main
quota_body = json.dumps({
    "error": {
        "message": "insufficient balance for image generation (request id: req_429_false_positive)",
        "type": "new_api_error",
        "param": "",
        "code": "insufficient_user_quota",
    }
})
rate_body = json.dumps({
    "error": {
        "message": "rate limit exceeded",
        "type": "rate_limit_error",
        "code": "rate_limit_exceeded",
    }
})
print(json.dumps({
    "quota": main.friendly_image_error_detail(quota_body, "3840x2160", "gpt-image-2-vip"),
    "rate": main.friendly_image_error_detail(rate_body, "1024x1024", "gpt-image-2-vip"),
}, ensure_ascii=True))
`;

const raw = execFileSync('py', ['-3', '-X', 'utf8', '-c', script], { encoding: 'utf8' });
const result = JSON.parse(raw.trim().split(/\r?\n/).at(-1));

assert.match(result.quota, /insufficient balance|quota|余额|额度|预扣费/, 'insufficient quota errors should be shown as quota errors');
assert.doesNotMatch(result.quota, /限流|频繁|rate limit/i, 'quota errors with 429 in request id must not be misreported as rate limits');
assert.match(result.rate, /限流|频繁|rate limit/i, 'real rate-limit errors should still be reported as rate limits');

console.log('Image error message tests passed');
