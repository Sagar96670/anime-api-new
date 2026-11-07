const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "../../data/anime-db.json");

function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function writeDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

async function saveAnime(animeId, data) {
  const db = readDB();
  const index = db.anime.findIndex(a => a.id === animeId);

  const anime = {
    id: animeId,
    ...data,
    updated_at: new Date().toISOString()
  };

  if (index >= 0) {
    db.anime[index] = anime;
  } else {
    db.anime.push(anime);
  }

  db.updated_at = new Date().toISOString();
  writeDB(db);

  return anime;
}

async function getAnime(animeId) {
  return readDB().anime.find(a => a.id === animeId) || null;
}

async function listAnime() {
  return readDB().anime;
}

module.exports = {
  saveAnime,
  getAnime,
  listAnime
};

async function saveSeasonEpisodes(animeId, season, newEpisodes) {
  const db = readDB();
  if (!Array.isArray(db.episodes)) db.episodes = [];

  const index = db.episodes.findIndex(
    item => item.anime_id === animeId && Number(item.season) === Number(season)
  );

  const existing = index >= 0 ? db.episodes[index].episodes || [] : [];
  const episodes = new Map();

  for (const ep of existing) episodes.set(String(ep.id), ep);
  for (const ep of newEpisodes) episodes.set(String(ep.id), ep);

  const data = {
    anime_id: animeId,
    season: Number(season),
    episode_count: episodes.size,
    updated_at: new Date().toISOString(),
    episodes: [...episodes.values()].sort(
      (a, b) => Number(a.meta_number) - Number(b.meta_number)
    )
  };

  if (index >= 0) db.episodes[index] = data;
  else db.episodes.push(data);

  db.updated_at = new Date().toISOString();
  writeDB(db);
  return data;
}

async function getSeasonEpisodes(animeId, season) {
  return readDB().episodes.find(
    item => item.anime_id === animeId && Number(item.season) === Number(season)
  ) || null;
}

module.exports.saveSeasonEpisodes = saveSeasonEpisodes;
module.exports.getSeasonEpisodes = getSeasonEpisodes;
