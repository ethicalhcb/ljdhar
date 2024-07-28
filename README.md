## `ljdhar` - Le Journal du Hacker Articles Retriever

help me here ❤️ : https://patreon.com/benoitpetit

<p align="center">
    <img src="https://raw.githubusercontent.com/ethicalhcb/ljdhar/master/logo.png" alt="Logo" width="500">
</p>

This project use Puppeteer to retrieve the latest articles from Le Journal du Hacker.

### 📦 Installation

To install the project's dependencies, run the following command:

```bash
npm install ljdhar
```

### 👨‍💻 Usage

The index.ts file contains several functions that retrieve and sort articles from "Le Journal du Hacker".

- `getPostToLJDH(numStories: number)`: Retrieves the latest articles from "Le Journal du Hacker". The number of articles to retrieve is specified by numStories. Returns an array of Story objects.
- `sortedByScore(stories: Story[])`: Sorts articles by score. Takes in an array of Story objects and returns a sorted array of Story objects.
- `searchArticlesByTag(tag: string, numStories: number)`: Searches for articles by tag. Takes in a tag and the number of articles to retrieve, and returns an array of Story objects.
- `searchArticles(search: string, numStories: number)`: Searches for articles by title. Takes in a search string and the number of articles to retrieve, and returns an array of Story objects.



> Each Story object contains the details of an article, including the title, URL, score, tags, number of comments, and the author's username.

### 😄 Code Examples 

```javascript
import { getPostToLJDH, sortedByScore, searchArticlesByTag, searchArticles } from 'ljdhar';

// Get the latest 10 articles
getPostToLJDH(10).then(stories => console.log(stories));

// Get the latest 10 articles and sort them by score
getPostToLJDH(10).then(stories => {
  const sortedStories = sortedByScore(stories);
  console.log(sortedStories);
});

// Search for articles with the 'javascript' tag and retrieve the top 10
searchArticlesByTag('javascript', 10).then(stories => console.log(stories));

// Search for articles with the title containing 'hacker' and retrieve the top 10
searchArticles('hacker', 10).then(stories => console.log(stories));
```


## ⚠️ Known Issues
Error: Could not find Chrome (ver. xxx.x.xxxx.xxx). This can occur if either

> This error occurs when you don't have chrome for puppeteer installed on your machine. To fix this error run the following command:


Try these commands

```bash
node ./node_modules/ljdhar/install.js
```

### 🔗 Links:
- NPM : [https://www.npmjs.com/package/ljdhar](https://www.npmjs.com/package/ljdhar)
- Github : [https://github.com/ethicalhcb/ljdhar](https://github.com/ethicalhcb/ljdhar)

### License

This project is under the MIT license.
