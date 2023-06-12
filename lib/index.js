'use strict';
const { EventEmitter } = require('events');
const { watch } = require('fs/promises');
const ALLOWED_FS_EVENTS = ['change', 'rename']

class FileWatcher extends EventEmitter {
  constructor(opts) {
    super();

    if (typeof opts.path !== 'string') {
      throw new Error('path option is required')
    }
    this.path = opts.path
    this.fsWatcher = null
    this.handlePromise = null
    this.abortController = null
    this.isWatching = false
  }

  startWatching () {
    if (this.isWatching) return
    this.isWatching = true

    this.abortController = new AbortController()
    const signal = this.abortController.signal

    const fsWatcher = watch(this.path, { signal, recursive: true })

    let updateTimeout = null

    this.on('update', () => {
      clearTimeout(updateTimeout)
      updateTimeout = null
    })

    const eventHandler = async () => {
      for await (const { eventType, filename } of fsWatcher) {
        /* c8 ignore next */
        if (filename === null) return
        const isTimeoutSet = updateTimeout === null
        const isTrackedEvent = ALLOWED_FS_EVENTS.includes(eventType)
        const isTrackedFile = this.shouldFileBeWatched(filename)

        if (isTimeoutSet && isTrackedEvent && isTrackedFile) {
          updateTimeout = setTimeout(() => this.emit('update'), 100)
          updateTimeout.unref()
        }
      }
    /* c8 ignore next */
    }

    this.handlePromise = eventHandler()
  }

  async stopWatching () {
    if (!this.isWatching) return
    this.isWatching = false

    this.abortController.abort()
    await this.handlePromise.catch(() => {})
  }

  shouldFileBeWatched (fileName) {
    return true;
  }
}

module.exports = { FileWatcher };
