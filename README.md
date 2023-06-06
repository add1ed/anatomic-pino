anatomic-pino
=============

An [anatomic](https://github.com/add1ed/anatomic) component for [pino](https://github.com/pinojs/pino).

## tl;dr

```js
const anatomic = require("anatomic");
const pino = require("anatomic-pino");

async function main() {
  const system = anatomic()
    .add('logger', pino()).dependsOn("config")
    .configure({ logger: { level: 'info', name: 'pizza' } });

  const { logger } = await system.start()
  logger.info({ toppings: ['olives', 'capers', 'anchovies'] }, "I love Pizza Napoli!");
  logger.flush();
}

main();
```