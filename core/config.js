import fs from "fs";
import path from "path";
import Joi from "joi";

/**
 * @typedef {Object} BrokerConfig
 * @property {{ [id: string]: { secret: string } }} producers
 * @property {{ [id: string]: { secret: string, store: string } }} consumers
 * @property {{ port: number | null, host: string | null, cacheLimit?: number }} broker
 * @property {{
 *   [topicName: string]: {
 *     msgSchema: string,
 *     store: string,
 *     producers: string[],
 *     consumers: string[]
 *   }
 * }} topics
 */

const configFile =
  process.env.BROKER_CONFIG || path.join(process.cwd(), "simplebroker.json");

if (!fs.existsSync(path.join(process.cwd(), configFile))) {
  console.error(
    `Config file '${configFile}' not found. Alternatively, set BROKER_CONFIG environment variable.`
  );
  process.exit(1);
}

/** @type {BrokerConfig} */
const loadedConfig = JSON.parse(fs.readFileSync(configFile, "utf8"));

// validations

const schema = Joi.object({
  producers: Joi.object()
    .allow({})
    .pattern(
      Joi.string(),
      Joi.object({
        secret: Joi.string().required(),
      })
    ),
  consumers: Joi.object()
    .allow({})
    .pattern(
      Joi.string(),
      Joi.object({
        secret: Joi.string().required(),
        store: Joi.string()
          .required()
          .pattern(/^[a-zA-Z][\/a-zA-Z0-9_\.\-]+$/),
      })
    ),
  broker: Joi.object({
    port: Joi.number().optional(),
    host: Joi.string().optional(),
    cacheLimit: Joi.number().optional(),
  }),
  topics: Joi.object()
    .allow({})
    .pattern(
      Joi.string().pattern(/^[a-zA-Z][a-zA-Z0-9\-]+$/),
      Joi.object({
        msgSchema: Joi.string()
          .required()
          .pattern(/^[a-zA-Z][\/a-zA-Z0-9_\.\-]+$/),
        store: Joi.string()
          .required()
          .pattern(/^[a-zA-Z][\/a-zA-Z0-9_\.\-]+$/),
        producers: Joi.array().items(Joi.string()).min(0).required(),
        consumers: Joi.array().items(Joi.string()).min(0).required(),
      })
    ),
});

const { error, value } = schema.validate(loadedConfig, {
  allowUnknown: false,
});

if (error) {
  throw error;
}

// Ensure topic producers/consumers are subsets of global producers/consumers
const producersSet = new Set(Object.keys(loadedConfig.producers));
const consumersSet = new Set(Object.keys(loadedConfig.consumers));
for (const topicName in loadedConfig.topics) {
  const topic = loadedConfig.topics[topicName];
  for (const producer of topic.producers) {
    if (!producersSet.has(producer)) {
      throw new Error(`Producer ${producer} not found for topic ${topicName}`);
    }
  }
  for (const consumer of topic.consumers) {
    if (!consumersSet.has(consumer)) {
      throw new Error(`Consumer ${consumer} not found for topic ${topicName}`);
    }
  }
}

/** @type {BrokerConfig} */
const config = loadedConfig;

if (!config.broker.port) {
  config.broker.port = 8080;
}

if (!config.broker.host) {
  config.broker.host = "0.0.0.0";
}

if (!config.broker.cacheLimit) {
  config.broker.cacheLimit = 1000;
}

export default config;
