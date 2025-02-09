let sb = await import("./simplebroker.js");
const SimpleBroker = sb.default;
let b1 = SimpleBroker.getInstance("localhost:8080", {
  producer: { id: "producer1", secret: "prod-secret-123" },
  consumer: { id: "consumer1", secret: "cons-secret-789" },
});
let res = await b1.produce("user-updates", {});
