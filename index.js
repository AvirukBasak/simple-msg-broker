import express from "express";
import config from "./core/config.js";
import auth from "./core/auth.js";
import consumeTopic from "./handlers/consume.js";
import produceTopic from "./handlers/produce.js";

const app = express();
app.use(express.json());

app.get("/:topic", auth.consumer, consumeTopic);
app.post("/:topic", auth.producer, produceTopic);

app.listen(
  /** @type {number} */ (config.broker.port),
  /** @type {string} */ (config.broker.host),
  () => {
    console.log(
      `Broker listening on ${config.broker.host}:${config.broker.port}`
    );
  }
);
