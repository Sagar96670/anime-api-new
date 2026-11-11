require("dotenv").config();

const express = require("express");
const fs = require("fs");
const { syncCatalog } = require("./src/services/catalog-sync");

let catalogSyncRunning = false;

async function runScheduledSync() {
  if (catalogSyncRunning) {
    console.log("Catalog sync skipped: already running");
    return;
  }

  catalogSyncRunning = true;

  try {
    const result = await syncCatalog();
    console.log("Scheduled catalog sync completed:", result);
  } catch (error) {
    console.error("Scheduled catalog sync failed:", error.message);
  } finally {
    catalogSyncRunning = false;
  }
}

const blakite = require("./src/services/blakite");
const cors = require("cors");
const seasonStore = require("./src/storage/season-store");
const animeStore = require("./src/storage/anime-store");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/streaming.html", (req, res) => {
    res.sendFile(require("path").join(__dirname, "helloanime-streaming.html"));
});

app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "Anime API is running",
    project: "anime-api-new"
  });
});


app.get("/api/sync-history", (req, res) => {
  try {
    const historyFile = require("path").join(__dirname, "data/sync-history.json");
    let history = [];

    if (fs.existsSync(historyFile)) {
      history = JSON.parse(fs.readFileSync(historyFile, "utf8"));
    }

    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    res.json({
      status: true,
      total: history.length,
      history: history.slice(0, limit)
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/cron/sync", async (req, res) => {
  const antideployCron = req.headers["x-antideploy-cron"] === "1";
  if (!antideployCron) {
    return res.status(401).json({ status: false, message: "Unauthorized" });
  }
  try {
    if (catalogSyncRunning) return res.status(409).json({ status: false, message: "Sync already running" });
    catalogSyncRunning = true;
    try {
      const result = await syncCatalog();
      res.json(result);
    } finally {
      catalogSyncRunning = false;
    }
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// Movies Catalog API
app.get("/api/movies", async (req, res) => {
  try {
    const all = await animeStore.listAnime();
    const movies = all.filter(item => item.category === "movies");
    res.json({ status: true, total: movies.length, movies });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

app.get("/api/movies/:movieId", async (req, res) => {
  try {
    const movie = await animeStore.getAnime(req.params.movieId);
    if (!movie || movie.category !== "movies") {
      return res.status(404).json({ status: false, message: "Movie not found" });
    }
    res.json({ status: true, movie });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// Anime Catalog API
app.get("/api/anime", async (req, res) => {
  try {
    const anime = await animeStore.listAnime();
    res.json({
      status: true,
      total: anime.length,
      anime
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

app.get("/api/anime/:animeId", async (req, res) => {
  try {
    const anime = await animeStore.getAnime(req.params.animeId);
    if (!anime) {
      return res.status(404).json({ status: false, message: "Anime not found" });
    }
    res.json({ status: true, anime });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

app.get("/api/anime/:animeId/seasons", async (req, res) => {
  try {
    const animeId = req.params.animeId;
    const anime = await animeStore.getAnime(animeId);

    if (anime && anime.seasons && Object.keys(anime.seasons).length) {
      const seasons = Object.values(anime.seasons).map(item => ({
        season: Number(item.seasonNumber),
        episode_count: Number(item.totalEpisodes) || 0,
        status: item.status || null
      })).sort((a, b) => a.season - b.season);

      return res.json({
        status: true,
        anime_id: animeId,
        total_seasons: seasons.length,
        total_episodes: seasons.reduce((sum, item) => sum + item.episode_count, 0),
        seasons
      });
    }

    const seasons = [];
    for (let season = 1; season <= 50; season++) {
      const data = await seasonStore.getSeasonEpisodes(animeId, season);
      if (data) seasons.push({ season, episode_count: (data.episodes || []).length });
    }
    res.json({ status: true, anime_id: animeId, total_seasons: seasons.length, seasons });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});


// Generic Anime Season Episodes
app.get("/api/anime/:animeId/episodes", async (req, res) => {
  try {
    const animeId = req.params.animeId;
    const season = Number(req.query.season);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));

    if (!Number.isInteger(season) || season < 1) {
      return res.status(400).json({
        status: false,
        message: "Valid season parameter is required"
      });
    }

    const anime = await animeStore.getAnime(animeId);
    const saved = await seasonStore.getSeasonEpisodes(animeId, season);

    let episodes = [];

    if (saved && Array.isArray(saved.episodes) && saved.episodes.length) {
      episodes = saved.episodes;
    } else if (anime && anime.seasons && anime.seasons[String(season)]) {
      const count = Number(anime.seasons[String(season)].totalEpisodes) || 0;
      episodes = Array.from({ length: count }, (_, index) => ({
        episode_number: index + 1,
        title: "Episode " + (index + 1),
        season,
        episodeId: season + "-" + (index + 1)
      }));
    } else {
      return res.status(404).json({
        status: false,
        message: "Season not found"
      });
    }

    const start = (page - 1) * limit;

    res.json({
      status: true,
      anime_id: animeId,
      season,
      total_episodes: episodes.length,
      page,
      limit,
      total_pages: Math.ceil(episodes.length / limit),
      episodes: episodes.slice(start, start + limit)
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// Blakite Direct Video Resolver
app.get("/api/resolve/blakite/:tmdbId/:episodeId", async (req, res) => {
  try {
    const { tmdbId, episodeId } = req.params;
    const quality = req.query.quality;
    const result = await blakite.resolveEpisode(tmdbId, episodeId, quality);
    res.json({ status: true, ...result });
  } catch (error) {
    res.status(502).json({ status: false, message: error.message });
  }
});

// Blakite Download Page Resolver
app.get("/api/download/blakite/:tmdbId/:season/:episode", async (req, res) => {
  try {
    const { tmdbId, season, episode } = req.params;
    const episodeId = `${season}-${episode}`;

    const result = await blakite.resolveEpisode(tmdbId, episodeId);

    res.json({
      status: true,
      animeTitle: result.animeTitle,
      tmdbId,
      season: Number(season),
      episode: Number(episode),
      available_qualities: result.available_qualities,
      downloads: result.downloads
    });
  } catch (error) {
    res.status(502).json({ status: false, message: error.message });
  }
});

// Blakite Season/Episode Resolver
app.get("/api/resolve/blakite/:tmdbId/:season/:episode", async (req, res) => {
  try {
    const { tmdbId, season, episode } = req.params;
    const quality = req.query.quality;
    const episodeId = `${season}-${episode}`;
    const result = await blakite.resolveEpisode(tmdbId, episodeId, quality);
    res.json({ status: true, ...result });
  } catch (error) {
    res.status(502).json({ status: false, message: error.message });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Anime API running on port ${PORT}`);
    runScheduledSync();
    setInterval(runScheduledSync, 30 * 60 * 1000);
  });
}

module.exports = app;
