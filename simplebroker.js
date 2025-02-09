let __broker = null;

class SimpleBroker {
  /** @type {string} */
  #origin = "";

  /** @type {object} */
  #producerHeaders;

  /** @type {object} */
  #consumerHeaders;

  /**
   * @param {string} origin Broker origin (domain)
   * @param {{
   *   producer?: { id: string; secret: string };
   *   consumer?: { id: string; secret: string }
   * }} config Broker configuration
   */
  constructor(origin, config) {
    this.#origin = origin;

    if (config.producer) {
      this.#producerHeaders = {
        Authorization: `${config.producer.id}:${config.producer.secret}`,
        "Content-Type": "application/json",
      };
    }

    if (config.consumer) {
      this.#consumerHeaders = {
        Authorization: `${config.consumer.id}:${config.consumer.secret}`,
        "Content-Type": "application/json",
      };
    }
  }

  /**
   * @param {string} origin Broker origin (domain)
   * @param {{
   *   producer?: { id: string; secret: string };
   *   consumer?: { id: string; secret: string }
   * }} config Broker configuration
   * @returns {SimpleBroker} Broker instance
   */
  static getInstance(origin, config) {
    if (!__broker) {
      __broker = new SimpleBroker(origin, config);
    }
    return __broker;
  }

  /**
   * @param {string} topic Topic name
   * @param {object[] | object} message Message to be produced
   * @returns {Promise<void>}
   */
  async produce(topic, message) {
    if (!this.#producerHeaders) {
      throw new Error("Producer credentials not provided");
    }

    const response = await fetch(`http://${this.#origin}/${topic}`, {
      method: "POST",
      headers: this.#producerHeaders,
      body: JSON.stringify(message),
    });
    return await response.json();
  }

  /**
   * @param {string} topic Topic name
   * @returns {Promise<object[]>} Consumed messages
   */
  async consume(topic) {
    if (!this.#consumerHeaders) {
      throw new Error("Consumer credentials not provided");
    }

    const response = await fetch(`http://${this.#origin}/${topic}`, {
      method: "GET",
      headers: this.#consumerHeaders,
    });
    return await response.json();
  }
}

export default SimpleBroker;
