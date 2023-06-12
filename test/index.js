'use strict'

const os = require('os')
const { mkdtemp, writeFile } = require('fs/promises')
const { join } = require('path')
const { test } = require('tap')
const { FileWatcher } = require('..')

test('should throw an error if there is no path argument', async ({ throws, plan }) => {
  plan(1)
  throws(() => new FileWatcher({}), 'path option is required')
})

test('should emit event if file is updated', async ({ end }) => {
  const tmpDir = await mkdtemp(join(os.tmpdir(), 'plt-utils-test-'))
  const filename = join(tmpDir, 'test.file')
  const fileWatcher = new FileWatcher({ path: tmpDir })

  fileWatcher.once('update', async () => {
    await fileWatcher.stopWatching()
    end()
  })
  fileWatcher.startWatching()

  writeFile(filename, 'foobar')
})

test('should not call fs watch twice', async ({ pass, plan, end }) => {
  const tmpDir = await mkdtemp(join(os.tmpdir(), 'plt-utils-test-'))
  const filename = join(tmpDir, 'test.file')
  const fileWatcher = new FileWatcher({ path: tmpDir })

  fileWatcher.once('update', async () => {
    await fileWatcher.stopWatching()
    await fileWatcher.stopWatching()
    end()
  })
  fileWatcher.startWatching()
  fileWatcher.startWatching()

  writeFile(filename, 'foobar')
})
