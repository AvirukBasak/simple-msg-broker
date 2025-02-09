import fs from "fs";
import vm from "vm";
import path from "path";
import config from "./config.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

/**
 * Validate a message against a topic's schema
 * @param {string} topicName Topic name
 * @param {object} msg Message to validate
 * @returns {{ error: any | null, status: boolean }} Whether the message is valid
 */
export function validateMessage(topicName, msg) {
  const schemaFilePath = config.topics[topicName].msgSchema;
  const schemafile = path.join(process.cwd(), schemaFilePath);
  const code = fs.readFileSync(schemafile, "utf8");
  
  const sandbox = { require, module: {}, exports: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);

  const validate = sandbox.module.exports || sandbox.exports.validate;

  const { error, value } = validate(msg);
  if (error) {
    return { error: error.toString(), status: false };
  }
  return { error: null, status: true };
}
