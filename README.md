# Simple Message Broker

Start the broker server by running the following command:
```bash
npm start
```

You'll also need a config file. See [`examples/config.json`](examples/config.json) for an example.
Additioanlly, you need to define the schema of messages for each topic using Joi.
See [`examples/msgSchema`](examples/msgSchema) for an example.

Finally, the [`simplebroker.js`](simplebroker.js) file contains OOP API to interact with the broker server.
You can setup the parameters according to the config file.
