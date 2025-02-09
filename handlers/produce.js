import { validateMessage } from "../core/msgvalidator.js";
import { TopicStores } from "../core/datastore.js";

export default function produceTopic(req, res) {
  const topic = req.params.topic;
  const producer = req.headers["authorization"].split(":")[0];

  if (!topic) {
    res.status(400).json({ error: "Missing topic" });
    return;
  }

  const topicStore = TopicStores[topic];
  if (!topicStore) {
    res.status(404).json({ error: "Topic not found" });
    return;
  }

  const msg = req.body;
  msg.producer = producer;
  const { error, status } = validateMessage(topic, msg);
  if (error) {
    res.status(400).json({ error });
    return;
  }

  const lastid = topicStore.get("__lastid") || 0;
  topicStore.put(lastid, msg);
  topicStore.put("__lastid", lastid + 1);

  res.status(201).json({});
}
