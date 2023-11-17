import puppeteer, { ElementHandle } from 'puppeteer';

interface Story {
  title: string;
  url: string;
  score: string;
  tags: string[];
  comments: number;
  username: string;
}

const STORY_SELECTOR = "#inside ol li";
const URL = "https://www.journalduhacker.net/newest";

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
    const authorRegex = /écrit par\s+(.+)\s+il y a/;
    const authorMatch = author.match(authorRegex);
    const username = authorMatch ? authorMatch[1] : "unknown";
    return { title, url, score, tags, comments, username };
}

/**
 * Get the latest stories from "Le Journal du Hacker"
 * @param numStories - Number of stories to retrieve
 * @returns A Story object table containing story details
 */
async function getPostToLJDH(numStories: number): Promise<Story[]> {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"], headless: "new" });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (request) => {
        if (["image", "stylesheet", "font", "medias"].includes(request.resourceType())) {
            request.abort();
        } else {
            request.continue();
        }
    });
    page.on("dialog", async (dialog) => { await dialog.dismiss(); });
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => false, });
    });

    let stories: Story[] = [];
    let currentPage = 1;
    while (stories.length < numStories) {
        const url = `https://www.journalduhacker.net/newest/page/${currentPage}`;
        await page.goto(url);
        await page.waitForSelector(STORY_SELECTOR);
        const storyElements = await page.$$(STORY_SELECTOR);
        const limitedStoryElements = storyElements.slice(0, numStories - stories.length);
        const newStories = await Promise.allSettled(limitedStoryElements.map(getStoryDetails));
        stories = stories.concat(newStories.filter(result => result.status === 'fulfilled').map(result => (result as PromiseFulfilledResult<Story>).value));
        currentPage++;
    }

    await browser.close();
    return stories.slice(0, numStories);
}

/**
 * Sort stories by score
 * @param stories - Stories to sort
 * @returns Sorted stories
 */
function sortedByScore(stories: Story[]): Story[] {
    return stories.sort((a, b) => parseInt(b.score) - parseInt(a.score));
}


/**
 * Search stories by tag
 * @param tag - Tag to search
 * @param numStories - Number of stories to retrieve 
 * @returns Stories matching the tag
 */
async function searchArticlesByTag(tag: string, numStories: number): Promise<Story[]> {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"], headless: "new"});
    const page = await browser.newPage();
    let stories: Story[] = [];
    let i = 1;
    while (stories.length < numStories) {
        const searchUrl = `https://www.journalduhacker.net/t/${tag}/page/${i}`;
        await page.goto(searchUrl);
        try {
            await page.waitForSelector(STORY_SELECTOR, { timeout: 1000 });
            const storyElements = await page.$$(STORY_SELECTOR);
            const pageStories = await Promise.all(storyElements.map(getStoryDetails));
            stories = [...stories, ...pageStories];
        } catch (error) {
            await browser.close();
            return [];
        }
        i++;
    }
    await browser.close();
    return stories.slice(0, numStories);
}

/**
 * Search stories by title
 * @param search - Search string
 * @param numStories - Number of stories to retrieve
 * @returns Stories matching the search
 */
async function searchArticles(search: string, numStories: number): Promise<Story[]> {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"], headless: "new"});
    const page = await browser.newPage();
    let stories: Story[] = [];
    let i = 1;
    while (stories.length < numStories) {
        const searchUrl = `https://www.journalduhacker.net/search?utf8=%E2%9C%93&q=${search}&what=all&order=relevance&page=${i}`;
        await page.goto(searchUrl);
        try {
            await page.waitForSelector(STORY_SELECTOR, { timeout: 1000 });
            const storyElements = await page.$$(STORY_SELECTOR);
            const pageStories = await Promise.all(storyElements.map(getStoryDetails));
            stories = [...stories, ...pageStories];
        } catch (error) {
            await browser.close();
            return [];
        }
        i++;
    }
    await browser.close();
    return stories.slice(0, numStories);
}

export { getPostToLJDH, sortedByScore, searchArticlesByTag, searchArticles };