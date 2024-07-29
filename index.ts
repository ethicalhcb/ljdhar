import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer';

interface Story {
  title: string;
  url: string;
  score: string;
  tags: string[];
  comments: number;
  username: string;
}

const STORY_SELECTOR = "#inside ol li";
const BASE_URL = "https://www.journalduhacker.net";

/**
 * Sets up and launches a new browser instance.
 * @returns {Promise<Browser>} A promise that resolves to a Browser instance.
 */
async function setupBrowser(): Promise<Browser> {
  return await puppeteer.launch({ args: ["--no-sandbox"], headless: "new" });
}

/**
 * Sets up a new page in the browser with specific configurations.
 * @param {Browser} browser - The browser instance to create the page in.
 * @returns {Promise<Page>} A promise that resolves to a configured Page instance.
 */
async function setupPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (["image", "stylesheet", "font", "media"].includes(request.resourceType())) {
      request.abort();
    } else {
      request.continue();
    }
  });
  page.on("dialog", async (dialog) => { await dialog.dismiss(); });
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });
  return page;
}

/**
 * Extracts story details from a given story element.
 * @param {ElementHandle} storyElement - The element handle containing story information.
 * @returns {Promise<Story>} A promise that resolves to a Story object.
 */
async function getStoryDetails(storyElement: ElementHandle): Promise<Story> {
    const [title, url, score, tags, author, comments] = await Promise.all([
        storyElement.$eval(".link a", (a) => a.textContent?.trim() ?? ''),
        storyElement.$eval(".link a", (a) => a.href),
        storyElement.$eval(".score", (div) => div.textContent?.trim() ?? ''),
        storyElement.$$eval(".tags a", (as) => as.map((a) => a.textContent?.trim() ?? '')),
        storyElement.$eval(".byline", (a) => a?.textContent?.trim() ?? ''),
        storyElement.$eval(".comments_label a", (a) => {
            const match = a.textContent?.match(/(\d+)/);
            return match ? parseInt(match[1]) : 0;
        })
    ]);
  const username = author.match(/écrit par\s+(.+)\s+il y a/)?.[1] || "unknown";
  return { title, url, score, tags, comments, username };
}

/**
 * Scrapes stories from a given page URL.
 * @param {Page} page - The page instance to use for scraping.
 * @param {string} url - The URL of the page to scrape.
 * @param {number} numStories - The number of stories to scrape.
 * @returns {Promise<Story[]>} A promise that resolves to an array of Story objects.
 */
async function scrapeStories(page: Page, url: string, numStories: number): Promise<Story[]> {
  await page.goto(url);
  await page.waitForSelector(STORY_SELECTOR);
  const storyElements = await page.$$(STORY_SELECTOR);
  const limitedStoryElements = storyElements.slice(0, numStories);
  return await Promise.all(limitedStoryElements.map(getStoryDetails));
}

/**
 * Retrieves the latest posts from "Le Journal du Hacker".
 * @param {number} numStories - The number of stories to retrieve.
 * @returns {Promise<Story[]>} A promise that resolves to an array of Story objects.
 */
async function getPostToLJDH(numStories: number): Promise<Story[]> {
  const browser = await setupBrowser();
  const page = await setupPage(browser);
  let stories: Story[] = [];
  let currentPage = 1;

  while (stories.length < numStories) {
    const url = `${BASE_URL}/newest/page/${currentPage}`;
    const newStories = await scrapeStories(page, url, numStories - stories.length);
    stories = stories.concat(newStories);
    currentPage++;
  }

  await browser.close();
  return stories.slice(0, numStories);
}

/**
 * Sorts an array of stories by their score in descending order.
 * @param {Story[]} stories - The array of stories to sort.
 * @returns {Story[]} A new array of stories sorted by score.
 */
function sortedByScore(stories: Story[]): Story[] {
  return stories.sort((a, b) => parseInt(b.score) - parseInt(a.score));
}

/**
 * Searches for articles by a specific tag.
 * @param {string} tag - The tag to search for.
 * @param {number} numStories - The number of stories to retrieve.
 * @returns {Promise<Story[]>} A promise that resolves to an array of Story objects.
 */
async function searchArticlesByTag(tag: string, numStories: number): Promise<Story[]> {
  const browser = await setupBrowser();
  const page = await setupPage(browser);
  let stories: Story[] = [];
  let currentPage = 1;

  while (stories.length < numStories) {
    const url = `${BASE_URL}/t/${tag}/page/${currentPage}`;
    try {
      const newStories = await scrapeStories(page, url, numStories - stories.length);
      if (newStories.length === 0) break;
      stories = stories.concat(newStories);
    } catch (error) {
      break;
    }
    currentPage++;
  }

  await browser.close();
  return stories.slice(0, numStories);
}

/**
 * Searches for articles based on a search query.
 * @param {string} search - The search query.
 * @param {number} numStories - The number of stories to retrieve.
 * @returns {Promise<Story[]>} A promise that resolves to an array of Story objects.
 */
async function searchArticles(search: string, numStories: number): Promise<Story[]> {
  const browser = await setupBrowser();
  const page = await setupPage(browser);
  let stories: Story[] = [];
  let currentPage = 1;

  while (stories.length < numStories) {
    const url = `${BASE_URL}/search?utf8=%E2%9C%93&q=${encodeURIComponent(search)}&what=all&order=relevance&page=${currentPage}`;
    try {
      const newStories = await scrapeStories(page, url, numStories - stories.length);
      if (newStories.length === 0) break;
      stories = stories.concat(newStories);
    } catch (error) {
      break;
    }
    currentPage++;
  }

  await browser.close();
  return stories.slice(0, numStories);
}

export { getPostToLJDH, sortedByScore, searchArticlesByTag, searchArticles };