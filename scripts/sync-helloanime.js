const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API = "https://blakiteapi.xyz/api/getAllAnime.php";
const DB_FILE = path.join(__dirname, "../data/anime-db.json");

async function main() {
  console.log("HelloAnime catalog fetching...");
  const response = await axios.get(API, { timeout: 60000 });
  const source = response.data?.data;

  if (!response.data?.success || !source) {
    throw new Error("HelloAnime catalog unavailable");
  }

  const anime = [];
  const movies = [];

  for (const category of ["series", "dramas", "movies"]) {
    for (const item of Object.values(source[category] || {})) {
      const tmdb = item.TMDB_DATA || {};
      const images = item.IMAGES || {};
      const id = String(item.tmdbId || item.originalTmdbId);

      const record = {
        id,
        tmdbId: id,
        originalTmdbId: String(item.originalTmdbId || id),
        title: item.title,
        language: item.language || null,
        type: item.type || category,
        category,
        status: item.status || null,
        poster: images.poster || null,
        backdrop: images.backdrop || null,
        genres: tmdb.genres || [],
        synopsis: tmdb.synopsis || "",
        rating: tmdb.rating || null,
        releaseDate: tmdb.releaseDate || null,
        keywords: tmdb.keywords || [],
        seasons: item.seasons || {},
        updated_at: new Date().toISOString()
      };

      anime.push(record);
      if (category === "movies") movies.push(record);
    }
  }

  if (!anime.length) throw new Error("Empty catalog; DB not changed");

  const old = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  const db = {
    anime,
    episodes: old.episodes || [],
    movies,
    updated_at: new Date().toISOString()
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  console.log("SYNC SUCCESS");
  console.log("Anime/Series/Dramas:", anime.length);
  console.log("Movies:", movies.length);
  console.log("Episode records preserved:", db.episodes.length);
  console.log("Database:", DB_FILE);
}

main().catch(error => {
  console.error("SYNC FAILED:", error.message);
  process.exit(1);
});
