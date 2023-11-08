import puppeteer from 'puppeteer';

interface Story {title: string;url: string;score: string;tags: string[];comments: number;username: string;}

export default async function getPostToLJDH(numStories: number): Promise<Story[]> {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"], headless: "new" });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (request) => {if (["image", "stylesheet", "font", "medias"].includes(request.resourceType())) {request.abort();} else {request.continue();}});
    page.on("dialog", async (dialog) => {await dialog.dismiss();});
    await page.evaluateOnNewDocument(() => {Object.defineProperty(navigator, "webdriver", {get: () => false,});});
    await page.goto("https://www.journalduhacker.net/newest");
    await page.waitForSelector("#inside ol li");
    const storyElements = await page.$$("#inside ol li");
    const limitedStoryElements = storyElements.slice(0, numStories);
    const stories = await Promise.all(limitedStoryElements.map(async (storyElement) => {
        const title = await storyElement.$eval(".link a", (a) => a.textContent);
        const url = await storyElement.$eval(".link a", (a) => a.href);
        const score = await storyElement.$eval(".score", (div) => div.textContent);
        const tags = await storyElement.$$eval(".tags a", (as) => as.map((a) => a.textContent));
        const author = await storyElement.$eval(".byline", (a) => a.textContent.trim());
        const authorRegex = /écrit par\s+(.+)\s+il y a/;
        const authorMatch = author.match(authorRegex);
        const username = authorMatch ? authorMatch[1] : "anonyme";
        const comments = await storyElement.$eval(".comments_label a", (a) => {
            const match = a.textContent.match(/(\d+)/);
            return match ? parseInt(match[1]) : 0;
        });
        return { title, url, score, tags, comments, username };
    }));
    await browser.close();
    return stories;
}