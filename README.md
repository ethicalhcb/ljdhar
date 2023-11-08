## `Le Journal du Hacker` Articles Retriever

[https://www.npmjs.com/package/ljdhar](https://www.npmjs.com/package/ljdhar)

This project use Puppeteer to retrieve the latest articles from Le Journal du Hacker.

### Installation

To install the project's dependencies, run the following command:

```bash
npm install ljdhar
```

### Usage

The index.ts file contains a function `getPostToLJDH(numStories: number)` that retrieves the latest numStories articles from "Le Journal du Hacker" and returns a Promise.

Here's an example of how to use it:

```typescript
import { getPostToLJDH } from "ljdhar";

getPostToLJDH(5)
  .then((stories) => {
    console.log(stories);
  })
  .catch((error: Error) => {
    console.error(error);
  });
```

This example retrieves the latest 5 articles and displays them in the console.

### Known Issues

If you encounter the Could not find Chrome error, make sure you have run npm install and check your Puppeteer cache path. For more information, refer to the Puppeteer configuration guide at https://pptr.dev/guides/configuration.

### Try these commands

```bash
npm/bun i @puppeteer/browsers
```

```bash
npm/bun install puppeteer
```

```bash
npm/bun install puppeteer-core
```

### License

This project is under the MIT license.
