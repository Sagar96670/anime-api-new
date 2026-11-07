const fs = require("fs");
const path = require("path");
const source = require("../src/services/desidubanime");
const seasonStore = require("../src/storage/season-store");
const animeStore = require("../src/storage/anime-store");

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const animeList = (await animeStore.listAnime());

  let success = 0;
  let failed = 0;
  const failedAnime = [];
  const failedFile = path.join(__dirname, "../data/failed-anime.json");

  for (const anime of animeList) {
    try {
      console.log("\nAnime:", anime.title);

      const details = await source.getAnimeDetails(anime.url);

      if (!details.episodes.length) {
        console.log("No episodes found");
        continue;
      }

      const $ = await source.fetchPage(details.episodes[0]);
      const match = $("body").html().match(/anime_id\s*=\s*(\d+)/);

      if (!match) throw new Error("Anime AJAX ID not found");

      const episodes = await source.getEpisodes(Number(match[1]));

      await seasonStore.saveSeasonEpisodes(anime.id, 1, episodes);

      console.log("Saved Season 1:", episodes.length, "Episodes");
      success++;
    } catch (error) {
      console.log("Failed:", anime.title, error.message);
      failedAnime.push({ id: anime.id, title: anime.title, url: anime.url, error: error.message });
      failed++;
    }

    await sleep(1500);
  }

  console.log("\nSYNC COMPLETE");
  console.log("Success:", success);
  console.log("Failed:", failed);
  fs.writeFileSync(failedFile, JSON.stringify(failedAnime, null, 2));
  console.log("Failed list saved:", failedFile);
})().catch(console.error);
