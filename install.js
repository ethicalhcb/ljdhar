const { downloadBrowser } = await (async () => {
    try {
        return await import("puppeteer/internal/node/install.js");
    } catch {
        console.warn(
            "Skipping browser installation because the Puppeteer build is not available. Run `npm install` again after you have re-built Puppeteer."
        );
        process.exit(0);
    }
})();

downloadBrowser().then(() => {
    console.log("Browser downloaded successfully.");
}).catch((error) => {
    console.warn("Browser download failed", error);
});
