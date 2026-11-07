const axios = require("axios");

const API = "https://blakiteapi.xyz";
const CDN = "https://hugh.cdn.rumble.cloud/video/";

const qualityCodes = {
  "240p": "oaa",
  "360p": "baa",
  "480p": "caa",
  "720p": "gaa",
  "1080p": "haa"
};

async function resolveEpisode(tmdbId, episodeId, requestedQuality) {
  const response = await axios.get(
    `${API}/api/get.php?id=${encodeURIComponent(episodeId)}&tmdbId=${encodeURIComponent(tmdbId)}`,
    {
      headers: {
        Referer: `${API}/embed/${tmdbId}/${episodeId}`,
        Origin: API,
        "User-Agent": "Mozilla/5.0"
      },
      timeout: 20000
    }
  );

  const data = response.data?.data;

  if (!data?.dataId) {
    throw new Error("Blakite video data unavailable");
  }

  const quality = qualityCodes[requestedQuality]
    ? requestedQuality
    : data.quality || "480p";

  const code = qualityCodes[quality];

  if (!code) {
    throw new Error("Unsupported video quality");
  }

  return {
    animeTitle: data.animeTitle,
    tmdbId: data.tmdbId,
    season: data.seasonNumber,
    episode: data.episodeNumber,
    quality,
    format: data.format,
    video_url: data.format === "MP4"
      ? `${CDN}${data.dataId}.${code}.mp4`
      : null
  };
}

module.exports = { resolveEpisode };
