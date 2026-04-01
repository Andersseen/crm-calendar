#!/usr/bin/env node
const { spawnSync } = require('child_process');

const project = process.env.CF_PAGES_PROJECT;
if (!project) {
  console.error('Error: CF_PAGES_PROJECT environment variable is not set.');
  process.exit(1);
}

const args = [
  '-y',
  '@cloudflare/wrangler@latest',
  'pages',
  'publish',
  './dist/web-preview',
  '--project-name',
  project,
  '--branch',
  'main',
];
const res = spawnSync('npx', args, { stdio: 'inherit' });
if (res.error) {
  console.error(res.error);
  process.exit(res.status || 1);
}
process.exit(res.status);
