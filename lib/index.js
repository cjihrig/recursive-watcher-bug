'use strict';
const { EventEmitter } = require('events');
const { watch } = require('fs/promises');

class FileWatcher extends EventEmitter {
  constructor(opts) {
    super();
    this.path = opts.path;
    this.handlePromise = null;
    this.abortController = null;
  }

  startWatching () {
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    const fsWatcher = watch(this.path, { signal, recursive: true });

    const eventHandler = async () => {
      for await (const { eventType, filename } of fsWatcher) {
        console.log(eventType, filename);
        this.emit('update');
      }
    /* c8 ignore next */
    }

    this.handlePromise = eventHandler();
  }

  async stopWatching () {
    this.abortController.abort();
    await this.handlePromise.catch(() => {});
  }
}

module.exports = { FileWatcher };
