const axios = require("axios");
const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "../../data/anime-db.json");
const HISTORY_FILE = path.join(__dirname, "../../data/sync-history.json");
const SOURCE_URL = "https://blakiteapi.xyz/api/getAllAnime.php";

function saveHistory(entry) {
  let history = [];

  try {
    history = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
    if (!Array.isArray(history)) history = [];
  } catch {}

  history.unshift(entry);
  history = history.slice(0, 500);

  const temp = HISTORY_FILE + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(history, null, 2));
  fs.renameSync(temp, HISTORY_FILE);
}

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
  try {
    const response = await axios.get(
      SOURCE_URL + "?t=" + Date.now(),
      {
        timeout: 60000,
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      }
    );

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
          const existing = target[index];
          const merged = { ...existing, ...record };

          if (existing.seasons && record.seasons) {
            merged.seasons = { ...record.seasons };

            for (const [seasonKey, oldSeason] of Object.entries(existing.seasons)) {
              const newSeason = merged.seasons[seasonKey];

              if (newSeason) {
                merged.seasons[seasonKey] = {
                  ...oldSeason,
                  ...newSeason,
                  totalEpisodes: Math.max(
                    Number(oldSeason.totalEpisodes) || 0,
                    Number(newSeason.totalEpisodes) || 0
                  )
                };
              } else {
                merged.seasons[seasonKey] = oldSeason;
              }
            }
          }

          target[index] = merged;
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

    const result = {
      success: true,
      added,
      updated,
      movies: db.movies.length,
      anime: db.anime.length,
      episodes: db.episodes.length,
      updated_at: db.updated_at
    };

    saveHistory({
      time: result.updated_at,
      status: "success",
      ...result
    });

    return result;
  } catch (error) {
    try {
      saveHistory({
        time: new Date().toISOString(),
        status: "failed",
        error: error.message
      });
    } catch (historyError) {
      console.error("Sync history save failed:", historyError.message);
    }

    throw error;
  }
}

module.exports = { syncCatalog };
