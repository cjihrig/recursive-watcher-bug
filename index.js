'use strict';
const { mkdtempSync, watch, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const tmpDir = mkdtempSync(join(tmpdir(), 'repro-test-'));
const filename = join(tmpDir, 'test.file');
const keepalive = setTimeout(() => {
  throw new Error('timed out');
}, 60_000);

const watcher = watch(tmpDir, { recursive: true }, (eventType, filename) => {
  clearTimeout(keepalive);
  watcher.close();
  console.log(eventType, filename);
});

setTimeout(() => {
  writeFileSync(filename, 'foobar');
}, 10_000);
