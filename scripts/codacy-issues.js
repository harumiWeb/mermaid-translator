#!/usr/bin/env node
import 'dotenv/config';
import { execSync } from 'node:child_process';

/* ================================
 * Config
 * ================================ */
const BASE = 'https://api.codacy.com/api/v3';
const TOKEN = globalThis.process.env.CODACY_API_TOKEN;

if (!TOKEN) {
  console.error('CODACY_API_TOKEN is not set');
  globalThis.process.exit(1);
}

/* ================================
 * Utilities
 * ================================ */
const LEVEL_PRIORITY = {
  Error: 4,
  High: 3,
  Warning: 2,
  Info: 1,
};

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
  const args = {
    minLevel: 'Info',
  };

  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === '--pr') {
      if (i + 1 >= argv.length) {
        console.error('Missing value for --pr');
        globalThis.process.exit(1);
      }
      args.pr = argv[++i];
    } else if (v === '--min-level') {
      if (i + 1 >= argv.length) {
        console.error('Missing value for --min-level');
        globalThis.process.exit(1);
      }
      args.minLevel = argv[++i];
    } else if (v === '--provider') {
      if (i + 1 >= argv.length) {
        console.error('Missing value for --provider');
        globalThis.process.exit(1);
      }
      args.provider = argv[++i];
    } else if (!args.org) {
      args.org = v;
    } else if (!args.repo) {
      args.repo = v;
    }
  }

  return args;
}

async function fetchJSON(url, method = 'GET', body) {
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

  const res = await fetch(url, options);

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
  const url =
    `${BASE}/analysis/organizations/${provider}/${org}` +
    `/repositories/${repo}/issues/search?limit=${limit}`;

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
  const url =
    `${BASE}/analysis/organizations/${provider}/${org}` +
    `/repositories/${repo}/pull-requests/${pr}/issues?status=${status}&limit=${limit}`;

  return fetchJSON(url);
}

/* ================================
 * AI Output Formatter
 * ================================ */
function formatForAI(rawIssues, minLevel) {
  const minPriority = LEVEL_PRIORITY[minLevel];
  if (minPriority === undefined) {
    console.error(
      `Invalid --min-level: ${minLevel}. Valid values: ${Object.keys(
        LEVEL_PRIORITY
      ).join(', ')}`
    );
    globalThis.process.exit(1);
  }

  return rawIssues
    .map((i) => i.commitIssue ?? i)
    .filter((i) => LEVEL_PRIORITY[i.patternInfo?.level] >= minPriority)
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

  if (!args.org || !args.repo) {
    console.error(
      'Usage:\n' +
        '  node codacy-issues.js <org> <repo> [--pr <number>] [--min-level Error|High|Warning|Info]'
    );
    globalThis.process.exit(1);
  }

  const limit = 100;

  const result = args.pr
    ? await fetchPrIssues({
        provider: args.provider,
        org: args.org,
        repo: args.repo,
        pr: args.pr,
        limit,
      })
    : await fetchRepoIssues({
        provider: args.provider,
        org: args.org,
        repo: args.repo,
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
