#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const projectRoot = path.resolve(process.argv[2] ?? path.join(process.cwd(), 'contenthub'));
const packageJsonPath = path.join(projectRoot, 'package.json');
const count = 100;

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

let packageJson;
try {
  packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
} catch (error) {
  fail(`Cannot read or parse root package.json at ${packageJsonPath}: ${error.message}`);
}

const patterns = packageJson.workspaces?.packages;
if (!Array.isArray(patterns) || patterns.length === 0) {
  fail('Root package.json does not contain a non-empty workspaces.packages array');
}

const workspaceRoots = [...new Set(patterns.map((pattern) => {
  if (typeof pattern !== 'string' || pattern.trim() === '') {
    fail('Root package.json contains an invalid workspace pattern');
  }
  return pattern.trim().split('/')[0];
}))];

for (const workspaceRoot of workspaceRoots) {
  const directory = path.join(projectRoot, workspaceRoot);
  for (let index = 1; index <= count; index += 1) {
    const fixture = path.join(directory, `${workspaceRoot}_${index}`);
    await fs.rm(fixture, { recursive: true, force: true });
  }
  console.log(`✔ Removed ${count} directories from ${workspaceRoot}/`);
}

console.log(`Removed fixture directories under ${projectRoot}`);
