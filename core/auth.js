import config from "./config.js";

function consumer(req, res, next) {
  // get authorization header
  const authHeader = req.headers["authorization"];
  // split at ':'
  const [id, secret] = authHeader.split(":");
  // check if id and secret are correct
  if (Object.hasOwn(config.consumers, id) && config.consumers[id].secret === secret) {
    // call next middleware
    next();
  } else {
    // unauthorized
    res.status(401).json({ error: "Unauthorized" });
  }
}

function producer(req, res, next) {
  // get authorization header
  const authHeader = req.headers["authorization"];
  // split at ':'
  const [id, secret] = authHeader.split(":");
  // check if id and secret are correct
  if (Object.hasOwn(config.producers, id) && config.producers[id].secret === secret) {
    // call next middleware
    next();
  } else {
    // unauthorized
    res.status(401).json({ error: "Unauthorized" });
  }
}

export default { consumer, producer };
