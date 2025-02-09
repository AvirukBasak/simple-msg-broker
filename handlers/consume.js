import config from "../core/config.js";
import { TopicStores, ConsumerStores } from "../core/datastore.js";

export default function consumeTopic(req, res) {
  const topic = req.params.topic;
  const consumer = req.headers["authorization"].split(":")[0];

  if (config.topics[topic].consumers.includes(consumer) === false) {
    res.status(400).json({ error: "Invalid topic" });
    return;
  }

  if (!topic) {
    res.status(400).json({ error: "Missing topic" });
    return;
  }

  const topicStore = TopicStores[topic];
  if (!topicStore) {
    res.status(404).json({ error: "Topic not found" });
    return;
  }

  const consumerStore = ConsumerStores[consumer];
  if (!consumerStore) {
    res.status(404).json({ error: "Consumer not found" });
    return;
  }

  const lastid = consumerStore.get("__lastid") || 0;
  const lastmsg = topicStore.get(lastid);
  if (!lastmsg) {
    res.status(204).json({ message: "No new messages" });
    return;
  }
  res.status(200).json(lastmsg);
  consumerStore.put("__lastid", lastid + 1);
}
