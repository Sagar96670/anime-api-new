const axios = require("axios");
const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "../../data/anime-db.json");
const SOURCE_URL = "https://blakiteapi.xyz/api/getAllAnime.php";

function normalize(item, category) {
  return {
    id: String(item.tmdbId || item.originalTmdbId),
    tmdbId: String(item.tmdbId || item.originalTmdbId),
    originalTmdbId: String(item.originalTmdbId || item.tmdbId),
    title: item.title || "",
    language: item.language || "",
    type: item.type || "",
    category,
    status: item.status || "",
    poster: item.IMAGES?.poster || "",
    backdrop: item.IMAGES?.backdrop || "",
    genres: item.TMDB_DATA?.genres || [],
    synopsis: item.TMDB_DATA?.synopsis || "",
    rating: item.TMDB_DATA?.rating || "",
    releaseDate: item.TMDB_DATA?.releaseDate || "",
    keywords: item.TMDB_DATA?.keywords || [],
    seasons: item.seasons || {},
    updated_at: new Date().toISOString()
  };
}

async function syncCatalog() {
  const response = await axios.get(SOURCE_URL, { timeout: 60000 });
  const payload = response.data;

  if (!payload || payload.success !== true || !payload.data) {
    throw new Error("Blakite catalog response invalid");
  }

  const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  if (!Array.isArray(db.anime)) db.anime = [];
  if (!Array.isArray(db.movies)) db.movies = [];
  if (!Array.isArray(db.episodes)) db.episodes = [];

  let added = 0;
  let updated = 0;

  function mergeRecords(target, source, category) {
    for (const item of Object.values(source || {})) {
      const record = normalize(item, category);
      if (!record.id || !record.title) continue;

      const index = target.findIndex(
        old => String(old.id) === record.id
      );

      if (index >= 0) {
        target[index] = { ...target[index], ...record };
        updated++;
      } else {
        target.push(record);
        added++;
      }
    }
  }

  mergeRecords(db.movies, payload.data.movies, "movies");
  mergeRecords(db.anime, payload.data.series, "series");
  mergeRecords(db.anime, payload.data.dramas, "dramas");

  db.updated_at = new Date().toISOString();

  const tempFile = DB_FILE + ".tmp";
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2));
  fs.renameSync(tempFile, DB_FILE);

  return {
    success: true,
    added,
    updated,
    movies: db.movies.length,
    anime: db.anime.length,
    episodes: db.episodes.length,
    updated_at: db.updated_at
  };
}

module.exports = { syncCatalog };
