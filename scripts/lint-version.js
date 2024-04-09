#!/usr/bin/env node
//
// Ensure that all places the current version appears are in sync.
// It is too easy to forget to update one of them.
//
// Usage: ./scripts/lint-version.sh

const fs = require('fs');
const path = require('path');

function fatal(s) {
    console.error('lint-version: error: %s', s);
    process.exit(1);
}

const TOP = path.resolve(__dirname, '..');
const PJ = path.join(TOP, 'package.json');
const PL = path.join(TOP, 'package-lock.json');
const CHANGELOG = path.join(TOP, 'CHANGELOG.md');

const pjVer = JSON.parse(fs.readFileSync(PJ)).version;
const plVer = JSON.parse(fs.readFileSync(PL)).version;
const chVer = fs
    .readFileSync(CHANGELOG, 'utf8')
    .split('\n')
    .filter((line) => line.startsWith('##'))[1] // "## v1.2.3"
    .split('v')[1];

if (plVer === pjVer && chVer === pjVer) {
    process.exit(0);
} else {
    fatal(
        `versions do not match:
  package.json:      ${pjVer}
  package-lock.json: ${plVer}
  CHANGELOG.md:      ${chVer}`
    );
}
