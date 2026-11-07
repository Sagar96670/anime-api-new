const source = require("../src/services/desidubanime");
const animeStore = require("../src/storage/anime-store");

(async () => {
  const animeList = await source.getAnimeList(1);

  console.log("Fetched:", animeList.length);

  const first = animeList[0];
  const result = await animeStore.saveAnime(first.id, first);

  console.log("Saved:", result);
  console.log("Anime:", first.title);
})().catch(console.error);
