const fs = require("fs");
const { saveSeasonEpisodes } = require("./src/storage/season-store");

const cache = JSON.parse(
  fs.readFileSync("data/desidubanime/episodes-1268.json", "utf8")
);

const all = Object.values(cache.pages).flat();
const unique = [...new Map(all.map(ep => [String(ep.id), ep])).values()];
const grouped = {};

for (const ep of unique) {
  const season = String(ep.anime_season || "Unknown");
  if (!grouped[season]) grouped[season] = [];
  grouped[season].push(ep);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const seasons = Object.keys(grouped).sort((a,b) => Number(a)-Number(b));

  console.log("Anime: Naruto Shippuden");
  console.log("Episodes:", unique.length);
  console.log("Seasons:", seasons.length);

  for (let i = 0; i < seasons.length; i++) {
    const season = seasons[i];
    const episodes = grouped[season];

    console.log(`Saving Season ${season}: ${episodes.length} episodes`);

    const result = await saveSeasonEpisodes(
      "naruto-shippuuden",
      season,
      episodes
    );

    console.log(`Season ${season} saved:`, result.action || "OK");

    if (i < seasons.length - 1) await sleep(10000);
  }

  console.log("Naruto Season Sync Complete");
}

main().catch(error => {
  console.error("SYNC STOPPED:", error.response?.status || error.message);
  console.error("Already saved Seasons remain safe.");
});
