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

  const ranges = {};
  (data.ranges || "").split("\n").forEach(line => {
    const match = line.trim().match(/^(\d+-\d+)\s*\(([^)]+)\)/);
    if (match) ranges[match[2].trim()] = match[1];
  });

  const availableQualities = data.format === "M3U8"
    ? Object.keys(qualityCodes).filter(q => ranges[q])
    : Object.keys(qualityCodes).slice(0, Math.min(data.qid || 5, 5));

  const quality = availableQualities.includes(requestedQuality)
    ? requestedQuality
    : availableQualities.includes(data.quality)
      ? data.quality
      : availableQualities[availableQualities.length - 1];

  const code = qualityCodes[quality];

  if (!code) {
    throw new Error("Unsupported video quality");
  }

  let videoUrl;

  if (data.format === "MP4") {
    videoUrl = `${CDN}${data.dataId}.${code}.mp4`;
  } else if (data.format === "M3U8") {
    const range = ranges[quality];

    if (!range) {
      throw new Error(`Quality range unavailable: ${quality}`);
    }

    videoUrl =
      `${CDN}${data.dataId}.${code}.tar` +
      `?r_file=chunklist.m3u8` +
      `&r_type=application%2Fvnd.apple.mpegurl` +
      `&r_range=${range}`;
  } else {
    throw new Error(`Unsupported video format: ${data.format}`);
  }

  const downloads = Object.fromEntries(
    availableQualities.map(q => {
      const qCode = qualityCodes[q];
      const url = data.format === "MP4"
        ? `${CDN}${data.dataId}.${qCode}.mp4`
        : `${CDN}${data.dataId}.${qCode}.tar?r_file=chunklist.m3u8&r_type=application%2Fvnd.apple.mpegurl&r_range=${ranges[q]}`;
      return [q, url];
    })
  );

  return {
    downloads,
    animeTitle: data.animeTitle,
    tmdbId: data.tmdbId,
    season: data.seasonNumber,
    episode: data.episodeNumber,
    quality,
    available_qualities: availableQualities,
    format: data.format,
    video_url: videoUrl,
    dataId: data.dataId,
    qid: data.qid,
    ranges: data.ranges || ""
  };
}

module.exports = { resolveEpisode };
