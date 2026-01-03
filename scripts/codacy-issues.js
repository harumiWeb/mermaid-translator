#!/usr/bin/env node
import 'dotenv/config';
import { execSync } from 'node:child_process';

/* ================================
 * Config
 * ================================ */
const BASE = 'https://api.codacy.com/api/v3';
const BASE_URL = new URL(BASE);
const BASE_PATH = BASE_URL.pathname.replace(/\/$/, '');
const TOKEN = globalThis.process.env.CODACY_API_TOKEN;

if (!TOKEN) {
  console.error('CODACY_API_TOKEN is not set');
  globalThis.process.exit(1);
}

/* ================================
 * Utilities
 * ================================ */
const LEVELS = ['Error', 'High', 'Warning', 'Info'];

function getLevelPriority(level) {
  switch (level) {
    case 'Error':
      return 4;
    case 'High':
      return 3;
    case 'Warning':
      return 2;
    case 'Info':
      return 1;
    default:
      return undefined;
  }
}

function normalizeProvider(value) {
  if (value === 'gh' || value === 'gl' || value === 'bb') {
    return value;
  }
  return undefined;
}

function assertValidSegment(name, value, pattern) {
  if (!value || !pattern.test(value)) {
    console.error(`Invalid ${name}: ${value}`);
    globalThis.process.exit(1);
  }
  return value;
}

function assertValidChoice(name, value, choices) {
  if (!choices.includes(value)) {
    console.error(
      `Invalid ${name}: ${value}. Valid values: ${choices.join(', ')}`
    );
    globalThis.process.exit(1);
  }
  return value;
}

function encodeSegment(value) {
  return encodeURIComponent(value);
}

function buildCodacyUrl(pathname) {
  const url = new URL(BASE_URL.origin);
  url.pathname = `${BASE_PATH}${pathname}`;
  return url;
}

function assertCodacyUrl(url) {
  const expectedPrefix = `${BASE_PATH}/analysis/`;
  if (
    url.origin !== BASE_URL.origin ||
    !url.pathname.startsWith(expectedPrefix)
  ) {
    console.error(`Invalid URL: ${url}`);
    globalThis.process.exit(1);
  }
  return url;
}

function buildRepoIssuesUrl({ provider, org, repo, limit }) {
  const url = buildCodacyUrl(
    `/analysis/organizations/${encodeSegment(provider)}/${encodeSegment(
      org
    )}/repositories/${encodeSegment(repo)}/issues/search`
  );
  url.searchParams.set('limit', String(limit));
  return url;
}

function buildPrIssuesUrl({ provider, org, repo, pr, limit, status }) {
  const url = buildCodacyUrl(
    `/analysis/organizations/${encodeSegment(provider)}/${encodeSegment(
      org
    )}/repositories/${encodeSegment(repo)}/pull-requests/${encodeSegment(
      pr
    )}/issues`
  );
  url.searchParams.set('status', status);
  url.searchParams.set('limit', String(limit));
  return url;
}

function getGitOriginUrl() {
  try {
    // Git リポジトリ判定
    execSync('git rev-parse --is-inside-work-tree', {
      stdio: 'ignore',
    });

    // origin URL 取得
    return execSync('git remote get-url origin', {
      encoding: 'utf8',
    }).trim();
  } catch {
    return null;
  }
}

function parseGitRemote(url) {
  // HTTPS
  let m = url.match(/^https?:\/\/([^/]+)\/([^/]+)\/([^/]+?)(?:\.git)?$/);

  // SSH
  if (!m) {
    m = url.match(/^git@([^:]+):([^/]+)\/([^/]+?)(?:\.git)?$/);
  }

  if (!m) {
    return null;
  }

  const host = m[1];
  const org = m[2];
  const repo = m[3];

  const isSameOrSubdomain = (hostname, baseDomain) =>
    hostname === baseDomain || hostname.endsWith('.' + baseDomain);

  let provider;
  if (isSameOrSubdomain(host, 'github.com')) {
    provider = 'gh';
  } else if (isSameOrSubdomain(host, 'gitlab.com')) {
    provider = 'gl';
  } else if (isSameOrSubdomain(host, 'bitbucket.org')) {
    provider = 'bb';
  } else {
    provider = 'unknown';
  }

  return { provider, org, repo };
}

