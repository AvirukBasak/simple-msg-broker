import fs from "fs";
import path from "path";

import config from "./config.js";

class LRUCache {
  /**
   * @param {number} limit
   */
  constructor(limit) {
    this.limit = limit;
    this.cache = new Map();
  }

  /**
   * @param {string} key
   * @returns {any}
   */
  get(key) {
    if (!this.cache.has(key)) return null;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value); // Move to most recently used
    return value;
  }

  /**
   * @param {string} key
   * @param {any} value
   */
  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.limit) {
      const leastUsedKey = this.cache.keys().next().value;
      this.cache.delete(leastUsedKey);
    }
    this.cache.set(key, value);
  }
}

class DataStore {
  /**
   * @param {string} storefile
   */
  constructor(storefile) {
    this.cacheLimit = config.broker.cacheLimit;
    this.cache = new LRUCache(/** @type {number} */ (this.cacheLimit));

    const __filepath = path.join(process.cwd(), storefile);
    const filedir = path.dirname(__filepath) + ".store.d";
    this.filePath = path.join(filedir, path.basename(__filepath));

    this._ensureFile();
  }

  _ensureFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify({}), "utf8");
    }
  }

  _readFile() {
    return JSON.parse(fs.readFileSync(this.filePath, "utf8"));
  }

  /**
   * @param {any} data
   */
  _writeFile(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf8");
  }

  /**
   * @param {string} key
   * @param {any} value
   */
  put(key, value) {
    const data = this._readFile();
    data[key] = value;
    this._writeFile(data);
    this.cache.put(key, value);
  }

  /**
   * @param {string} key
   * @returns {any}
   */
  get(key) {
    let value = this.cache.get(key);
    if (value !== null) return value;

    const data = this._readFile();
    if (data[key] !== undefined) {
      this.cache.put(key, data[key]);
      return data[key];
    }
    return null;
  }
}

const TopicStores = {};
const ConsumerStores = {};

// create stores for each topic
const topics = Object.keys(config.topics);
for (const topic of topics) {
  const store = new DataStore(config.topics[topic].store);
  TopicStores[topic] = store;
  store.put("__lastid", 0);
}

// create store for each consumer to track ids
const consumers = Object.keys(config.consumers);
for (const consumer of consumers) {
  const store = new DataStore(config.consumers[consumer].store);
  ConsumerStores[consumer] = store;
  store.put("__lastid", 0);
}

export { LRUCache, DataStore, TopicStores, ConsumerStores };
