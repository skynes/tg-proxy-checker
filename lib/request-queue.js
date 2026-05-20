'use strict';

/**
 * Runs async tasks with a concurrency limit (FIFO wait list).
 */
class RequestQueue {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = Math.max(1, maxConcurrent);
    this.running = 0;
    this.waiting = [];
    this._pending = 0;
  }

  get pending() {
    return this._pending;
  }

  get active() {
    return this.running;
  }

  run(fn) {
    this._pending++;
    return new Promise((resolve, reject) => {
      const execute = async () => {
        this.running++;
        try {
          resolve(await fn());
        } catch (err) {
          reject(err);
        } finally {
          this.running--;
          this._pending--;
          this._pump();
        }
      };

      if (this.running < this.maxConcurrent) {
        execute();
      } else {
        this.waiting.push(execute);
      }
    });
  }

  _pump() {
    while (this.running < this.maxConcurrent && this.waiting.length > 0) {
      const next = this.waiting.shift();
      next();
    }
  }
}

module.exports = { RequestQueue };