function parseArgs(argv) {
  let org;
  let repo;
  let pr;
  let provider;
  let minLevel = 'Info';

  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === '--pr') {
      if (i + 1 >= argv.length) {
        console.error('Missing value for --pr');
        globalThis.process.exit(1);
      }
      pr = argv[++i];
    } else if (v === '--min-level') {
      if (i + 1 >= argv.length) {
        console.error('Missing value for --min-level');
        globalThis.process.exit(1);
      }
      minLevel = argv[++i];
    } else if (v === '--provider') {
      if (i + 1 >= argv.length) {
        console.error('Missing value for --provider');
        globalThis.process.exit(1);
      }
      provider = argv[++i];
    } else if (!org) {
      org = v;
    } else if (!repo) {
      repo = v;
    }
  }

  return {
    org,
    repo,
    pr,
    provider,
    minLevel,
  };
}

async function fetchJSON(url, method = 'GET', body) {
  const safeUrl = assertCodacyUrl(url);
  const options = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'api-token': TOKEN,
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(safeUrl, options);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return res.json();
}

/* ================================
 * API
 * ================================ */
async function fetchRepoIssues({ provider, org, repo, limit }) {
  const url = buildRepoIssuesUrl({ provider, org, repo, limit });
  return fetchJSON(url, 'POST', {});
}

async function fetchPrIssues({
  provider,
  org,
  repo,
  pr,
  limit,
  status = 'all',
}) {
  const url = buildPrIssuesUrl({ provider, org, repo, pr, limit, status });
  return fetchJSON(url);
}

/* ================================
 * AI Output Formatter
 * ================================ */
function formatForAI(rawIssues, minLevel) {
  const minPriority = getLevelPriority(minLevel);
  if (minPriority === undefined) {
    console.error(
      `Invalid --min-level: ${minLevel}. Valid values: ${LEVELS.join(', ')}`
    );
    globalThis.process.exit(1);
  }

  return rawIssues
    .map((i) => i.commitIssue ?? i)
    .filter((i) => {
      const levelPriority = getLevelPriority(i.patternInfo?.level);
      return levelPriority !== undefined && levelPriority >= minPriority;
    })
    .map((i) => {
      const level = i.patternInfo.level;
      const file = i.filePath;
      const line = i.lineNumber;
      const rule = i.patternInfo.id;
      const category = i.patternInfo.category;
      const message = i.message;

      return `${level} | ${file}:${line} | ${rule} | ${category} | ${message}`;
    });
}

/* ================================
 * Main
 * ================================ */
async function main() {
  const args = parseArgs(globalThis.process.argv.slice(2));

  // --- Git 自動検出 ---
  if (!args.org || !args.repo) {
    const originUrl = getGitOriginUrl();
    if (originUrl) {
      const parsed = parseGitRemote(originUrl);
      if (parsed) {
        args.provider ??= parsed.provider;
        args.org ??= parsed.org;
        args.repo ??= parsed.repo;
      }
    }
  }

  args.provider ??= 'gh';

  const provider = normalizeProvider(args.provider);
  if (!provider) {
    console.error('Invalid --provider: use gh, gl, or bb');
    globalThis.process.exit(1);
  }

  if (!args.org || !args.repo) {
    console.error(
      'Usage:\n' +
        '  node codacy-issues.js ORG REPO [--pr NUMBER] [--min-level Error|High|Warning|Info]'
    );
    globalThis.process.exit(1);
  }

  const segmentPattern = /^[A-Za-z0-9_.-]+$/;
  const org = assertValidSegment('org', args.org, segmentPattern);
  const repo = assertValidSegment('repo', args.repo, segmentPattern);
  const pr =
    args.pr === undefined
      ? undefined
      : assertValidSegment('pr', args.pr, /^[0-9]+$/);

  const status = assertValidChoice('status', 'all', ['all', 'open', 'closed']);

  const limit = 100;

  const result = args.pr
    ? await fetchPrIssues({
        provider,
        org,
        repo,
        pr,
        limit,
        status,
      })
    : await fetchRepoIssues({
        provider,
        org,
        repo,
        limit,
      });

  const issues = result.data ?? [];

  const formatted = formatForAI(issues, args.minLevel);

  globalThis.process.stdout.write(
    `${JSON.stringify(
      {
        scope: args.pr ? 'pull_request' : 'repository',
        organization: args.org,
        repository: args.repo,
        pullRequest: args.pr ?? null,
        minLevel: args.minLevel,
        total: formatted.length,
        issues: formatted,
      },
      null,
      2
    )}\n`
  );
}

main().catch((err) => {
  console.error(err.message);
  setTimeout(() => globalThis.process.exit(1), 0);
});
