const fs = require("fs");
const path = require("path");
const axios = require("axios");

const BASE = "https://www.desidubanime.me";
const ANIME_ID = process.argv[2] || "1268";

const CACHE_DIR = path.join(__dirname, "data/desidubanime");
const CACHE_FILE = path.join(CACHE_DIR, `episodes-${ANIME_ID}.json`);

fs.mkdirSync(CACHE_DIR, { recursive: true });

let cache = {
  anime_wp_id: ANIME_ID,
  max_pages: 0,
  pages: {}
};

if (fs.existsSync(CACHE_FILE)) {
  cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
  console.log("Existing cache loaded:", Object.keys(cache.pages).length, "pages");
}

function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  for (let page = 1; page <= (cache.max_pages || 32); page++) {
    if (cache.pages[page]) {
      console.log(`Page ${page} already cached`);
      continue;
    }

    try {
      const response = await axios.get(`${BASE}/wp-admin/admin-ajax.php`, {
        params: {
          action: "get_episodes",
          anime_id: ANIME_ID,
          page,
          order: "desc"
        },
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 30000
      });

      if (!response.data.success) {
        console.log("Source returned unsuccessful response. Stopping.");
        break;
      }

      const data = response.data.data;
      cache.max_pages = Number(data.max_episodes_page) || cache.max_pages;
      cache.pages[page] = data.episodes || [];
      saveCache();

      console.log(`Saved page ${page}/${cache.max_pages}: ${cache.pages[page].length} episodes`);

      await sleep(5000);
    } catch (error) {
      console.log("Download stopped:", error.response?.status || error.message);
      console.log("Successful pages are saved in cache.");
      break;
    }
  }

  const count = Object.values(cache.pages).reduce((sum, p) => sum + p.length, 0);
  console.log(`Cache total: ${count} episodes from ${Object.keys(cache.pages).length} pages`);
  console.log("Cache file:", CACHE_FILE);
}

main();
