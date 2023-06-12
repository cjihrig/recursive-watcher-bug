'use strict';
const { mkdtempSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { test } = require('node:test');
const { FileWatcher } = require('..');

function getTempDir() {
  return mkdtempSync(join(tmpdir(), 'repro-test-'));
}

test('should emit event if file is updated', (_, done) => {
  const tmpDir = getTempDir();
  const filename = join(tmpDir, 'test.file');
  const fileWatcher = new FileWatcher({ path: tmpDir });

  // Use a timer to keep the event loop alive. This shouldn't be needed though.
  const keepalive = setTimeout(() => {}, 20_000);

  fileWatcher.once('update', async () => {
    await fileWatcher.stopWatching();
    clearTimeout(keepalive);
    done();
  })

  fileWatcher.startWatching();
  writeFileSync(filename, 'foobar');
});
